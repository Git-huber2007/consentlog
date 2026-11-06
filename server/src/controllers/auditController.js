const ConsentLog = require('../models/ConsentLog');
const AuditVerification = require('../models/AuditVerification');
const User = require('../models/User');
const Preference = require('../models/Preference');
const ConsentRecord = require('../models/ConsentRecord');
const { verifyAuditChainIntegrity } = require('../services/auditService');
const { computeEventHash } = require('../utils/hashChain');
const crypto = require('crypto');

// GET /api/audit/logs
const getAuditLogs = async (req, res, next) => {
  try {
    const {
      search,
      userId,
      preference,
      action,
      source,
      startDate,
      endDate,
      sort = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    // Role-based filtering: Normal users only view their own audit records unless admin, auditor, or dpo
    if (!['admin', 'auditor', 'dpo'].includes(req.user.role)) {
      query.userId = req.user._id;
    } else if (userId && userId !== 'all') {
      query.userId = userId;
    }

    if (preference && preference !== 'all') {
      query.preferenceName = { $regex: preference, $options: 'i' };
    }

    if (action && action !== 'all') {
      query.action = action;
    }

    if (source && source !== 'all') {
      query.source = source;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { auditId: regex },
        { preferenceName: regex },
        { action: regex },
        { reason: regex },
        { eventHash: regex },
        { previousHash: regex },
        { noticeVersion: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const sortDirection = sort === 'asc' ? 1 : -1;

    const [total, logs] = await Promise.all([
      ConsentLog.countDocuments(query),
      ConsentLog.find(query)
        .populate('userId', 'name email role organization jurisdiction')
        .sort({ sequenceNumber: sortDirection })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      logs,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/audit/logs/:id
const getAuditLogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    const log = await ConsentLog.findOne(isObjectId ? { _id: id } : { auditId: id })
      .populate('userId', 'name email role organization department jurisdiction')
      .lean();

    if (!log) {
      return res.status(404).json({
        success: false,
        message: `Audit event '${id}' not found.`,
      });
    }

    // Ownership validation: normal users can only view their own audit records; auditors, DPOs, and admins can view any
    const ownerId = String(log.userId?._id || log.userId);
    if (!['admin', 'auditor', 'dpo'].includes(req.user.role) && ownerId !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You can only inspect your own consent audit records.',
      });
    }

    // Fetch adjacent records in chain for visual verification context
    const [previousRecord, nextRecord] = await Promise.all([
      ConsentLog.findOne({ sequenceNumber: log.sequenceNumber - 1 })
        .select('auditId sequenceNumber eventHash timestamp action preferenceName')
        .lean(),
      ConsentLog.findOne({ sequenceNumber: log.sequenceNumber + 1 })
        .select('auditId sequenceNumber previousHash eventHash timestamp action preferenceName')
        .lean(),
    ]);

    // Real-time cryptographic verification of this single event
    const recomputedHash = computeEventHash({
      auditId: log.auditId,
      sequenceNumber: log.sequenceNumber,
      userId: log.userId?._id || log.userId,
      preferenceName: log.preferenceName,
      previousValue: log.previousValue,
      newValue: log.newValue,
      action: log.action,
      noticeVersion: log.noticeVersion,
      source: log.source,
      reason: log.reason,
      timestamp: log.timestamp,
      previousHash: log.previousHash,
    });

    const hashMatches = recomputedHash === log.eventHash;
    const chainLinkValid = previousRecord
      ? previousRecord.eventHash === log.previousHash
      : log.sequenceNumber === 1;

    res.status(200).json({
      success: true,
      log,
      chainContext: {
        previousRecord,
        nextRecord,
        recomputedHash,
        hashMatches,
        chainLinkValid,
        integrityVerified: hashMatches && chainLinkValid,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/audit/stats
const getAuditStats = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalAuditEvents,
      todaysChanges,
      consentGrants,
      consentWithdrawals,
      recentTimeline,
      latestVerification,
      usersList,
    ] = await Promise.all([
      ConsentLog.countDocuments(filter),
      ConsentLog.countDocuments({ ...filter, timestamp: { $gte: startOfToday } }),
      ConsentLog.countDocuments({
        ...filter,
        action: { $in: ['Consent Granted', 'Bulk Consent Accepted', 'Notice Accepted'] },
      }),
      ConsentLog.countDocuments({
        ...filter,
        action: { $in: ['Consent Withdrawn', 'Optional Preferences Rejected'] },
      }),
      ConsentLog.find(filter)
        .populate('userId', 'name email role')
        .sort({ sequenceNumber: -1 })
        .limit(8)
        .lean(),
      AuditVerification.findOne().sort({ verificationDate: -1 }).lean(),
      req.user.role === 'admin'
        ? User.find().select('name email role').sort({ name: 1 }).lean()
        : Promise.resolve([]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalAuditEvents,
        todaysChanges,
        consentGrants,
        consentWithdrawals,
        integrityStatus: latestVerification ? latestVerification.verificationStatus : 'Verified',
        latestVerification,
      },
      recentTimeline,
      usersList,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/audit/verify
const runAuditVerification = async (req, res, next) => {
  try {
    const triggeredBy = `${req.user.name} (${req.user.role.toUpperCase()})`;
    const report = await verifyAuditChainIntegrity(triggeredBy);
    const history = await AuditVerification.find()
      .sort({ verificationDate: -1 })
      .limit(15)
      .lean();

    res.status(200).json({
      success: true,
      message:
        report.verificationStatus === 'Verified'
          ? `Cryptographic SHA-256 chain integrity verified across all ${report.totalRecords} audit records.`
          : `ALERT: Chain verification detected ${report.failedRecords} tampered record(s)!`,
      report,
      history,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/audit/simulate-tamper
// Dry-run sandbox simulator: Never mutates the database! Demonstrates how altering a single byte
// in any historical block invalidates its SHA-256 eventHash and breaks all downstream links.
const simulateTamperDetection = async (req, res, next) => {
  try {
    const { targetSequence, injectedNewValue = 'Enabled (UNAUTHORIZED_DBA_OVERRIDE)' } = req.body || {};
    const records = await ConsentLog.find().sort({ sequenceNumber: 1 }).lean();

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No audit records available to run tamper simulation.',
      });
    }

    const targetIdx = targetSequence
      ? Math.max(0, records.findIndex((r) => r.sequenceNumber === Number(targetSequence)))
      : Math.max(0, Math.floor(records.length / 2));

    const targetRecord = records[targetIdx];

    const originalHash = targetRecord.eventHash;
    const tamperedHash = computeEventHash({
      auditId: targetRecord.auditId,
      sequenceNumber: targetRecord.sequenceNumber,
      userId: targetRecord.userId,
      preferenceName: targetRecord.preferenceName,
      previousValue: targetRecord.previousValue,
      newValue: injectedNewValue,
      action: targetRecord.action,
      noticeVersion: targetRecord.noticeVersion,
      source: targetRecord.source,
      reason: targetRecord.reason,
      timestamp: targetRecord.timestamp,
      previousHash: targetRecord.previousHash,
    });

    const cascadeImpacts = records.slice(targetIdx).map((rec, idx) => ({
      auditId: rec.auditId,
      sequenceNumber: rec.sequenceNumber,
      preferenceName: rec.preferenceName,
      status: idx === 0 ? 'PAYLOAD_HASH_MISMATCH' : 'BROKEN_PREVIOUS_HASH_POINTER',
      storedHash: rec.eventHash,
      expectedPreviousHash: idx === 0 ? rec.previousHash : 'DIVERGED_UPSTREAM_HASH',
    }));

    res.status(200).json({
      success: true,
      simulationMode: 'READ_ONLY_CRYPTOGRAPHIC_SANDBOX',
      databaseMutated: false,
      targetBlock: {
        auditId: targetRecord.auditId,
        sequenceNumber: targetRecord.sequenceNumber,
        preferenceName: targetRecord.preferenceName,
        legitimateValue: targetRecord.newValue,
        simulatedTamperedValue: injectedNewValue,
        storedEventHash: originalHash,
        recomputedTamperedHash: tamperedHash,
      },
      totalBlocksInChain: records.length,
      invalidatedDownstreamBlocks: cascadeImpacts.length,
      cascadeImpacts: cascadeImpacts.slice(0, 6),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/audit/dsar-passport
// GDPR Art. 15 & Art. 20 Data Subject Access Request & Cryptographic Proof Bundle
const exportDsarPassport = async (req, res, next) => {
  try {
    const [user, preference, consentRecords, auditLogs] = await Promise.all([
      User.findById(req.user._id).lean(),
      Preference.findOne({ userId: req.user._id }).lean(),
      ConsentRecord.find({ userId: req.user._id }).sort({ acceptedAt: -1 }).lean(),
      ConsentLog.find({ userId: req.user._id }).sort({ sequenceNumber: -1 }).lean(),
    ]);

    const exportPayload = {
      schema: 'consentlog.enterprise.dsar.v2',
      generatedAt: new Date().toISOString(),
      regulatoryBasis: ['GDPR Art. 15 (Right of Access)', 'GDPR Art. 20 (Data Portability)', 'India DPDP Act Sec. 11'],
      dataSubject: {
        id: user._id,
        name: user.name,
        email: user.email,
        organization: user.organization,
        department: user.department,
        jurisdiction: user.jurisdiction,
        registeredAt: user.createdAt,
      },
      currentPreferences: {
        essential: true,
        analytics: Boolean(preference?.analytics),
        marketing: Boolean(preference?.marketing),
        personalization: Boolean(preference?.personalization),
        thirdPartySharing: Boolean(preference?.thirdPartySharing),
        updatedAt: preference?.updatedAt,
      },
      noticeAcceptanceHistory: consentRecords.map((r) => ({
        noticeVersion: r.noticeVersion,
        status: r.status,
        acceptedAt: r.acceptedAt,
        withdrawnAt: r.withdrawnAt,
        method: r.acknowledgementMethod,
      })),
      immutableAuditTrail: auditLogs.map((l) => ({
        auditId: l.auditId,
        sequenceNumber: l.sequenceNumber,
        preferenceName: l.preferenceName,
        previousValue: l.previousValue,
        newValue: l.newValue,
        action: l.action,
        noticeVersion: l.noticeVersion,
        timestamp: l.timestamp,
        previousHash: l.previousHash,
        eventHash: l.eventHash,
      })),
    };

    const passportSignature = crypto
      .createHash('sha256')
      .update(JSON.stringify(exportPayload))
      .digest('hex');

    res.status(200).json({
      success: true,
      passportSignature,
      bundle: exportPayload,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  runAuditVerification,
  simulateTamperDetection,
  exportDsarPassport,
};

