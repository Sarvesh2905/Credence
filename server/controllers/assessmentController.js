const Assessment = require('../models/Assessment');
const Profile = require('../models/Profile');
const Passport = require('../models/Passport');
const Streak = require('../models/Streak');
const User = require('../models/User');
const { generateAssessment, evaluateAssessment } = require('../services/aiService');
const { sendAssessmentCompleteEmail, sendHiringUnlockedEmail } = require('../services/emailService');

// Start a new assessment
const startAssessment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { seekingRole, jobDescription } = req.body;

    if (!seekingRole) {
      return res.status(400).json({ message: 'Seeking role is required.' });
    }

    // Get user profile and resume analysis
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(400).json({ message: 'Please complete your profile first.' });
    }

    // Get previous assessments to avoid repetition
    const previousAssessments = await Assessment.find({ userId, status: 'evaluated' })
      .sort({ assessmentNumber: -1 })
      .limit(3);

    // Count assessments for numbering
    const assessmentCount = await Assessment.countDocuments({ userId });
    const assessmentNumber = assessmentCount + 1;

    // Create assessment record (status: generating)
    const assessment = new Assessment({
      userId,
      assessmentNumber,
      seekingRole,
      jobDescription: jobDescription || '',
      status: 'generating',
    });
    await assessment.save();

    // Generate assessment using AI (this may take some time)
    try {
      const aiResult = await generateAssessment(
        profile,
        profile.resumeAnalysis,
        seekingRole,
        jobDescription,
        previousAssessments
      );

      // Process sections — unlock first section
      const sections = aiResult.sections.map((section, index) => ({
        ...section,
        isUnlocked: index === 0,
        isCompleted: false,
        sectionScore: 0,
        maxSectionScore: section.questions.reduce((sum, q) => sum + (q.maxScore || 10), 0),
        questions: section.questions.map(q => ({
          ...q,
          userAnswer: '',
          score: 0,
          feedback: '',
          timeSpent: 0,
        })),
      }));

      assessment.sections = sections;
      assessment.status = 'ready';
      await assessment.save();

      return res.status(201).json({
        message: 'Assessment generated successfully.',
        assessment,
      });
    } catch (aiError) {
      assessment.status = 'generating';
      await assessment.save();
      console.error('AI generation failed:', aiError);
      return res.status(500).json({ message: 'Failed to generate assessment. Please try again.' });
    }
  } catch (error) {
    console.error('Start assessment error:', error);
    return res.status(500).json({ message: 'Server error starting assessment.' });
  }
};

// Get assessment by ID
const getAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user._id;

    const assessment = await Assessment.findOne({ _id: assessmentId, userId });

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found.' });
    }

    return res.status(200).json(assessment);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching assessment.' });
  }
};

// Get all assessments for user
const getAssessments = async (req, res) => {
  try {
    const userId = req.user._id;
    const assessments = await Assessment.find({ userId })
      .sort({ assessmentNumber: -1 })
      .select('-sections.questions.correctAnswer');

    return res.status(200).json(assessments);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching assessments.' });
  }
};

// Submit section answers
const submitSection = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { sectionIndex, answers } = req.body;
    const userId = req.user._id;

    const assessment = await Assessment.findOne({ _id: assessmentId, userId });

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found.' });
    }

    if (assessment.status === 'evaluated') {
      return res.status(400).json({ message: 'Assessment already completed.' });
    }

    const section = assessment.sections[sectionIndex];
    if (!section) {
      return res.status(400).json({ message: 'Invalid section index.' });
    }

    if (!section.isUnlocked) {
      return res.status(400).json({ message: 'This section is not yet unlocked.' });
    }

    // Save user answers
    answers.forEach((answer, i) => {
      if (section.questions[i]) {
        section.questions[i].userAnswer = answer.userAnswer || '';
        section.questions[i].timeSpent = answer.timeSpent || 0;
      }
    });

    section.isCompleted = true;

    // Unlock next section
    if (sectionIndex + 1 < assessment.sections.length) {
      assessment.sections[sectionIndex + 1].isUnlocked = true;
    }

    assessment.status = 'in_progress';
    if (!assessment.startedAt) {
      assessment.startedAt = new Date();
    }

    await assessment.save();

    return res.status(200).json({
      message: 'Section submitted successfully.',
      nextSectionUnlocked: sectionIndex + 1 < assessment.sections.length,
    });
  } catch (error) {
    console.error('Submit section error:', error);
    return res.status(500).json({ message: 'Server error submitting section.' });
  }
};

