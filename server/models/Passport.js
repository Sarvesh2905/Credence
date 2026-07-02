const mongoose = require('mongoose');

const passportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  credenceId: {
    type: String,
    required: true,
    unique: true,
  },
  assessments: [{
    assessmentNumber: Number,
    date: Date,
    seekingRole: String,
    careerReadinessScore: Number,
    industryAlignmentScore: Number,
    overallScore: Number,
    skillBreakdown: [{
      skill: String,
      score: Number,
      maxScore: Number,
    }],
  }],
  overallGrowth: {
    type: Number,
    default: 0,
  },
  currentHighestScore: {
    type: Number,
    default: 0,
  },
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: Date,
  }],
  isHiringEligible: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Passport', passportSchema);
