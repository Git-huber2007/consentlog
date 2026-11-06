const mongoose = require('mongoose');

const cookieInventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['essential', 'analytics', 'marketing', 'personalization', 'thirdPartySharing'],
      required: true,
      index: true,
    },
    domain: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      default: 'Session',
    },
    description: {
      type: String,
      required: true,
    },
    isHttpOnly: {
      type: Boolean,
      default: false,
    },
    isSecure: {
      type: Boolean,
      default: true,
    },
    organization: {
      type: String,
      default: 'Enterprise Global Corp',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CookieInventory', cookieInventorySchema);

