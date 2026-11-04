const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Preference = require('../models/Preference');
const PrivacyNotice = require('../models/PrivacyNotice');
const ConsentRecord = require('../models/ConsentRecord');
const { withTransaction } = require('../config/db');
const { appendAuditEvent } = require('../services/auditService');
const { registerSchema, loginSchema } = require('../utils/validators');

const signToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'consentlog_enterprise_secret_key_2026_privacy_governance_99x',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: validated.email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const activeNotice = await PrivacyNotice.findOne({ isActive: true }).lean();
    const currentVersion = activeNotice ? activeNotice.version : '2.0';

    const result = await withTransaction(async (session) => {
      const [user] = await User.create(
        [
          {
            name: validated.name,
            email: validated.email.toLowerCase(),
            password: validated.password,
            role: 'user',
            organization: validated.organization || 'Enterprise Global Corp',
            department: validated.department || 'General Operations',
            jurisdiction: validated.jurisdiction || 'GDPR (EU)',
          },
        ],
        session ? { session } : {}
      );

      const now = new Date();
      await Preference.create(
        [
          {
            userId: user._id,
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
          },
        ],
        session ? { session } : {}
      );

      await ConsentRecord.create(
        [
          {
            userId: user._id,
            noticeVersion: currentVersion,
            status: 'Accepted',
            preferencesSnapshot: {
              essential: true,
              analytics: false,
              marketing: false,
              personalization: false,
              thirdPartySharing: false,
            },
            acceptedAt: now,
            acknowledgementMethod: 'Onboarding Consent',
          },
        ],
        session ? { session } : {}
      );

      await appendAuditEvent(
        {
          userId: user._id,
          preferenceName: 'Essential Cookies & Privacy Baseline',
          previousValue: 'Unregistered',
          newValue: 'Enabled (Privacy-by-Default)',
          action: 'Initial Registration Defaults',
          noticeVersion: currentVersion,
          source: 'Onboarding',
          reason: `User account registered under Privacy Notice v${currentVersion} with strict privacy-by-default settings.`,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'ConsentLog-Enterprise-Client/2.0',
        },
        session
      );

      return user;
    });

    const token = signToken(result._id, result.role);

    res.status(201).json({
      success: true,
      message: 'Account registered with privacy-by-default consent profile.',
      token,
      user: {
        id: result._id,
        name: result.name,
        email: result.email,
        role: result.role,
        organization: result.organization,
        department: result.department,
        jurisdiction: result.jurisdiction,
        createdAt: result.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    const user = await User.findOne({ email: validated.email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(validated.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = signToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        department: user.department,
        jurisdiction: user.jurisdiction,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const preferences = await Preference.findOne({ userId: req.user._id });
    const activeNotice = await PrivacyNotice.findOne({ isActive: true }).lean();
    const latestAcceptance = activeNotice
      ? await ConsentRecord.findOne({
          userId: req.user._id,
          noticeVersion: activeNotice.version,
          status: { $in: ['Accepted', 'Customized'] },
        })
          .sort({ acceptedAt: -1 })
          .lean()
      : null;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        department: user.department,
        jurisdiction: user.jurisdiction,
        createdAt: user.createdAt,
      },
      preferences,
      activeNoticeVersion: activeNotice ? activeNotice.version : '2.0',
      hasAcceptedActiveNotice: Boolean(latestAcceptance),
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, organization, department, jurisdiction } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name && name.trim().length >= 2) user.name = name.trim();
    if (organization) user.organization = organization.trim();
    if (department) user.department = department.trim();
    if (
      jurisdiction &&
      ['GDPR (EU)', 'CCPA (California)', 'DPDP (India)', 'LGPD (Brazil)', 'Global Standard'].includes(
        jurisdiction
      )
    ) {
      user.jurisdiction = jurisdiction;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile settings updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        department: user.department,
        jurisdiction: user.jurisdiction,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};

