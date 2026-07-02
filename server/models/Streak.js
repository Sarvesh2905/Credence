const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastActiveDate: {
    type: Date,
    default: null,
  },
  streakHistory: [{
    date: Date,
    activity: String,
  }],
  milestones: [{
    type: {
      type: String,
      enum: ['momentum', 'unstoppable', 'transformed', 'legend'],
    },
    name: String,
    description: String,
    icon: String,
    achievedAt: Date,
  }],
  freezesUsed: {
    type: Number,
    default: 0,
  },
  freezesAvailable: {
    type: Number,
    default: 1, // 1 free freeze per week
  },
  lastFreezeReset: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Streak', streakSchema);
