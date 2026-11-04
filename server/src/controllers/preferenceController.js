const Preference = require('../models/Preference');
const PrivacyNotice = require('../models/PrivacyNotice');
const ConsentRecord = require('../models/ConsentRecord');
const ConsentLog = require('../models/ConsentLog');
const { withTransaction } = require('../config/db');
const { appendAuditEvent } = require('../services/auditService');

const PREFERENCE_LABELS = {
  essential: 'Essential Cookies',
  analytics: 'Analytics Cookies',
  marketing: 'Marketing Cookies',
  personalization: 'Personalization',
  thirdPartySharing: 'Third-Party Data Sharing',
};

const PREFERENCE_DESCRIPTIONS = {
  essential:
    'Strictly necessary for core platform security, session integrity, authentication, CSRF protection, and load balancing. Cannot be disabled under regulatory exemptions.',
  analytics:
    'Helps us understand how visitors interact with enterprise dashboards, measure latency, and optimize product ergonomics through aggregated telemetry.',
  marketing:
    'Used to deliver relevant enterprise compliance announcements, webinar invitations, and measure campaign attribution across partner networks.',
  personalization:
    'Remembers your UI layout preferences, custom audit filter presets, regional regulatory jurisdiction defaults, and language settings.',
  thirdPartySharing:
    'Permits encrypted sharing of telemetry and compliance metadata with vetted sub-processors and cloud analytics integrations.',
};

const OPTIONAL_KEYS = ['analytics', 'marketing', 'personalization', 'thirdPartySharing'];

/**
 * Compute live summary counts from a Preference document
 */
const buildPreferenceSummary = (pref) => {
  const allKeys = ['essential', ...OPTIONAL_KEYS];
  let enabledCount = 0;
  let disabledCount = 0;
  let withdrawnCount = 0;

  const categories = allKeys.map((key) => {
    const enabled = key === 'essential' ? true : Boolean(pref[key]);
    const meta = pref.categoryMeta?.[key] || {
      lastModified: pref.updatedAt || new Date(),
      status: key === 'essential' ? 'Always Active' : enabled ? 'Granted' : 'Disabled',
    };

    if (enabled) {
      enabledCount += 1;
    } else {
      disabledCount += 1;
      if (meta.status === 'Withdrawn') {
        withdrawnCount += 1;
      }
    }

    return {
      key,
      name: PREFERENCE_LABELS[key],
      description: PREFERENCE_DESCRIPTIONS[key],
      enabled,
      required: key === 'essential',
      statusBadge: key === 'essential' ? 'Always Active' : meta.status,
      lastModified: meta.lastModified || pref.updatedAt,
    };
  });

  return {
    totalPreferences: allKeys.length,
    enabledPreferences: enabledCount,
    disabledPreferences: disabledCount,
    withdrawnPreferences: withdrawnCount,
    categories,
  };
};

/**
 * Ensure a preference document exists for the user
 */
const getOrCreateUserPreference = async (userId) => {
  let pref = await Preference.findOne({ userId });
  if (!pref) {
    const now = new Date();
    pref = await Preference.create({
      userId,
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false,
      thirdPartySharing: false,
      categoryMeta: {
        essential: { lastModified: now, status: 'Always Active' },
        analytics: { lastModified: now, status: 'Disabled' },
        marketing: { lastModified: now, status: 'Disabled' },
        personalization: { lastModified: now, status: 'Disabled' },
        thirdPartySharing: { lastModified: now, status: 'Disabled' },
      },
    });
  }
  return pref;
};

