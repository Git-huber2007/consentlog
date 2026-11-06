const express = require('express');
const router = express.Router();
const {
  acceptAllConsent,
  rejectOptionalConsent,
  withdrawConsent,
  getConsentStatus,
  getConsentRetentionInfo,
  submitDsarRequest,
  getMyDsarRequests,
} = require('../controllers/preferenceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/accept-all', acceptAllConsent);
router.post('/reject-optional', rejectOptionalConsent);
router.post('/withdraw', withdrawConsent);
router.get('/status', getConsentStatus);
router.get('/retention', getConsentRetentionInfo);
router.post('/dsar/request', submitDsarRequest);
router.get('/dsar/my-requests', getMyDsarRequests);

module.exports = router;
