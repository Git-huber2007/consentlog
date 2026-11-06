const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    secret: {
      type: String,
      required: true,
    },
    events: {
      type: [String],
      default: ['consent.granted', 'consent.withdrawn', 'notice.accepted', 'user.erased'],
    },
    organization: {
      type: String,
      default: 'Enterprise Global Corp',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastTriggeredAt: {
      type: Date,
      default: null,
    },
    lastResponseStatus: {
      type: Number,
      default: null,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Webhook', webhookSchema);

