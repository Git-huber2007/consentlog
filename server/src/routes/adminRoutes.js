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

// Protect all following routes with authentication
router.use(protect);

// 1. Overview & Analytics: accessible by admin, auditor, and dpo
router.get('/dashboard', authorize('admin', 'auditor', 'dpo'), getDashboardAnalytics);

// 2. User Management: strictly admin
router.get('/users', authorize('admin'), getAllUsersWithConsent);

// 3. Privacy Notices: strictly admin
router.post('/notices', authorize('admin'), publishPrivacyNotice);
router.patch('/notices/:id/activate', authorize('admin'), activatePrivacyNotice);

// 4. Feature 2: Webhooks (strictly admin)
router.get('/webhooks', authorize('admin'), getWebhooks);
router.post('/webhooks', authorize('admin'), createWebhook);
router.post('/webhooks/:id/test', authorize('admin'), testWebhook);
router.delete('/webhooks/:id', authorize('admin'), deleteWebhook);

// 5. Feature 3: DSAR Erasure Management (admin and dpo)
router.get('/dsar/requests', authorize('admin', 'dpo'), getDsarRequests);
router.post('/dsar/requests/:id/process', authorize('admin', 'dpo'), processDsarRequest);

// 6. Feature 4: Cookie Inventory & Scanning (admin and dpo)
router.get('/cookies', authorize('admin', 'dpo'), getCookieInventory);
router.post('/cookies/scan', authorize('admin', 'dpo'), scanDomainCookies);

// 7. Feature 5: API Keys (strictly admin)
router.get('/api-keys', authorize('admin'), getApiKeys);
router.post('/api-keys', authorize('admin'), createApiKey);
router.delete('/api-keys/:id', authorize('admin'), revokeApiKey);

module.exports = router;
