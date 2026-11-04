const mongoose = require('mongoose');

const clauseSchema = new mongoose.Schema(
  {
    clauseId: { type: String, required: true },
    heading: { type: String, required: true },
    body: { type: String, required: true },
    category: {
      type: String,
      enum: ['General', 'Essential', 'Analytics', 'Marketing', 'Personalization', 'ThirdParty', 'UserRights', 'Security'],
      default: 'General',
    },
  },
  { _id: false }
);

const privacyNoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    version: {
      type: String,
      required: [true, 'Version number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Archived', 'Draft'],
      default: 'Draft',
      index: true,
    },
    summaryOfChanges: {
      type: String,
      required: true,
    },
    highlights: [
      {
        type: String,
      },
    ],
    content: {
      type: String,
      required: [true, 'Full notice content is required'],
    },
    clauses: [clauseSchema],
    effectiveDate: {
      type: Date,
      required: true,
    },
    publicationDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    requiresRenewedConsent: {
      type: Boolean,
      default: true,
    },
    publishedBy: {
      type: String,
      default: 'Chief Privacy Officer (Admin)',
    },
    regulatoryFrameworks: {
      type: [String],
      default: ['GDPR (EU) 2016/679', 'CCPA / CPRA', 'ISO/IEC 27701', 'India DPDP Act 2023'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PrivacyNotice', privacyNoticeSchema);

