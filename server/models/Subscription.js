const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: String,
    enum: ['mentorship', 'hiring'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'locked', 'cancelled'],
    default: 'locked',
  },
  purchasedAt: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  features: [{
    name: String,
    description: String,
    isEnabled: Boolean,
  }],
}, {
  timestamps: true,
});

subscriptionSchema.index({ userId: 1, plan: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
