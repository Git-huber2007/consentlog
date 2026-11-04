const express = require('express');
const router = express.Router();
const {
  getPreferences,
  updatePreferences,
  patchSinglePreference,
} = require('../controllers/preferenceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getPreferences);
router.put('/', updatePreferences);
router.patch('/:name', patchSinglePreference);

module.exports = router;

