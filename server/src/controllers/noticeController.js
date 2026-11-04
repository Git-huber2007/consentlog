const PrivacyNotice = require('../models/PrivacyNotice');
const ConsentRecord = require('../models/ConsentRecord');
const Preference = require('../models/Preference');
const { withTransaction } = require('../config/db');
const { appendAuditEvent } = require('../services/auditService');

/**
 * Helper to compare two notice versions clause-by-clause and line-by-line
 */
const computeVersionDiff = (baseNotice, targetNotice) => {
  const baseClauses = baseNotice.clauses || [];
  const targetClauses = targetNotice.clauses || [];

  const baseMap = new Map(baseClauses.map((c) => [c.clauseId, c]));
  const targetMap = new Map(targetClauses.map((c) => [c.clauseId, c]));

  const allClauseIds = Array.from(new Set([...baseMap.keys(), ...targetMap.keys()]));
  const clauseComparisons = [];

  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;

  for (const clauseId of allClauseIds) {
    const oldClause = baseMap.get(clauseId);
    const newClause = targetMap.get(clauseId);

    if (!oldClause && newClause) {
      addedCount += 1;
      clauseComparisons.push({
        clauseId,
        changeType: 'ADDED',
        heading: newClause.heading,
        category: newClause.category,
        oldClause: null,
        newClause,
      });
    } else if (oldClause && !newClause) {
      removedCount += 1;
      clauseComparisons.push({
        clauseId,
        changeType: 'REMOVED',
        heading: oldClause.heading,
        category: oldClause.category,
        oldClause,
        newClause: null,
      });
    } else if (oldClause && newClause) {
      const isModified =
        oldClause.heading !== newClause.heading || oldClause.body !== newClause.body;
      if (isModified) {
        modifiedCount += 1;
        clauseComparisons.push({
          clauseId,
          changeType: 'MODIFIED',
          heading: newClause.heading,
          category: newClause.category,
          oldClause,
          newClause,
        });
      } else {
        unchangedCount += 1;
        clauseComparisons.push({
          clauseId,
          changeType: 'UNCHANGED',
          heading: newClause.heading,
          category: newClause.category,
          oldClause,
          newClause,
        });
      }
    }
  }

  return {
    baseVersion: baseNotice.version,
    targetVersion: targetNotice.version,
    summary: {
      addedClauses: addedCount,
      removedClauses: removedCount,
      modifiedClauses: modifiedCount,
      unchangedClauses: unchangedCount,
      totalClausesCompared: allClauseIds.length,
    },
    clauseComparisons,
  };
};

// GET /api/notices
const getAllNotices = async (req, res, next) => {
  try {
    const notices = await PrivacyNotice.find().sort({ publicationDate: -1, version: -1 }).lean();

    let userAcceptances = [];
    if (req.user) {
      userAcceptances = await ConsentRecord.find({ userId: req.user._id })
        .sort({ acceptedAt: -1 })
        .lean();
    }

    const enrichedNotices = notices.map((notice) => {
      const acceptance = userAcceptances.find(
        (r) => r.noticeVersion === notice.version && r.status !== 'Pending Renewal'
      );
      return {
        ...notice,
        userAcceptance: acceptance
          ? {
              accepted: true,
              status: acceptance.status,
              acceptedAt: acceptance.acceptedAt,
              acknowledgementMethod: acceptance.acknowledgementMethod,
            }
          : {
              accepted: false,
              status: notice.isActive && notice.requiresRenewedConsent ? 'Renewal Required' : 'Not Accepted',
              acceptedAt: null,
            },
      };
    });

    res.status(200).json({
      success: true,
      notices: enrichedNotices,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/notices/active
const getActiveNotice = async (req, res, next) => {
  try {
    const activeNotice = await PrivacyNotice.findOne({ isActive: true }).lean();
    if (!activeNotice) {
      return res.status(404).json({
        success: false,
        message: 'No active privacy notice found.',
      });
    }

    let userAcceptance = null;
    if (req.user) {
      userAcceptance = await ConsentRecord.findOne({
        userId: req.user._id,
        noticeVersion: activeNotice.version,
        status: { $in: ['Accepted', 'Customized'] },
      })
        .sort({ acceptedAt: -1 })
        .lean();
    }

    res.status(200).json({
      success: true,
      notice: activeNotice,
      hasAccepted: Boolean(userAcceptance),
      acceptanceRecord: userAcceptance,
      requiresAction: Boolean(activeNotice.requiresRenewedConsent && !userAcceptance),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/notices/:version
const getNoticeByVersion = async (req, res, next) => {
  try {
    const { version } = req.params;
    const { compareWith } = req.query;

    const notice = await PrivacyNotice.findOne({ version }).lean();
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: `Privacy Notice version '${version}' not found.`,
      });
    }

    let comparison = null;
    if (compareWith) {
      const baseNotice = await PrivacyNotice.findOne({ version: compareWith }).lean();
      if (baseNotice) {
        comparison = computeVersionDiff(baseNotice, notice);
      }
    }

    res.status(200).json({
      success: true,
      notice,
      comparison,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/notices/acknowledge
const acknowledgeNotice = async (req, res, next) => {
  try {
    const { version, method } = req.body;
    const targetNotice = version
      ? await PrivacyNotice.findOne({ version }).lean()
      : await PrivacyNotice.findOne({ isActive: true }).lean();

    if (!targetNotice) {
      return res.status(404).json({
        success: false,
        message: 'Target privacy notice version not found.',
      });
    }

    const pref = await Preference.findOne({ userId: req.user._id }).lean();
    const now = new Date();
    let record;
    let auditEvent;

    await withTransaction(async (session) => {
      [record] = await ConsentRecord.create(
        [
          {
            userId: req.user._id,
            noticeVersion: targetNotice.version,
            status: 'Accepted',
            preferencesSnapshot: {
              essential: true,
              analytics: pref ? pref.analytics : false,
              marketing: pref ? pref.marketing : false,
              personalization: pref ? pref.personalization : false,
              thirdPartySharing: pref ? pref.thirdPartySharing : false,
            },
            acceptedAt: now,
            acknowledgementMethod: method || 'Privacy Notice Centre Review',
          },
        ],
        session ? { session } : {}
      );

      auditEvent = await appendAuditEvent(
        {
          userId: req.user._id,
          preferenceName: `Privacy Notice v${targetNotice.version}`,
          previousValue: 'Pending Review',
          newValue: `Accepted (v${targetNotice.version})`,
          action: 'Notice Accepted',
          noticeVersion: targetNotice.version,
          source: 'User',
          reason: `User explicitly reviewed and acknowledged Privacy Notice v${targetNotice.version} (${targetNotice.title})`,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'ConsentLog-Enterprise-Client/2.0',
          timestamp: now,
        },
        session
      );
    });

    res.status(200).json({
      success: true,
      message: `Privacy Notice Version ${targetNotice.version} formally accepted and recorded in audit trail.`,
      consentRecord: record,
      auditEvent,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllNotices,
  getActiveNotice,
  getNoticeByVersion,
  acknowledgeNotice,
  computeVersionDiff,
};

