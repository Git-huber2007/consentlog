const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token and attach authenticated user to `req.user`
 */
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid Bearer token.',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'consentlog_enterprise_secret_key_2026_privacy_governance_99x'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user account belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

/**
 * Role-based access control middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Role '${req.user ? req.user.role : 'guest'}' is not authorized to access this administrative resource.`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};

