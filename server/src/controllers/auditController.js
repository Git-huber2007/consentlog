const ConsentLog = require('../models/ConsentLog');
const AuditVerification = require('../models/AuditVerification');
const User = require('../models/User');
const { verifyAuditChainIntegrity } = require('../services/auditService');
const { computeEventHash } = require('../utils/hashChain');

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

    // Role-based filtering: Normal users only view their own audit records unless admin
    if (req.user.role !== 'admin') {
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

    // Ownership validation: non-admin can only view their own audit records
    const ownerId = String(log.userId?._id || log.userId);
    if (req.user.role !== 'admin' && ownerId !== String(req.user._id)) {
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

module.exports = {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  runAuditVerification,
};

