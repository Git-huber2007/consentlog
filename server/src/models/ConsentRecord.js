const mongoose = require('mongoose');

const consentRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    noticeVersion: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Accepted', 'Withdrawn', 'Customized', 'Pending Renewal'],
      required: true,
      default: 'Accepted',
      index: true,
    },
    preferencesSnapshot: {
      essential: { type: Boolean, default: true },
      analytics: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
      personalization: { type: Boolean, default: false },
      thirdPartySharing: { type: Boolean, default: false },
    },
    acceptedAt: {
      type: Date,
      default: Date.now,
    },
    withdrawnAt: {
      type: Date,
      default: null,
    },
    acknowledgementMethod: {
      type: String,
      enum: ['Explicit Banner Acceptance', 'Preference Centre Save', 'Privacy Notice Centre Review', 'Onboarding Consent', 'Withdrawal Action'],
      default: 'Preference Centre Save',
    },
  },
  {
    timestamps: true,
  }
);

consentRecordSchema.index({ userId: 1, noticeVersion: 1 });

module.exports = mongoose.model('ConsentRecord', consentRecordSchema);