// Submit entire assessment for evaluation
const submitAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user._id;

    const assessment = await Assessment.findOne({ _id: assessmentId, userId });
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found.' });
    }

    // Check all sections completed
    const allCompleted = assessment.sections.every(s => s.isCompleted);
    if (!allCompleted) {
      return res.status(400).json({ message: 'Please complete all sections before submitting.' });
    }

    const profile = await Profile.findOne({ userId });

    // Evaluate using AI
    const evaluation = await evaluateAssessment(
      assessment.sections,
      profile,
      assessment.seekingRole
    );

    // Update assessment with scores
    evaluation.sectionResults.forEach((result, i) => {
      if (assessment.sections[i]) {
        assessment.sections[i].sectionScore = result.sectionScore;
        assessment.sections[i].maxSectionScore = result.maxSectionScore;
        result.questionScores.forEach((qs, j) => {
          if (assessment.sections[i].questions[j]) {
            assessment.sections[i].questions[j].score = qs.score;
            assessment.sections[i].questions[j].feedback = qs.feedback;
          }
        });
      }
    });

    assessment.careerReadinessScore = evaluation.careerReadinessScore;
    assessment.industryAlignmentScore = evaluation.industryAlignmentScore;
    assessment.overallScore = evaluation.overallScore;
    assessment.skillBreakdown = evaluation.skillBreakdown;
    assessment.strengths = evaluation.strengths;
    assessment.weaknesses = evaluation.weaknesses;
    assessment.recommendations = evaluation.recommendations;
    assessment.aiSuggestions = evaluation.aiSuggestions;
    assessment.status = 'evaluated';
    assessment.completedAt = new Date();
    assessment.totalTimeSpent = assessment.sections.reduce(
      (sum, s) => sum + s.questions.reduce((qSum, q) => qSum + (q.timeSpent || 0), 0),
      0
    );

    await assessment.save();

    // Update passport
    const passport = await Passport.findOne({ userId });
    if (passport) {
      passport.assessments.push({
        assessmentNumber: assessment.assessmentNumber,
        date: new Date(),
        seekingRole: assessment.seekingRole,
        careerReadinessScore: assessment.careerReadinessScore,
        industryAlignmentScore: assessment.industryAlignmentScore,
        overallScore: assessment.overallScore,
        skillBreakdown: assessment.skillBreakdown,
      });

      // Calculate growth
      if (passport.assessments.length > 1) {
        const prevScore = passport.assessments[passport.assessments.length - 2].overallScore;
        const currentScore = assessment.overallScore;
        passport.overallGrowth = ((currentScore - prevScore) / prevScore * 100).toFixed(1);
      }

      passport.currentHighestScore = Math.max(
        passport.currentHighestScore,
        assessment.overallScore
      );

      // Check hiring eligibility
      if (assessment.overallScore >= 80 && !passport.isHiringEligible) {
        passport.isHiringEligible = true;
        // Send hiring unlock email
        const user = await User.findById(userId);
        await sendHiringUnlockedEmail(user.email, profile.name);
      }

      await passport.save();
    }

    // Update streak
    const streak = await Streak.findOne({ userId });
    if (streak) {
      streak.streakHistory.push({ date: new Date(), activity: 'assessment_completed' });
      await streak.save();
    }

    // Send assessment completion email
    const user = await User.findById(userId);
    await sendAssessmentCompleteEmail(user.email, profile.name, assessment.overallScore);

    return res.status(200).json({
      message: 'Assessment evaluated successfully.',
      results: {
        careerReadinessScore: assessment.careerReadinessScore,
        industryAlignmentScore: assessment.industryAlignmentScore,
        overallScore: assessment.overallScore,
        skillBreakdown: assessment.skillBreakdown,
        strengths: assessment.strengths,
        weaknesses: assessment.weaknesses,
        recommendations: assessment.recommendations,
        aiSuggestions: assessment.aiSuggestions,
      },
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    return res.status(500).json({ message: 'Server error evaluating assessment.' });
  }
};

module.exports = {
  startAssessment,
  getAssessment,
  getAssessments,
  submitSection,
  submitAssessment,
};
