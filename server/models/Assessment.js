const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'scenario', 'code', 'essay', 'case_study', 'ranking', 'debugging', 'design'],
    required: true,
  },
  question: { type: String, required: true },
  context: { type: String, default: '' },
  options: [String],
  correctAnswer: { type: String, default: '' },
  userAnswer: { type: String, default: '' },
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 10 },
  feedback: { type: String, default: '' },
  timeSpent: { type: Number, default: 0 }, // seconds
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '📋' },
  questions: [questionSchema],
  sectionScore: { type: Number, default: 0 },
  maxSectionScore: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  isUnlocked: { type: Boolean, default: false },
});

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assessmentNumber: {
    type: Number,
    required: true,
  },
  seekingRole: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    default: '',
  },
  sections: [sectionSchema],
  status: {
    type: String,
    enum: ['generating', 'ready', 'in_progress', 'completed', 'evaluated'],
    default: 'generating',
  },
  careerReadinessScore: {
    type: Number,
    default: 0,
  },
  industryAlignmentScore: {
    type: Number,
    default: 0,
  },
  overallScore: {
    type: Number,
    default: 0,
  },
  skillBreakdown: [{
    skill: String,
    score: Number,
    maxScore: Number,
  }],
  recommendations: [String],
  strengths: [String],
  weaknesses: [String],
  aiSuggestions: {
    techToLearn: [String],
    resourceLinks: [String],
    summary: String,
  },
  totalTimeSpent: { type: Number, default: 0 },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

assessmentSchema.index({ userId: 1, assessmentNumber: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
