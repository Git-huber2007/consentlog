const express = require('express');
const router = express.Router();
const {
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

// Feature 2: Webhooks
router.get('/webhooks', getWebhooks);
router.post('/webhooks', createWebhook);
router.post('/webhooks/:id/test', testWebhook);
router.delete('/webhooks/:id', deleteWebhook);

// Feature 3: DSAR Erasure Management
router.get('/dsar/requests', getDsarRequests);
router.post('/dsar/requests/:id/process', processDsarRequest);

// Feature 4: Cookie Inventory & Scanning
router.get('/cookies', getCookieInventory);
router.post('/cookies/scan', scanDomainCookies);

// Feature 5: API Keys
router.get('/api-keys', getApiKeys);
router.post('/api-keys', createApiKey);
router.delete('/api-keys/:id', revokeApiKey);

module.exports = router;
