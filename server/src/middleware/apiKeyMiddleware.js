const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const ApiKey = require('../models/ApiKey');
const User = require('../models/User');

const apiKeyAuth = async (req, res, next) => {
  const headerKey = req.headers['x-api-key'];
  const authHeader = req.headers['authorization'];
  let rawKey = null;

  if (headerKey) {
    rawKey = headerKey.trim();
  } else if (authHeader && authHeader.startsWith('Bearer cl_live_')) {
    rawKey = authHeader.slice(7).trim();
  }

  // If no API key provided, check if the request has a valid Admin JWT token (for developer dashboard sandbox)
  if (!rawKey) {
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'consentlog_enterprise_secret_key_2026_privacy_governance_99x'
        );
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
          req.organization = user.organization;
          return next();
        }
      } catch (e) {
        // Fall through to 401
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing X-API-Key or Bearer API token.',
    });
  }

  try {
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const apiKey = await ApiKey.findOne({ keyHash, isActive: true });

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or revoked API key.',
      });
    }

    // Update last used timestamp asynchronously
    apiKey.lastUsedAt = new Date();
    apiKey.save().catch(() => {});

    req.apiKey = apiKey;
    req.organization = apiKey.organization;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal error validating API key.',
    });
  }
};

module.exports = { apiKeyAuth };
