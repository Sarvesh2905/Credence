const Passport = require('../models/Passport');
const Streak = require('../models/Streak');
const Subscription = require('../models/Subscription');

// Get passport
const getPassport = async (req, res) => {
  try {
    const userId = req.user._id;
    const passport = await Passport.findOne({ userId });

    if (!passport) {
      return res.status(404).json({ message: 'Passport not found. Complete your profile first.' });
    }

    return res.status(200).json(passport);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching passport.' });
  }
};

// Get streak
const getStreak = async (req, res) => {
  try {
    const userId = req.user._id;
    let streak = await Streak.findOne({ userId });

    if (!streak) {
      streak = new Streak({ userId, currentStreak: 0 });
      await streak.save();
    }

    // Check if streak should be reset (if they missed a day of assessment)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (streak.lastActiveDate) {
      const lastActive = new Date(streak.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        // More than 1 day has passed since last assessment — reset to 0
        streak.currentStreak = 0;
        streak.streakHistory.push({ date: new Date(), activity: 'streak_reset_missed_day' });
      }
    } else {
      streak.currentStreak = 0;
    }

    // Weekly freeze reset
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - new Date(streak.lastFreezeReset).getTime() > weekMs) {
      streak.freezesAvailable = 1;
      streak.freezesUsed = 0;
      streak.lastFreezeReset = new Date();
    }

    await streak.save();
    return res.status(200).json(streak);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching streak.' });
  }
};

// Get subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;
    const passport = await Passport.findOne({ userId });
    const subscriptions = await Subscription.find({ userId });

    // Define available plans
    const plans = [
      {
        id: 'mentorship',
        name: 'Mentorship Plan',
        description: 'A one-time 1:1 session with an industry expert who understands career transitions — get a clear guidance path and learn what has changed during your break.',
        price: '₹500',
        priceLabel: 'per session',
        features: [
          'One 1:1 session with an industry mentor',
          'Personalized career guidance path',
          'Industry trends & changes briefing',
          'Mentor-led skill review',
          'Career roadmap creation',
        ],
        isLocked: false,
        isActive: subscriptions.find(s => s.plan === 'mentorship' && s.status === 'active') ? true : false,
      },
      {
        id: 'hiring',
        name: 'Hiring Plan',
        description: 'A one-time referral session — get matched and referred to our MOU-signed partner companies based on your verified Credence score.',
        price: '₹2,500',
        priceLabel: 'per session',
        features: [
          'One referral to skill-matched MOU partners',
          'Verified score shared with recruiters',
          'Priority application processing',
          'Interview preparation support',
          'Direct recruiter connection',
        ],
        isLocked: !passport?.isHiringEligible,
        unlockRequirement: 'Score 80%+ on any assessment',
        isActive: subscriptions.find(s => s.plan === 'hiring' && s.status === 'active') ? true : false,
      },
    ];

    return res.status(200).json(plans);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching subscriptions.' });
  }
};

// Purchase subscription (simulated)
const purchaseSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { plan } = req.body;

    if (!['mentorship', 'hiring'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan.' });
    }

    if (plan === 'hiring') {
      const passport = await Passport.findOne({ userId });
      if (!passport?.isHiringEligible) {
        return res.status(403).json({ message: 'Score 80%+ on an assessment to unlock the Hiring Plan.' });
      }
    }

    // Check for existing active subscription
    const existing = await Subscription.findOne({ userId, plan, status: 'active' });
    if (existing) {
      return res.status(400).json({ message: 'You already have an active subscription for this plan.' });
    }

    const subscription = new Subscription({
      userId,
      plan,
      status: 'active',
      purchasedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    await subscription.save();

    return res.status(201).json({
      message: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan activated successfully!`,
      subscription,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error purchasing subscription.' });
  }
};

// Dashboard data aggregator
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const [profile, passport, streak, subscriptions] = await Promise.all([
      require('../models/Profile').findOne({ userId }),
      Passport.findOne({ userId }),
      Streak.findOne({ userId }),
      Subscription.find({ userId }),
    ]);

    const assessmentCount = await require('../models/Assessment').countDocuments({ userId });
    const latestAssessment = await require('../models/Assessment')
      .findOne({ userId, status: 'evaluated' })
      .sort({ completedAt: -1 });

    return res.status(200).json({
      profile,
      passport,
      streak,
      subscriptions,
      stats: {
        totalAssessments: assessmentCount,
        latestScore: latestAssessment?.overallScore || null,
        hiringEligible: passport?.isHiringEligible || false,
        currentStreak: streak?.currentStreak || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching dashboard data.' });
  }
};

module.exports = {
  getPassport,
  getStreak,
  getSubscriptions,
  purchaseSubscription,
  getDashboardData,
};
