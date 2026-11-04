const mongoose = require('mongoose');

const auditVerificationSchema = new mongoose.Schema(
  {
    verificationId: {
      type: String,
      required: true,
      unique: true,
    },
    verificationDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    totalRecords: {
      type: Number,
      required: true,
    },
    verifiedRecords: {
      type: Number,
      required: true,
    },
    failedRecords: {
      type: Number,
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Verification Failed', 'Verification Pending'],
      required: true,
    },
    genesisHash: {
      type: String,
      default: '0000000000000000000000000000000000000000000000000000000000000000',
    },
    headHash: {
      type: String,
      default: '',
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    triggeredBy: {
      type: String,
      default: 'System Auditor',
    },
    brokenLinks: [
      {
        auditId: String,
        sequenceNumber: Number,
        reason: String,
        expectedHash: String,
        actualHash: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AuditVerification', auditVerificationSchema);

