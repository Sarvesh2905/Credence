const Profile = require('../models/Profile');
const User = require('../models/User');
const Streak = require('../models/Streak');
const Passport = require('../models/Passport');
const cloudinary = require('../config/cloudinary');
const { analyzeResume } = require('../services/aiService');
const multer = require('multer');
const { v4: uuidv4 } = require('crypto');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'), false);
    }
  },
});

// Create or update profile
const createProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name, gender, age, careerGapDays, careerGapFrom, careerGapTo,
      breakReason, areaOfInterest, experience, pastRole, pastCompany, domain,
      linkedIn, github, preferredCompanies,
    } = req.body;

    // Safe parser: handles JSON arrays, comma-separated strings, or plain text
    const parseArrayField = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch { /* not JSON */ }
      return val.split(',').map(s => s.trim()).filter(Boolean);
    };

    // Parse array fields
    const interests = parseArrayField(areaOfInterest);
    const companies = parseArrayField(preferredCompanies);

    let resumeUrl = null;
    let resumePublicId = null;
    let resumeAnalysis = null;

    // Handle resume upload
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: 'credence/resumes',
        resource_type: 'raw',
        format: 'pdf',
      });

      resumeUrl = uploadResult.secure_url;
      resumePublicId = uploadResult.public_id;

      // AI Resume Analysis — we extract text from the uploaded buffer
      // For now, we send the base64 for analysis
      try {
        const resumeText = req.file.buffer.toString('utf-8');
        resumeAnalysis = await analyzeResume(resumeText);
      } catch (aiError) {
        console.error('Resume AI analysis failed:', aiError.message);
        resumeAnalysis = { skills: [], summary: 'Analysis pending.' };
      }
    }

    const profileData = {
      userId,
      name,
      gender,
      age: parseInt(age),
      careerGap: {
        days: parseInt(careerGapDays) || 0,
        ...(careerGapFrom ? { from: new Date(careerGapFrom) } : {}),
        ...(careerGapTo   ? { to:   new Date(careerGapTo)   } : {}),
      },
      breakReason: breakReason || null,
      areaOfInterest: interests,
      experience: parseFloat(experience) || 0,
      pastRole,
      pastCompany,
      domain,
      linkedIn: linkedIn || '',
      github: github || '',
      preferredCompanies: companies,
    };

    if (resumeUrl) {
      profileData.resumeUrl = resumeUrl;
      profileData.resumePublicId = resumePublicId;
    }
    if (resumeAnalysis) {
      profileData.resumeAnalysis = resumeAnalysis;
    }

    // Upsert profile
    const profile = await Profile.findOneAndUpdate(
      { userId },
      profileData,
      { upsert: true, new: true, runValidators: true }
    );

    // Mark user as onboarded
    await User.findByIdAndUpdate(userId, { isOnboarded: true });

    // Initialize streak for user
    await Streak.findOneAndUpdate(
      { userId },
      {
        userId,
        currentStreak: 1,
        lastActiveDate: new Date(),
        streakHistory: [{ date: new Date(), activity: 'profile_created' }],
      },
      { upsert: true, new: true }
    );

    // Initialize passport
    const crypto = require('crypto');
    const credenceId = `CRD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    await Passport.findOneAndUpdate(
      { userId },
      { userId, credenceId, assessments: [], badges: [] },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      message: 'Profile created successfully.',
      profile,
    });
  } catch (error) {
    console.error('Profile creation error:', error);
    return res.status(500).json({ message: 'Server error creating profile.' });
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching profile.' });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    return res.status(200).json({ message: 'Profile updated.', profile });
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating profile.' });
  }
};

module.exports = {
  upload,
  createProfile,
  getProfile,
  updateProfile,
};
