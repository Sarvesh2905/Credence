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

    // Check if streak should be updated (daily login)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (streak.lastActiveDate) {
      const lastActive = new Date(streak.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day — increment streak
        streak.currentStreak += 1;
        streak.lastActiveDate = new Date();
        streak.streakHistory.push({ date: new Date(), activity: 'daily_login' });

        // Check milestones
        if (streak.currentStreak === 7 && !streak.milestones.find(m => m.type === 'momentum')) {
          streak.milestones.push({
            type: 'momentum',
            name: 'Momentum',
            description: '7-day streak! You\'re building momentum.',
            icon: '🔥',
            achievedAt: new Date(),
          });
        } else if (streak.currentStreak === 30 && !streak.milestones.find(m => m.type === 'unstoppable')) {
          streak.milestones.push({
            type: 'unstoppable',
            name: 'Unstoppable',
            description: '30-day streak! Nothing can stop you.',
            icon: '⚡',
            achievedAt: new Date(),
          });
        } else if (streak.currentStreak === 90 && !streak.milestones.find(m => m.type === 'transformed')) {
          streak.milestones.push({
            type: 'transformed',
            name: 'Transformed',
            description: '90-day streak! You\'ve completely transformed.',
            icon: '🦅',
            achievedAt: new Date(),
          });
        }

        streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
      } else if (diffDays > 1) {
        // Streak broken
        streak.currentStreak = 1;
        streak.lastActiveDate = new Date();
        streak.streakHistory.push({ date: new Date(), activity: 'streak_reset' });
      }
      // diffDays === 0: same day, no change needed
    } else {
      streak.currentStreak = 1;
      streak.lastActiveDate = new Date();
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
        description: 'Get 1:1 guidance from industry experts who understand career transitions.',
        price: '₹2,999',
        features: [
          '1:1 session with industry mentor',
          'Personalized guidance path',
          'Industry trends briefing',
          'Mentor-led skill assessment',
          'Career roadmap creation',
        ],
        isLocked: false,
        isActive: subscriptions.find(s => s.plan === 'mentorship' && s.status === 'active') ? true : false,
      },
      {
        id: 'hiring',
        name: 'Hiring Plan',
        description: 'Get referred to partner companies that match your verified skills.',
        price: '₹4,999',
        features: [
          'Company referrals from MOU partners',
          'Skill-matched job opportunities',
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
