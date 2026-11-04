const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getAllUsersWithConsent,
  publishPrivacyNotice,
  activatePrivacyNotice,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Authenticated users can view aggregate enterprise dashboard metrics via /api/admin/dashboard-overview
router.get('/dashboard-overview', protect, getDashboardAnalytics);

// Strict Admin-only endpoints
router.use(protect, authorize('admin'));

router.get('/users', getAllUsersWithConsent);
router.get('/dashboard', getDashboardAnalytics);
router.post('/notices', publishPrivacyNotice);
router.patch('/notices/:id/activate', activatePrivacyNotice);

module.exports = router;

