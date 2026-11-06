const mongoose = require('mongoose');

const dsarRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      default: 'Enterprise Global Corp',
      index: true,
    },
    jurisdiction: {
      type: String,
      default: 'GDPR (EU)',
    },
    requestType: {
      type: String,
      enum: ['erasure', 'rectification', 'export'],
      default: 'erasure',
      required: true,
    },
    reason: {
      type: String,
      default: 'Data Subject requested right to erasure under GDPR Art. 17',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'rejected'],
      default: 'pending',
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    processedBy: {
      type: String,
      default: null,
    },
    anonymizedIdentifier: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DsarRequest', dsarRequestSchema);