// GET /api/preferences
const getPreferences = async (req, res, next) => {
  try {
    const pref = await getOrCreateUserPreference(req.user._id);
    const summary = buildPreferenceSummary(pref);

    res.status(200).json({
      success: true,
      preferences: pref,
      summary,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/preferences
const updatePreferences = async (req, res, next) => {
  try {
    const { essential, analytics, marketing, personalization, thirdPartySharing, reason, source } =
      req.body;

    // Business rule: Reject attempts to disable essential cookies
    if (essential === false) {
      return res.status(400).json({
        success: false,
        error: 'ESSENTIAL_COOKIES_PROTECTED',
        message:
          'Essential Cookies are strictly required for platform security and operation and cannot be disabled.',
      });
    }

    const activeNotice = await PrivacyNotice.findOne({ isActive: true }).lean();
    const noticeVersion = activeNotice ? activeNotice.version : '2.0';

    const pref = await getOrCreateUserPreference(req.user._id);
    const incoming = {
      analytics: typeof analytics === 'boolean' ? analytics : pref.analytics,
      marketing: typeof marketing === 'boolean' ? marketing : pref.marketing,
      personalization: typeof personalization === 'boolean' ? personalization : pref.personalization,
      thirdPartySharing:
        typeof thirdPartySharing === 'boolean' ? thirdPartySharing : pref.thirdPartySharing,
    };

    const changes = [];
    for (const key of OPTIONAL_KEYS) {
      if (incoming[key] !== pref[key]) {
        changes.push({
          key,
          label: PREFERENCE_LABELS[key],
          previousBool: pref[key],
          newBool: incoming[key],
          previousValue: pref[key] ? 'Enabled' : 'Disabled',
          newValue: incoming[key] ? 'Enabled' : 'Disabled',
          action: incoming[key] ? 'Consent Granted' : 'Consent Withdrawn',
        });
      }
    }

    if (changes.length === 0) {
      const summary = buildPreferenceSummary(pref);
      return res.status(200).json({
        success: true,
        message: 'No preference modifications detected. Current settings remain unchanged.',
        changesRecorded: 0,
        preferences: pref,
        summary,
        auditEvents: [],
      });
    }

    const now = new Date();
    const auditEvents = [];

    await withTransaction(async (session) => {
      for (const change of changes) {
        pref[change.key] = change.newBool;
        if (!pref.categoryMeta) pref.categoryMeta = {};
        pref.categoryMeta[change.key] = {
          lastModified: now,
          status: change.newBool ? 'Granted' : 'Withdrawn',
        };
      }
      pref.essential = true;
      pref.updatedAt = now;
      pref.markModified('categoryMeta');
      await pref.save(session ? { session } : {});

      for (const change of changes) {
        const auditDoc = await appendAuditEvent(
          {
            userId: req.user._id,
            preferenceName: change.label,
            previousValue: change.previousValue,
            newValue: change.newValue,
            action: change.action,
            noticeVersion,
            source: source || 'User',
            reason:
              reason ||
              `User updated ${change.label} from ${change.previousValue} to ${change.newValue} in Interactive Preference Centre`,
            ipAddress: req.ip || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'ConsentLog-Enterprise-Client/2.0',
            timestamp: now,
          },
          session
        );
        auditEvents.push(auditDoc);
      }

      await ConsentRecord.create(
        [
          {
            userId: req.user._id,
            noticeVersion,
            status: 'Customized',
            preferencesSnapshot: {
              essential: true,
              analytics: pref.analytics,
              marketing: pref.marketing,
              personalization: pref.personalization,
              thirdPartySharing: pref.thirdPartySharing,
            },
            acceptedAt: now,
            acknowledgementMethod: 'Preference Centre Save',
          },
        ],
        session ? { session } : {}
      );
    });

    const summary = buildPreferenceSummary(pref);

    res.status(200).json({
      success: true,
      message: `Successfully saved ${changes.length} preference modification(s) and recorded immutable audit log(s).`,
      changesRecorded: changes.length,
      preferences: pref,
      summary,
      auditEvents,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/preferences/:name
const patchSinglePreference = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { enabled, reason, source } = req.body;

    if (name === 'essential') {
      return res.status(400).json({
        success: false,
        error: 'ESSENTIAL_COOKIES_PROTECTED',
        message: 'Essential Cookies must always remain enabled and cannot be modified.',
      });
    }

    if (!OPTIONAL_KEYS.includes(name)) {
      return res.status(400).json({
        success: false,
        message: `Invalid preference category '${name}'. Valid categories: ${OPTIONAL_KEYS.join(', ')}`,
      });
    }

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Field `enabled` (boolean) is required.',
      });
    }

    const pref = await getOrCreateUserPreference(req.user._id);
    if (pref[name] === enabled) {
      return res.status(200).json({
        success: true,
        message: `${PREFERENCE_LABELS[name]} is already ${enabled ? 'Enabled' : 'Disabled'}.`,
        changesRecorded: 0,
        preferences: pref,
        summary: buildPreferenceSummary(pref),
      });
    }

    const activeNotice = await PrivacyNotice.findOne({ isActive: true }).lean();
    const noticeVersion = activeNotice ? activeNotice.version : '2.0';
    const previousValue = pref[name] ? 'Enabled' : 'Disabled';
    const newValue = enabled ? 'Enabled' : 'Disabled';
    const action = enabled ? 'Consent Granted' : 'Consent Withdrawn';
    const now = new Date();
    let auditEvent;

    await withTransaction(async (session) => {
      pref[name] = enabled;
      pref.categoryMeta[name] = {
        lastModified: now,
        status: enabled ? 'Granted' : 'Withdrawn',
      };
      pref.updatedAt = now;
      pref.markModified('categoryMeta');
      await pref.save(session ? { session } : {});

      auditEvent = await appendAuditEvent(
        {
          userId: req.user._id,
          preferenceName: PREFERENCE_LABELS[name],
          previousValue,
          newValue,
          action,
          noticeVersion,
          source: source || 'User',
          reason:
            reason || `Single category toggle: ${PREFERENCE_LABELS[name]} changed to ${newValue}`,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'ConsentLog-Enterprise-Client/2.0',
          timestamp: now,
        },
        session
      );

      await ConsentRecord.create(
        [
          {
            userId: req.user._id,
            noticeVersion,
            status: 'Customized',
            preferencesSnapshot: {
              essential: true,
              analytics: pref.analytics,
              marketing: pref.marketing,
              personalization: pref.personalization,
              thirdPartySharing: pref.thirdPartySharing,
            },
            acceptedAt: now,
            acknowledgementMethod: 'Preference Centre Save',
          },
        ],
        session ? { session } : {}
      );
    });

    res.status(200).json({
      success: true,
      message: `${PREFERENCE_LABELS[name]} updated to ${newValue}.`,
      changesRecorded: 1,
      preferences: pref,
      summary: buildPreferenceSummary(pref),
      auditEvent,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/consent/accept-all
const acceptAllConsent = async (req, res, next) => {
  try {
    const { reason, source } = req.body || {};
    const pref = await getOrCreateUserPreference(req.user._id);
    const activeNotice = await PrivacyNotice.findOne({ isActive: true }).lean();
    const noticeVersion = activeNotice ? activeNotice.version : '2.0';
    const now = new Date();
    const auditEvents = [];

    const changedCategories = OPTIONAL_KEYS.filter((key) => pref[key] !== true);

    await withTransaction(async (session) => {
      for (const key of OPTIONAL_KEYS) {
        const wasEnabled = pref[key];
        pref[key] = true;
        pref.categoryMeta[key] = {
          lastModified: now,
          status: 'Granted',
        };

        if (!wasEnabled) {
          const ev = await appendAuditEvent(
            {
              userId: req.user._id,
              preferenceName: PREFERENCE_LABELS[key],
              previousValue: 'Disabled',
              newValue: 'Enabled',
              action: 'Consent Granted',
              noticeVersion,
              source: source || 'User',
              reason: reason || 'User clicked Accept All Optional Preferences',
              ipAddress: req.ip || '127.0.0.1',
              userAgent: req.headers['user-agent'] || 'ConsentLog-Enterprise-Client/2.0',
              timestamp: now,
            },
            session
          );
          auditEvents.push(ev);
        }
      }

      if (changedCategories.length === 0) {
        // Still record a confirmation event if user explicitly re-confirms Accept All
        const ev = await appendAuditEvent(
          {
            userId: req.user._id,
            preferenceName: 'All Optional Categories',
            previousValue: 'Enabled',
            newValue: 'Enabled',
            action: 'Bulk Consent Accepted',
            noticeVersion,
            source: source || 'User',
            reason: reason || 'User re-confirmed Accept All Optional Preferences',
            ipAddress: req.ip || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'ConsentLog-Enterprise-Client/2.0',
            timestamp: now,
          },
          session
        );
        auditEvents.push(ev);
      }

      pref.updatedAt = now;
      pref.markModified('categoryMeta');
      await pref.save(session ? { session } : {});

      await ConsentRecord.create(
        [
          {
            userId: req.user._id,
            noticeVersion,
            status: 'Accepted',
            preferencesSnapshot: {
              essential: true,
              analytics: true,
              marketing: true,
              personalization: true,
              thirdPartySharing: true,
            },
            acceptedAt: now,
            acknowledgementMethod: 'Explicit Banner Acceptance',
          },
        ],
        session ? { session } : {}
      );
    });

    res.status(200).json({
      success: true,
      message: 'All optional consent preferences have been granted and cryptographically logged.',
      preferences: pref,
      summary: buildPreferenceSummary(pref),
      auditEvents,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/consent/reject-optional
const rejectOptionalConsent = async (req, res, next) => {
  try {
    const { reason, source } = req.body || {};
    const pref = await getOrCreateUserPreference(req.user._id);
    const activeNotice = await PrivacyNotice.findOne({ isActive: true }).lean();
    const noticeVersion = activeNotice ? activeNotice.version : '2.0';
    const now = new Date();
    const auditEvents = [];

    const changedCategories = OPTIONAL_KEYS.filter((key) => pref[key] !== false);

    await withTransaction(async (session) => {
      for (const key of OPTIONAL_KEYS) {
        const wasEnabled = pref[key];
        pref[key] = false;
        pref.categoryMeta[key] = {
          lastModified: now,
          status: wasEnabled ? 'Withdrawn' : 'Disabled',
        };

        if (wasEnabled) {
          const ev = await appendAuditEvent(
            {
              userId: req.user._id,
              preferenceName: PREFERENCE_LABELS[key],
              previousValue: 'Enabled',
              newValue: 'Disabled',
              action: 'Consent Withdrawn',
              noticeVersion,
              source: source || 'User',
              reason: reason || 'User clicked Reject All Optional Preferences',
              ipAddress: req.ip || '127.0.0.1',
              userAgent: req.headers['user-agent'] || 'ConsentLog-Enterprise-Client/2.0',
              timestamp: now,
            },
            session
          );
          auditEvents.push(ev);
        }
      }

      if (changedCategories.length === 0) {
        const ev = await appendAuditEvent(
          {
            userId: req.user._id,
            preferenceName: 'All Optional Categories',
            previousValue: 'Disabled',
            newValue: 'Disabled',
            action: 'Optional Preferences Rejected',
            noticeVersion,
            source: source || 'User',
            reason: reason || 'User confirmed Reject All Optional Preferences (Essential Only)',
            ipAddress: req.ip || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'ConsentLog-Enterprise-Client/2.0',
            timestamp: now,
          },
          session
        );
        auditEvents.push(ev);
      }

      pref.updatedAt = now;
      pref.markModified('categoryMeta');
      await pref.save(session ? { session } : {});

      await ConsentRecord.create(
        [
          {
            userId: req.user._id,
            noticeVersion,
            status: 'Withdrawn',
            preferencesSnapshot: {
              essential: true,
              analytics: false,
              marketing: false,
              personalization: false,
              thirdPartySharing: false,
            },
            acceptedAt: now,
            withdrawnAt: now,
            acknowledgementMethod: 'Preference Centre Save',
          },
        ],
        session ? { session } : {}
      );
    });

    res.status(200).json({
      success: true,
      message: 'All optional preferences have been rejected. Only Essential Cookies remain active.',
      preferences: pref,
      summary: buildPreferenceSummary(pref),
      auditEvents,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/consent/withdraw
const withdrawConsent = async (req, res, next) => {
  try {
    const { categories, reason } = req.body || {};
    const pref = await getOrCreateUserPreference(req.user._id);
    const activeNotice = await PrivacyNotice.findOne({ isActive: true }).lean();
    const noticeVersion = activeNotice ? activeNotice.version : '2.0';
    const now = new Date();
    const auditEvents = [];

    const targetCategories =
      Array.isArray(categories) && categories.length > 0
        ? categories.filter((c) => OPTIONAL_KEYS.includes(c))
        : OPTIONAL_KEYS;

    await withTransaction(async (session) => {
      for (const key of targetCategories) {
        const previousVal = pref[key] ? 'Enabled' : 'Disabled';
        pref[key] = false;
        pref.categoryMeta[key] = {
          lastModified: now,
          status: 'Withdrawn',
        };

        const ev = await appendAuditEvent(
          {
            userId: req.user._id,
            preferenceName: PREFERENCE_LABELS[key],
            previousValue: previousVal,
            newValue: 'Disabled',
            action: 'Consent Withdrawn',
            noticeVersion,
            source: 'User',
            reason:
              reason ||
              `Formal GDPR/DPDP Right-to-Withdraw exercised for ${PREFERENCE_LABELS[key]}`,
            ipAddress: req.ip || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'ConsentLog-Enterprise-Client/2.0',
            timestamp: now,
          },
          session
        );
        auditEvents.push(ev);
      }

      pref.updatedAt = now;
      pref.markModified('categoryMeta');
      await pref.save(session ? { session } : {});

      await ConsentRecord.create(
        [
          {
            userId: req.user._id,
            noticeVersion,
            status: 'Withdrawn',
            preferencesSnapshot: {
              essential: true,
              analytics: pref.analytics,
              marketing: pref.marketing,
              personalization: pref.personalization,
              thirdPartySharing: pref.thirdPartySharing,
            },
            acceptedAt: now,
            withdrawnAt: now,
            acknowledgementMethod: 'Withdrawal Action',
          },
        ],
        session ? { session } : {}
      );
    });

    res.status(200).json({
      success: true,
      message: 'Consent formally withdrawn and recorded in the immutable audit ledger.',
      preferences: pref,
      summary: buildPreferenceSummary(pref),
      auditEvents,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/consent/status
const getConsentStatus = async (req, res, next) => {
  try {
    const pref = await getOrCreateUserPreference(req.user._id);
    const activeNotice = await PrivacyNotice.findOne({ isActive: true }).lean();
    const consentHistory = await ConsentRecord.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    const recentAudits = await ConsentLog.find({ userId: req.user._id })
      .sort({ sequenceNumber: -1 })
      .limit(10)
      .lean();

    const acceptedActiveNotice = activeNotice
      ? consentHistory.find(
          (r) => r.noticeVersion === activeNotice.version && r.status !== 'Pending Renewal'
        )
      : null;

    res.status(200).json({
      success: true,
      summary: buildPreferenceSummary(pref),
      activeNotice: activeNotice
        ? {
            title: activeNotice.title,
            version: activeNotice.version,
            effectiveDate: activeNotice.effectiveDate,
            requiresRenewedConsent: activeNotice.requiresRenewedConsent,
            summaryOfChanges: activeNotice.summaryOfChanges,
          }
        : null,
      hasAcceptedActiveNotice: Boolean(acceptedActiveNotice),
      latestAcceptanceRecord: acceptedActiveNotice || null,
      consentRecords: consentHistory,
      recentAudits,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
  patchSinglePreference,
  acceptAllConsent,
  rejectOptionalConsent,
  withdrawConsent,
  getConsentStatus,
  buildPreferenceSummary,
  PREFERENCE_LABELS,
};

