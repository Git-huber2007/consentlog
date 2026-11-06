const mongoose = require('mongoose');

/**
 * ConsentLog - Append-Only Immutable Audit Model
 *
 * SECURITY ARCHITECTURE:
 * 1. Schema fields are marked `immutable: true` so Mongoose blocks any field modifications.
 * 2. Model hooks block all update, replace, and delete operations at the ODM layer.
 * 3. Cryptographic SHA-256 hash chaining (`previousHash` -> `eventHash`) links every record
 *    sequentially (`sequenceNumber`) so any out-of-band database tampering breaks the chain.
 */
const consentLogSchema = new mongoose.Schema(
  {
    auditId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },
    sequenceNumber: {
      type: Number,
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
      index: true,
    },
    preferenceName: {
      type: String,
      required: true,
      immutable: true,
      index: true,
    },
    previousValue: {
      type: String,
      required: true,
      immutable: true,
    },
    newValue: {
      type: String,
      required: true,
      immutable: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'Consent Granted',
        'Consent Withdrawn',
        'Preference Updated',
        'Notice Accepted',
        'Bulk Consent Accepted',
        'Optional Preferences Rejected',
        'Initial Registration Defaults',
        'System Policy Sync',
        'DSAR Request Submitted',
        'User Data Anonymized (GDPR Art. 17)',
      ],
      immutable: true,
      index: true,
    },
    noticeVersion: {
      type: String,
      required: true,
      immutable: true,
    },
    source: {
      type: String,
      required: true,
      enum: ['User', 'System', 'Admin', 'Preference Centre', 'Privacy Banner', 'Onboarding'],
      default: 'User',
      immutable: true,
      index: true,
    },
    reason: {
      type: String,
      default: 'User-initiated preference update',
      immutable: true,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
      immutable: true,
    },
    userAgent: {
      type: String,
      default: 'ConsentLog-Enterprise-Client/2.0',
      immutable: true,
    },
    timestamp: {
      type: Date,
      required: true,
      immutable: true,
      index: true,
    },
    previousHash: {
      type: String,
      required: true,
      immutable: true,
    },
    eventHash: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound indexes for fast audit filtering & chronological hash chain verification
consentLogSchema.index({ timestamp: -1, sequenceNumber: -1 });
consentLogSchema.index({ userId: 1, timestamp: -1 });
consentLogSchema.index({ preferenceName: 1, action: 1 });

// Block any attempt to update or delete via Mongoose middleware (Append-Only Enforcement)
const forbiddenOperations = [
  'updateOne',
  'updateMany',
  'findOneAndUpdate',
  'findOneAndReplace',
  'replaceOne',
  'deleteOne',
  'deleteMany',
  'findOneAndDelete',
  'findOneAndRemove',
];

forbiddenOperations.forEach((op) => {
  consentLogSchema.pre(op, function (next) {
    const err = new Error(
      `SECURITY VIOLATION: ConsentLog audit records are strictly append-only. Operation '${op}' is prohibited.`
    );
    err.statusCode = 403;
    next(err);
  });
});

consentLogSchema.pre('save', function (next) {
  if (!this.isNew) {
    const err = new Error(
      'SECURITY VIOLATION: Existing ConsentLog audit documents are immutable and cannot be modified.'
    );
    err.statusCode = 403;
    return next(err);
  }
  next();
});

module.exports = mongoose.model('ConsentLog', consentLogSchema);
