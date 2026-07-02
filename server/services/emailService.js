const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Create SMTP Transporter
const createTransporter = () => {
  // If email config is default placeholder, log warning and return mock transporter
  if (!EMAIL_PASS || EMAIL_PASS.includes('xxxx')) {
    console.warn('⚠️  Gmail SMTP is not configured in .env. Emails will only log to console.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

const transporter = createTransporter();

// Helper to send mail via transporter or fallback to console log
const sendMailHelper = async ({ to, subject, html, plainText = '' }) => {
  if (!transporter) {
    console.log(`\n=================== [DEV EMAIL LOG] ===================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${plainText || html.replace(/<[^>]*>/g, '').trim().substring(0, 300)}...`);
    console.log(`========================================================\n`);
    return { success: true, mock: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Credence" <${EMAIL_USER}>`,
      to,
      subject,
      text: plainText,
      html,
    });
    console.log(`📧 Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email failed to send to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

const sendOTPEmail = async (to, otp, username) => {
  const subject = 'Verify Your Credence Account';
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #e0e0e0; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="background: linear-gradient(135deg, #00d4ff, #7b2ffc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0;">Credence</h1>
        <p style="color: #8892b0; font-size: 14px; margin-top: 4px;">Trust Beyond Resumes</p>
      </div>
      <h2 style="color: #ffffff; font-size: 20px;">Hey ${username},</h2>
      <p style="color: #8892b0; font-size: 16px; line-height: 1.6;">
        Welcome to Credence! Use the verification code below to complete your signup:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #1a1f3e, #2a2f5e); padding: 20px 40px; border-radius: 12px; border: 1px solid #3a3f6e;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #00d4ff;">${otp}</span>
        </div>
      </div>
      <p style="color: #8892b0; font-size: 14px; text-align: center;">
        This code expires in <strong style="color: #ff6b6b;">5 minutes</strong>. Do not share it with anyone.
      </p>
      <hr style="border: none; border-top: 1px solid #1a1f3e; margin: 32px 0;" />
      <p style="color: #5a6080; font-size: 12px; text-align: center;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
  `;
  return await sendMailHelper({ to, subject, html, plainText: `Your Credence OTP code is: ${otp}` });
};

const sendWelcomeEmail = async (to, name) => {
  const subject = 'Welcome to Credence — Your Career Comeback Starts Now! 🚀';
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #e0e0e0; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="background: linear-gradient(135deg, #00d4ff, #7b2ffc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0;">Credence</h1>
      </div>
      <h2 style="color: #ffffff;">Welcome aboard, ${name}! 🎉</h2>
      <p style="color: #8892b0; font-size: 16px; line-height: 1.6;">
        Your journey back to the career you deserve starts here. Credence is built to help professionals like you prove that career breaks don't define your capabilities.
      </p>
      <div style="background: linear-gradient(135deg, #1a1f3e, #2a2f5e); padding: 24px; border-radius: 12px; margin: 24px 0;">
        <h3 style="color: #00d4ff; margin-top: 0;">Here's what's next:</h3>
        <p style="color: #c0c0c0;">1. Complete your profile setup</p>
        <p style="color: #c0c0c0;">2. Upload your resume for AI analysis</p>
        <p style="color: #c0c0c0;">3. Take your first personalized assessment</p>
        <p style="color: #c0c0c0;">4. Earn your Career Readiness Passport</p>
      </div>
      <p style="color: #8892b0; text-align: center; font-size: 14px;">
        Trust Beyond Resumes. Your skills speak louder than gaps. 💪
      </p>
    </div>
  `;
  return await sendMailHelper({ to, subject, html });
};

const sendAssessmentCompleteEmail = async (to, name, score) => {
  const subject = `Assessment Complete — Your Career Readiness Score: ${score}/100`;
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #e0e0e0; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="background: linear-gradient(135deg, #00d4ff, #7b2ffc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0;">Credence</h1>
      </div>
      <h2 style="color: #ffffff;">Great work, ${name}! 🏆</h2>
      <p style="color: #8892b0; font-size: 16px; line-height: 1.6;">
        You've completed your assessment. Here's a quick snapshot:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #1a1f3e, #2a2f5e); padding: 30px 50px; border-radius: 16px; border: 2px solid ${score >= 80 ? '#00ff88' : score >= 50 ? '#ffbb33' : '#ff6b6b'};">
          <span style="font-size: 48px; font-weight: 700; color: ${score >= 80 ? '#00ff88' : score >= 50 ? '#ffbb33' : '#ff6b6b'};">${score}</span>
          <span style="font-size: 24px; color: #8892b0;">/100</span>
        </div>
      </div>
      ${score >= 80 ? '<p style="color: #00ff88; text-align: center; font-size: 18px; font-weight: 600;">🎉 You\'ve unlocked Hiring Plan eligibility!</p>' : '<p style="color: #8892b0; text-align: center;">Keep learning and take another assessment to improve your score!</p>'}
      <p style="color: #8892b0; text-align: center; font-size: 14px;">
        Login to view your full results, recommendations, and updated passport.
      </p>
    </div>
  `;
  return await sendMailHelper({ to, subject, html });
};

const sendHiringUnlockedEmail = async (to, name) => {
  const subject = `🔓 You've Unlocked the Hiring Plan — Companies Want You!`;
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #e0e0e0; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="background: linear-gradient(135deg, #00d4ff, #7b2ffc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0;">Credence</h1>
      </div>
      <h2 style="color: #ffffff;">Congratulations, ${name}! 🎊</h2>
      <p style="color: #8892b0; font-size: 16px; line-height: 1.6;">
        Your career readiness score has crossed 80% — you've proven you're industry-ready!
      </p>
      <div style="background: linear-gradient(135deg, #00331a, #004d2a); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #00ff88;">
        <h3 style="color: #00ff88; margin-top: 0;">🔓 Hiring Plan Unlocked</h3>
        <p style="color: #c0c0c0;">You can now subscribe to our Hiring Plan and get referred to our MOU-signed partner companies that match your skills.</p>
      </div>
      <p style="color: #8892b0; text-align: center;">
        Login to your dashboard to activate this opportunity!
      </p>
    </div>
  `;
  return await sendMailHelper({ to, subject, html });
};

// ===== WEEKLY PROGRESS DIGEST =====
const sendWeeklyDigest = async ({ name, email, currentStreak, totalAssessments, latestScore, growth, hiringEligible }) => {
  const scoreDisplay = latestScore !== null ? `${latestScore}/100` : 'No assessment yet';
  const hiringBadge = hiringEligible
    ? '<span style="color: #00ff88; font-weight: 600;">✅ Hiring Eligible</span>'
    : '<span style="color: #8892b0;">🔒 Score 80%+ to unlock</span>';

  const subject = `📊 Your Weekly Credence Progress — ${currentStreak} Day Streak`;
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #e0e0e0; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="background: linear-gradient(135deg, #00d4ff, #7b2ffc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; margin: 0;">Weekly Progress</h1>
      </div>
      <h2 style="color: #ffffff;">Hi ${name},</h2>
      <p style="color: #8892b0; line-height: 1.6;">Here's your career comeback progress this week:</p>
      
      <div style="display: flex; gap: 12px; margin: 24px 0;">
        <div style="flex: 1; background: #111827; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #1e293b;">
          <div style="font-size: 28px; font-weight: 800; color: #00d4ff;">${currentStreak}</div>
          <div style="font-size: 12px; color: #5a6080; text-transform: uppercase;">Day Streak</div>
        </div>
        <div style="flex: 1; background: #111827; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #1e293b;">
          <div style="font-size: 28px; font-weight: 800; color: #7b2ffc;">${totalAssessments}</div>
          <div style="font-size: 12px; color: #5a6080; text-transform: uppercase;">Assessments</div>
        </div>
        <div style="flex: 1; background: #111827; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #1e293b;">
          <div style="font-size: 28px; font-weight: 800; color: #00ff88;">${scoreDisplay}</div>
          <div style="font-size: 12px; color: #5a6080; text-transform: uppercase;">Latest Score</div>
        </div>
      </div>
      
      <p style="color: #8892b0; font-size: 14px;">Growth: <strong style="color: #00d4ff;">${growth}%</strong> | Hiring Status: ${hiringBadge}</p>
      
      <div style="text-align: center; margin-top: 32px;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="background: linear-gradient(135deg, #00d4ff, #7b2ffc); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Continue Your Journey</a>
      </div>
      
      <p style="color: #3d4566; font-size: 12px; text-align: center; margin-top: 32px;">Credence — Trust Beyond Resumes</p>
    </div>
  `;
  return await sendMailHelper({ to: email, subject, html });
};

// ===== RE-ENGAGEMENT EMAIL =====
const sendReengagementEmail = async ({ name, email, daysSinceActive, streakLost }) => {
  const subject = daysSinceActive >= 30
    ? `${name}, we miss you! Your career comeback awaits`
    : daysSinceActive >= 14
    ? `${name}, your streak is waiting — come back!`
    : `${name}, don't lose your momentum! 🔥`;

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #e0e0e0; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="background: linear-gradient(135deg, #00d4ff, #7b2ffc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; margin: 0;">Credence</h1>
      </div>
      <h2 style="color: #ffffff;">Hey ${name},</h2>
      <p style="color: #8892b0; line-height: 1.6;">
        It's been <strong style="color: #ff6b6b;">${daysSinceActive} days</strong> since your last activity on Credence.
        ${streakLost > 0 ? `Your previous streak of <strong style="color: #00d4ff;">${streakLost} days</strong> shows you have the dedication — let's build it back!` : ''}
      </p>
      <p style="color: #8892b0; line-height: 1.6;">
        Career gaps don't define you. Every day you practice brings you closer to proving your true capabilities.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="background: linear-gradient(135deg, #00d4ff, #7b2ffc); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Resume Your Journey</a>
      </div>
      <p style="color: #3d4566; font-size: 12px; text-align: center; margin-top: 32px;">Credence — Trust Beyond Resumes</p>
    </div>
  `;
  return await sendMailHelper({ to: email, subject, html });
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendAssessmentCompleteEmail,
  sendHiringUnlockedEmail,
  sendWeeklyDigest,
  sendReengagementEmail,
};
