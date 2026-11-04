const express = require('express');
const router = express.Router();
const {
  getAllNotices,
  getActiveNotice,
  getNoticeByVersion,
  acknowledgeNotice,
} = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAllNotices);
router.get('/active', getActiveNotice);
router.get('/:version', getNoticeByVersion);
router.post('/acknowledge', acknowledgeNotice);

module.exports = router;

