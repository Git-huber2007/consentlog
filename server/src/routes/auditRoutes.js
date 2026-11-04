const express = require('express');
const router = express.Router();
const {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  runAuditVerification,
} = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Strictly append-only: Only GET and POST /verify are exposed.
// Any PUT, PATCH, or DELETE to /api/audit/* is explicitly rejected with 403 Forbidden.
const blockMutation = (req, res) => {
  return res.status(403).json({
    success: false,
    error: 'IMMUTABLE_AUDIT_VIOLATION',
    message: `SECURITY POLICY: ConsentLog audit records are strictly append-only. HTTP ${req.method} on audit records is permanently prohibited.`,
  });
};

router.get('/logs', getAuditLogs);
router.put('/logs', blockMutation);
router.patch('/logs', blockMutation);
router.delete('/logs', blockMutation);

router.get('/logs/:id', getAuditLogById);
router.put('/logs/:id', blockMutation);
router.patch('/logs/:id', blockMutation);
router.delete('/logs/:id', blockMutation);

router.get('/stats', getAuditStats);
router.post('/verify', runAuditVerification);

module.exports = router;

