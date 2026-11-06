const User = require('../models/User');
const Preference = require('../models/Preference');
const ConsentLog = require('../models/ConsentLog');
const PrivacyNotice = require('../models/PrivacyNotice');
const ConsentRecord = require('../models/ConsentRecord');
const AuditVerification = require('../models/AuditVerification');
const Webhook = require('../models/Webhook');
const DsarRequest = require('../models/DsarRequest');
const ApiKey = require('../models/ApiKey');
const CookieInventory = require('../models/CookieInventory');
const crypto = require('crypto');
const { withTransaction, getDbStatus } = require('../config/db');
const { appendAuditEvent, verifyAuditChainIntegrity } = require('../services/auditService');
const { createNoticeSchema } = require('../utils/validators');
const { ensureCookieInventory, scanDomainAndCatalog } = require('../services/cookieInventoryService');
const { dispatchWebhookEvent } = require('../services/webhookService');

// GET /api/admin/dashboard (also supports user enterprise dashboard metrics)
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalConsentRecords,
      allPreferences,
      totalAuditEvents,
      activeNotice,
      recentAuditActivity,
      allNotices,
      latestVerification,
      verificationHistory,
    ] = await Promise.all([
      User.countDocuments(),
      ConsentRecord.countDocuments(),
      Preference.find().lean(),
      ConsentLog.countDocuments(),
      PrivacyNotice.findOne({ isActive: true }).lean(),
      ConsentLog.find()
        .populate('userId', 'name email role organization')
        .sort({ sequenceNumber: -1 })
        .limit(8)
        .lean(),
      PrivacyNotice.find().sort({ publicationDate: -1 }).lean(),
      AuditVerification.findOne().sort({ verificationDate: -1 }).lean(),
      AuditVerification.find().sort({ verificationDate: -1 }).limit(10).lean(),
    ]);

    // Calculate active & withdrawn consent counts across all preference categories
    let activeConsentsCount = 0;
    let withdrawnConsentsCount = 0;
    let disabledConsentsCount = 0;

    const categoryTotals = {
      essential: 0,
      analytics: 0,
      marketing: 0,
      personalization: 0,
      thirdPartySharing: 0,
    };

    for (const pref of allPreferences) {
      categoryTotals.essential += 1;
      activeConsentsCount += 1; // essential is always active

      ['analytics', 'marketing', 'personalization', 'thirdPartySharing'].forEach((key) => {
        if (pref[key]) {
          categoryTotals[key] += 1;
          activeConsentsCount += 1;
        } else {
          disabledConsentsCount += 1;
          if (pref.categoryMeta?.[key]?.status === 'Withdrawn') {
            withdrawnConsentsCount += 1;
          }
        }
      });
    }

    // Also include explicit Consent Withdrawn events from ConsentLog
    const auditWithdrawalsCount = await ConsentLog.countDocuments({
      action: 'Consent Withdrawn',
    });

    // Consent Distribution Pie Chart Data
    const consentDistribution = [
      { name: 'Essential Cookies', value: categoryTotals.essential, color: '#0f766e' },
      { name: 'Analytics Cookies', value: categoryTotals.analytics, color: '#10b981' },
      { name: 'Marketing Cookies', value: categoryTotals.marketing, color: '#0284c7' },
      { name: 'Personalization', value: categoryTotals.personalization, color: '#f59e0b' },
      { name: 'Third-Party Sharing', value: categoryTotals.thirdPartySharing, color: '#e11d48' },
    ];

    const statusDistribution = [
      { name: 'Active / Granted', value: activeConsentsCount, color: '#10b981' },
      { name: 'Withdrawn', value: Math.max(withdrawnConsentsCount, auditWithdrawalsCount), color: '#f43f5e' },
      { name: 'Opted-Out (Default)', value: Math.max(0, disabledConsentsCount - withdrawnConsentsCount), color: '#71717a' },
    ];

    // Build 7-day Consent Activity Line Chart Data from actual ConsentLog records
    const allLogsForChart = await ConsentLog.find()
      .select('timestamp action')
      .sort({ timestamp: 1 })
      .lean();

    const dayBuckets = new Map();
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const key = d.toISOString().slice(0, 10);
      dayBuckets.set(key, {
        date: label,
        grants: 0,
        withdrawals: 0,
        noticeAcceptances: 0,
        total: 0,
      });
    }

    for (const log of allLogsForChart) {
      const logKey = new Date(log.timestamp).toISOString().slice(0, 10);
      if (dayBuckets.has(logKey)) {
        const bucket = dayBuckets.get(logKey);
        bucket.total += 1;
        if (
          log.action === 'Consent Granted' ||
          log.action === 'Bulk Consent Accepted' ||
          log.action === 'Initial Registration Defaults'
        ) {
          bucket.grants += 1;
        } else if (
          log.action === 'Consent Withdrawn' ||
          log.action === 'Optional Preferences Rejected'
        ) {
          bucket.withdrawals += 1;
        } else if (log.action === 'Notice Accepted') {
          bucket.noticeAcceptances += 1;
        }
      }
    }

    const consentActivitySeries = Array.from(dayBuckets.values());

    res.status(200).json({
      success: true,
      metrics: {
        totalRegisteredUsers: totalUsers,
        totalConsentRecords,
        activeConsentPreferences: activeConsentsCount,
        withdrawnConsents: Math.max(withdrawnConsentsCount, auditWithdrawalsCount),
        totalAuditEvents,
        currentNoticeVersion: activeNotice ? activeNotice.version : '2.0',
        auditIntegrityStatus: latestVerification
          ? latestVerification.verificationStatus
          : 'Verified',
      },
      charts: {
        consentDistribution,
        statusDistribution,
        consentActivitySeries,
      },
      recentAuditActivity,
      latestNotices: allNotices.slice(0, 3),
      latestVerification,
      verificationHistory,
      dbStatus: getDbStatus(),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
const getAllUsersWithConsent = async (req, res, next) => {
  try {
    const [users, preferences, consentRecords, auditCounts, activeNotice] = await Promise.all([
      User.find().sort({ createdAt: -1 }).lean(),
      Preference.find().lean(),
      ConsentRecord.find().sort({ acceptedAt: -1 }).lean(),
      ConsentLog.aggregate([
        { $group: { _id: '$userId', totalEvents: { $sum: 1 }, lastEvent: { $max: '$timestamp' } } },
      ]),
      PrivacyNotice.findOne({ isActive: true }).lean(),
    ]);

    const prefMap = new Map(preferences.map((p) => [String(p.userId), p]));
    const auditMap = new Map(auditCounts.map((a) => [String(a._id), a]));

    const enrichedUsers = users.map((u) => {
      const uid = String(u._id);
      const pref = prefMap.get(uid) || {
        essential: true,
        analytics: false,
        marketing: false,
        personalization: false,
        thirdPartySharing: false,
      };
      const userRecords = consentRecords.filter((r) => String(r.userId) === uid);
      const acceptedActive = activeNotice
        ? userRecords.some(
            (r) => r.noticeVersion === activeNotice.version && r.status !== 'Pending Renewal'
          )
        : true;
      const auditSummary = auditMap.get(uid) || { totalEvents: 0, lastEvent: u.createdAt };

      const enabledCount = [
        true,
        pref.analytics,
        pref.marketing,
        pref.personalization,
        pref.thirdPartySharing,
      ].filter(Boolean).length;

      return {
        ...u,
        preferences: {
          essential: true,
          analytics: Boolean(pref.analytics),
          marketing: Boolean(pref.marketing),
          personalization: Boolean(pref.personalization),
          thirdPartySharing: Boolean(pref.thirdPartySharing),
          enabledCount,
          totalCategories: 5,
        },
        activeNoticeVersion: activeNotice ? activeNotice.version : '2.0',
        acceptedActiveNotice: acceptedActive,
        latestConsentRecord: userRecords[0] || null,
        auditEventCount: auditSummary.totalEvents,
        lastActivityAt: auditSummary.lastEvent || u.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      total: enrichedUsers.length,
      users: enrichedUsers,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/notices
const publishPrivacyNotice = async (req, res, next) => {
  try {
    const validated = createNoticeSchema.parse(req.body);

    const existing = await PrivacyNotice.findOne({ version: validated.version });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Privacy Notice version '${validated.version}' already exists.`,
      });
    }

    const activateImmediately = Boolean(validated.isActive);
    const now = new Date();
    let createdNotice;

    await withTransaction(async (session) => {
      if (activateImmediately) {
        await PrivacyNotice.updateMany(
          { isActive: true },
          { $set: { isActive: false, status: 'Archived' } },
          session ? { session } : {}
        );
      }

      const defaultClauses =
        validated.clauses && validated.clauses.length > 0
          ? validated.clauses
          : [
              {
                clauseId: 'CL-01',
                heading: '1. Data Controller & Enterprise Governance Scope',
                body: validated.content.slice(0, 350),
                category: 'General',
              },
              {
                clauseId: 'CL-02',
                heading: '2. Essential & Optional Processing Categories',
                body: validated.summaryOfChanges,
                category: 'Analytics',
              },
              {
                clauseId: 'CL-03',
                heading: '3. Cryptographic Audit Trail & Data Subject Rights',
                body: 'All consent grants, customizations, and withdrawals are logged in an append-only SHA-256 hash-chained audit ledger.',
                category: 'UserRights',
              },
            ];

      [createdNotice] = await PrivacyNotice.create(
        [
          {
            title: validated.title,
            version: validated.version,
            summaryOfChanges: validated.summaryOfChanges,
            highlights: validated.highlights || [validated.summaryOfChanges],
            content: validated.content,
            clauses: defaultClauses,
            effectiveDate: validated.effectiveDate ? new Date(validated.effectiveDate) : now,
            publicationDate: now,
            isActive: activateImmediately,
            status: activateImmediately ? 'Active' : 'Draft',
            requiresRenewedConsent:
              typeof validated.requiresRenewedConsent === 'boolean'
                ? validated.requiresRenewedConsent
                : true,
            publishedBy: `${req.user.name} (Admin)`,
          },
        ],
        session ? { session } : {}
      );

      await appendAuditEvent(
        {
          userId: req.user._id,
          preferenceName: `Privacy Notice v${validated.version}`,
          previousValue: 'Unpublished',
          newValue: activateImmediately ? 'Published & Activated' : 'Published (Draft)',
          action: 'System Policy Sync',
          noticeVersion: validated.version,
          source: 'Admin',
          reason: `Administrator published Privacy Notice v${validated.version}: ${validated.title}`,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'ConsentLog-Enterprise-Client/2.0',
          timestamp: now,
        },
        session
      );
    });

    res.status(201).json({
      success: true,
      message: `Privacy Notice Version ${createdNotice.version} created successfully${
        activateImmediately ? ' and set as Active' : ''
      }.`,
      notice: createdNotice,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/notices/:id/activate
const activatePrivacyNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetNotice = await PrivacyNotice.findById(id);

    if (!targetNotice) {
      return res.status(404).json({
        success: false,
        message: 'Privacy notice not found.',
      });
    }

    const previousActive = await PrivacyNotice.findOne({ isActive: true }).lean();
    const now = new Date();

    await withTransaction(async (session) => {
      await PrivacyNotice.updateMany(
        { _id: { $ne: targetNotice._id } },
        { $set: { isActive: false, status: 'Archived' } },
        session ? { session } : {}
      );

      targetNotice.isActive = true;
      targetNotice.status = 'Active';
      await targetNotice.save(session ? { session } : {});

      await appendAuditEvent(
        {
          userId: req.user._id,
          preferenceName: 'Active Privacy Notice Policy',
          previousValue: previousActive ? `v${previousActive.version}` : 'None',
          newValue: `v${targetNotice.version}`,
          action: 'System Policy Sync',
          noticeVersion: targetNotice.version,
          source: 'Admin',
          reason: `Administrator activated Privacy Notice v${targetNotice.version} (${targetNotice.title}). Users who have not yet accepted v${targetNotice.version} will be prompted for renewed consent.`,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'ConsentLog-Enterprise-Client/2.0',
          timestamp: now,
        },
        session
      );
    });

    // Run integrity verification after administrative policy change
    await verifyAuditChainIntegrity(`${req.user.name} (Policy Activation)`);

    res.status(200).json({
      success: true,
      message: `Privacy Notice v${targetNotice.version} is now the active policy. Users will see a notice renewal banner until they explicitly accept it.`,
      notice: targetNotice,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// FEATURE 2: DOWNSTREAM WEBHOOKS DISPATCHER
// ==========================================
const getWebhooks = async (req, res, next) => {
  try {
    const webhooks = await Webhook.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, webhooks });
  } catch (err) {
    next(err);
  }
};

const createWebhook = async (req, res, next) => {
  try {
    const { name, url, events } = req.body;
    if (!name || !url) {
      return res.status(400).json({ success: false, message: 'Name and URL are required.' });
    }

    const secret = crypto.randomBytes(24).toString('hex');
    const webhook = await Webhook.create({
      name,
      url,
      secret,
      events: events && events.length > 0 ? events : ['consent.granted', 'consent.withdrawn', 'notice.accepted', 'user.erased'],
      organization: req.user.organization || 'Enterprise Global Corp',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Webhook configured successfully.',
      webhook,
    });
  } catch (err) {
    next(err);
  }
};

const testWebhook = async (req, res, next) => {
  try {
    const webhook = await Webhook.findById(req.params.id);
    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook not found.' });
    }

    const testPayload = {
      test: true,
      message: 'ConsentLog Enterprise Dispatcher ping test',
      auditId: 'AUD-TEST-PING',
      dispatchedBy: req.user.name,
      timestamp: new Date().toISOString(),
    };

    const results = await dispatchWebhookEvent('consent.granted', testPayload);
    res.status(200).json({
      success: true,
      message: 'Test ping dispatched to webhook endpoint.',
      results,
    });
  } catch (err) {
    next(err);
  }
};

const deleteWebhook = async (req, res, next) => {
  try {
    const webhook = await Webhook.findByIdAndDelete(req.params.id);
    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook not found.' });
    }
    res.status(200).json({ success: true, message: 'Webhook removed.' });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// FEATURE 3: DSAR & ARTICLE 17 ERASURE
// ==========================================
const getDsarRequests = async (req, res, next) => {
  try {
    const requests = await DsarRequest.find().sort({ submittedAt: -1 }).lean();
    res.status(200).json({ success: true, requests });
  } catch (err) {
    next(err);
  }
};

const processDsarRequest = async (req, res, next) => {
  try {
    const { action = 'approve' } = req.body; // 'approve' | 'reject'
    const request = await DsarRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'DSAR request not found.' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
    }

    if (action === 'reject') {
      request.status = 'rejected';
      request.processedAt = new Date();
      request.processedBy = req.user.name;
      await request.save();
      return res.status(200).json({ success: true, message: 'DSAR request rejected.', request });
    }

    // Execute Article 17 Cryptographic Erasure & Anonymization
    const targetUser = await User.findById(request.userId);
    const anonId = `ANON-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    if (targetUser) {
      targetUser.name = `Anonymized User (${anonId})`;
      targetUser.email = `erased-${anonId.toLowerCase()}@consentlog.deleted`;
      targetUser.organization = 'Redacted (GDPR Art. 17)';
      targetUser.department = 'Redacted';
      await targetUser.save();
    }

    // Reset preferences to default disabled
    const pref = await Preference.findOne({ userId: request.userId });
    if (pref) {
      pref.analytics = false;
      pref.marketing = false;
      pref.personalization = false;
      pref.thirdPartySharing = false;
      await pref.save();
    }

    // Record immutable audit event validating erasure while preserving chain continuity
    await appendAuditEvent({
      userId: request.userId,
      preferenceName: 'Data Subject Personal Information',
      previousValue: 'Identifiable User Record',
      newValue: `Anonymized Identifier ${anonId}`,
      action: 'User Data Anonymized (GDPR Art. 17)',
      source: 'Admin',
      reason: `Right to Erasure executed by ${req.user.name} per request #${request._id}`,
    });

    request.status = 'completed';
    request.processedAt = new Date();
    request.processedBy = req.user.name;
    request.anonymizedIdentifier = anonId;
    await request.save();

    res.status(200).json({
      success: true,
      message: `User data successfully erased and anonymized as ${anonId}. Cryptographic audit trail preserved.`,
      request,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// FEATURE 4: COOKIE & TRACKER INVENTORY
// ==========================================
const getCookieInventory = async (req, res, next) => {
  try {
    const org = req.query.organization || req.user.organization || 'Enterprise Global Corp';
    await ensureCookieInventory(org);
    const cookies = await CookieInventory.find({ organization: org }).sort({ category: 1, name: 1 }).lean();

    const stats = {
      total: cookies.length,
      essential: cookies.filter((c) => c.category === 'essential').length,
      analytics: cookies.filter((c) => c.category === 'analytics').length,
      marketing: cookies.filter((c) => c.category === 'marketing').length,
      personalization: cookies.filter((c) => c.category === 'personalization').length,
      thirdPartySharing: cookies.filter((c) => c.category === 'thirdPartySharing').length,
    };

    res.status(200).json({ success: true, stats, cookies });
  } catch (err) {
    next(err);
  }
};

const scanDomainCookies = async (req, res, next) => {
  try {
    const { domain = 'app.enterprise-portal.com' } = req.body;
    const org = req.user.organization || 'Enterprise Global Corp';
    const scanResult = await scanDomainAndCatalog(domain, org);

    res.status(200).json({
      success: true,
      message: `Domain scan completed for ${scanResult.scannedDomain}. Discovered ${scanResult.totalDiscovered} cookies.`,
      result: scanResult,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// FEATURE 5: API KEYS & VERIFICATION
// ==========================================
const getApiKeys = async (req, res, next) => {
  try {
    const keys = await ApiKey.find()
      .select('-keyHash')
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean();
    res.status(200).json({ success: true, keys });
  } catch (err) {
    next(err);
  }
};

const createApiKey = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'API key name is required.' });
    }

    const secretBytes = crypto.randomBytes(24).toString('hex');
    const rawKey = `cl_live_${secretBytes}`;
    const prefix = `cl_live_${secretBytes.slice(0, 8)}...`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await ApiKey.create({
      name,
      prefix,
      keyHash,
      organization: req.user.organization || 'Enterprise Global Corp',
      createdBy: req.user._id,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'API Key generated. Save this secret now; it will not be displayed again.',
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        prefix: apiKey.prefix,
        createdAt: apiKey.createdAt,
        rawKey, // Returned once
      },
    });
  } catch (err) {
    next(err);
  }
};

const revokeApiKey = async (req, res, next) => {
  try {
    const apiKey = await ApiKey.findByIdAndDelete(req.params.id);
    if (!apiKey) {
      return res.status(404).json({ success: false, message: 'API key not found.' });
    }
    res.status(200).json({ success: true, message: 'API Key revoked successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardAnalytics,
  getAllUsersWithConsent,
  publishPrivacyNotice,
  activatePrivacyNotice,
  getWebhooks,
  createWebhook,
  testWebhook,
  deleteWebhook,
  getDsarRequests,
  processDsarRequest,
  getCookieInventory,
  scanDomainCookies,
  getApiKeys,
  createApiKey,
  revokeApiKey,
};

