const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100,
  },
  careerGap: {
    days: { type: Number, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
  },
  breakReason: {
    type: String,
    enum: [
      'Maternity / Parental Leave',
      'Personal Health / Medical',
      'Family Caregiving',
      'Relocation',
      'Higher Education',
      'Personal Choice / Sabbatical',
      'Layoff / Redundancy',
      'Entrepreneurship / Self-employment',
      'Other',
    ],
    default: null,
  },
  areaOfInterest: [{
    type: String,
    trim: true,
  }],
  experience: {
    type: Number,
    required: true,
    min: 0,
  },
  pastRole: {
    type: String,
    required: true,
    trim: true,
  },
  pastCompany: {
    type: String,
    required: true,
    trim: true,
  },
  domain: {
    type: String,
    required: true,
    trim: true,
  },
  resumeUrl: {
    type: String,
    default: null,
  },
  resumePublicId: {
    type: String,
    default: null,
  },
  resumeAnalysis: {
    skills: [{ name: String, proficiency: String }],
    workExperience: [{ role: String, company: String, duration: String, highlights: [String] }],
    education: [{ degree: String, institution: String, year: String }],
    certifications: [String],
    achievements: [String],
    summary: String,
    rawText: String,
  },
  linkedIn: {
    type: String,
    default: '',
  },
  github: {
    type: String,
    default: '',
  },
  preferredCompanies: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Profile', profileSchema);
