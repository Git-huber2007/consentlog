const mongoose = require('mongoose');

const preferenceMetaSchema = new mongoose.Schema(
  {
    lastModified: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Always Active', 'Granted', 'Disabled', 'Withdrawn'],
      default: 'Disabled',
    },
  },
  { _id: false }
);

const preferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    essential: {
      type: Boolean,
      default: true,
      required: true,
      validate: {
        validator: (v) => v === true,
        message: 'Essential cookies must always remain enabled and cannot be disabled.',
      },
    },
    analytics: {
      type: Boolean,
      default: false,
      required: true,
    },
    marketing: {
      type: Boolean,
      default: false,
      required: true,
    },
    personalization: {
      type: Boolean,
      default: false,
      required: true,
    },
    thirdPartySharing: {
      type: Boolean,
      default: false,
      required: true,
    },
    categoryMeta: {
      essential: {
        type: preferenceMetaSchema,
        default: () => ({ lastModified: new Date(), status: 'Always Active' }),
      },
      analytics: {
        type: preferenceMetaSchema,
        default: () => ({ lastModified: new Date(), status: 'Disabled' }),
      },
      marketing: {
        type: preferenceMetaSchema,
        default: () => ({ lastModified: new Date(), status: 'Disabled' }),
      },
      personalization: {
        type: preferenceMetaSchema,
        default: () => ({ lastModified: new Date(), status: 'Disabled' }),
      },
      thirdPartySharing: {
        type: preferenceMetaSchema,
        default: () => ({ lastModified: new Date(), status: 'Disabled' }),
      },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

preferenceSchema.pre('save', function (next) {
  // Enforce business rule: essential cookies must ALWAYS remain true
  this.essential = true;
  if (this.categoryMeta && this.categoryMeta.essential) {
    this.categoryMeta.essential.status = 'Always Active';
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Preference', preferenceSchema);

