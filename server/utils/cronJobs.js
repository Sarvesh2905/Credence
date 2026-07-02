const cron = require('node-cron');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Streak = require('../models/Streak');
const Passport = require('../models/Passport');
const { sendWeeklyDigest, sendReengagementEmail } = require('../services/emailService');

/**
 * Initialize all cron jobs for scheduled email notifications.
 * Called once from server.js after MongoDB connects.
 */
const initCronJobs = () => {
  console.log('⏰ Cron jobs initialized.');

  // ===== WEEKLY PROGRESS DIGEST =====
  // Runs every Monday at 9:00 AM IST
  cron.schedule('0 9 * * 1', async () => {
    console.log('📧 Running weekly progress digest...');
    try {
      const users = await User.find({ isVerified: true, isOnboarded: true });

      for (const user of users) {
        try {
          const profile = await Profile.findOne({ userId: user._id });
          const streak = await Streak.findOne({ userId: user._id });
          const passport = await Passport.findOne({ userId: user._id });

          if (!profile) continue;

          const latestAssessment = passport?.assessments?.length > 0
            ? passport.assessments[passport.assessments.length - 1]
            : null;

          const digestData = {
            name: profile.name,
            email: user.email,
            currentStreak: streak?.currentStreak || 0,
            totalAssessments: passport?.assessments?.length || 0,
            latestScore: latestAssessment?.overallScore || null,
            growth: passport?.overallGrowth || 0,
            hiringEligible: passport?.isHiringEligible || false,
          };

          await sendWeeklyDigest(digestData);
        } catch (userError) {
          console.error(`Weekly digest error for ${user.email}:`, userError.message);
        }
      }

      console.log(`✅ Weekly digest sent to ${users.length} users.`);
    } catch (error) {
      console.error('❌ Weekly digest cron error:', error.message);
    }
  }, {
    timezone: 'Asia/Kolkata',
  });

  // ===== RE-ENGAGEMENT EMAILS =====
  // Runs daily at 10:00 AM IST — targets users inactive for 7+ days
  cron.schedule('0 10 * * *', async () => {
    console.log('📧 Running re-engagement check...');
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Find users who haven't been active in 7+ days
      const streaks = await Streak.find({
        lastActiveDate: { $lt: sevenDaysAgo },
        currentStreak: 0,
      }).populate('userId');

      let sent = 0;

      for (const streak of streaks) {
        try {
          if (!streak.userId || !streak.userId.isVerified) continue;

          const profile = await Profile.findOne({ userId: streak.userId._id });
          if (!profile) continue;

          // Only send re-engagement if we haven't sent one in the last 7 days
          // (Use a simple check — in production, track email send timestamps)
          const daysSinceActive = Math.floor(
            (Date.now() - new Date(streak.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24)
          );

          // Send at 7 days, 14 days, 30 days intervals
          if ([7, 14, 30].includes(daysSinceActive)) {
            await sendReengagementEmail({
              name: profile.name,
              email: streak.userId.email,
              daysSinceActive,
              streakLost: streak.longestStreak || 0,
            });
            sent++;
          }
        } catch (userError) {
          console.error(`Re-engagement error:`, userError.message);
        }
      }

      console.log(`✅ Re-engagement emails sent: ${sent}`);
    } catch (error) {
      console.error('❌ Re-engagement cron error:', error.message);
    }
  }, {
    timezone: 'Asia/Kolkata',
  });
};

module.exports = initCronJobs;
