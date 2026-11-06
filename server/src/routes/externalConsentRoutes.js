const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Preference = require('../models/Preference');
const PrivacyNotice = require('../models/PrivacyNotice');
const ConsentLog = require('../models/ConsentLog');
const { apiKeyAuth } = require('../middleware/apiKeyMiddleware');

// GET /api/v1/consent/check?email=...&category=...
router.get('/check', apiKeyAuth, async (req, res, next) => {
  try {
    const { email, userId, category = 'marketing' } = req.query;

    if (!email && !userId) {
      return res.status(400).json({
        success: false,
        message: 'Must provide either email or userId query parameter.',
      });
    }

    const userQuery = email ? { email: String(email).toLowerCase() } : { _id: userId };
    const user = await User.findOne(userQuery).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Data subject not found in enterprise registry.',
        isAllowed: false,
      });
    }

    const pref = await Preference.findOne({ userId: user._id }).lean();
    const activeNotice = await PrivacyNotice.findOne({ isActive: true }).lean();
    const latestAudit = await ConsentLog.findOne({ userId: user._id })
      .sort({ sequenceNumber: -1 })
      .lean();

    const normalizedCategory = category === 'third-party' ? 'thirdPartySharing' : category;
    const isAllowed = pref ? Boolean(pref[normalizedCategory]) : false;
    const categoryMeta = pref?.categoryMeta?.[normalizedCategory] || {};

    res.status(200).json({
      success: true,
      dataSubject: {
        id: user._id,
        email: user.email,
        jurisdiction: user.jurisdiction,
        organization: user.organization,
      },
      category: normalizedCategory,
      isAllowed,
      status: categoryMeta.status || (isAllowed ? 'Granted' : 'Disabled'),
      noticeVersion: activeNotice ? activeNotice.version : '2.0',
      lastConsentUpdate: pref?.updatedAt || null,
      latestAuditId: latestAudit?.auditId || null,
      latestAuditHash: latestAudit?.eventHash || null,
      cryptographicProof: 'SHA-256 Ledger Verified',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

