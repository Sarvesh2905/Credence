const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check username availability
const checkUsername = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.length < 3) {
      return res.status(400).json({ available: false, message: 'Username must be at least 3 characters.' });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });

    if (existing) {
      return res.status(200).json({ available: false, message: 'Username is already taken.' });
    }

    return res.status(200).json({ available: true, message: 'Username is available.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error checking username.' });
  }
};

// Signup — create account and send OTP
const signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check for existing user
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username is already taken.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create user (unverified)
    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
      otp: {
        code: otp,
        expiresAt: otpExpiry,
        used: false,
      },
    });

    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, username);

    if (!emailResult.success) {
      console.error('OTP email failed:', emailResult.error);
    }

    // In development, include OTP in response for testing
    const isDev = process.env.NODE_ENV !== 'production';
    console.log(`🔑 [DEV] OTP for ${email}: ${otp}`);

    return res.status(201).json({
      message: emailResult.success
        ? 'Account created. Please verify your email with the OTP sent.'
        : 'Account created. OTP email failed — check console for OTP (dev mode).',
      userId: user._id,
      ...(isDev && { devOtp: otp }), // Only in dev mode
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error during signup.' });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP are required.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    if (user.otp.used) {
      return res.status(400).json({ message: 'OTP has already been used. Please request a new one.' });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp.used = true;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.username);

    return res.status(200).json({ message: 'Email verified successfully! You can now login.' });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ message: 'Server error during verification.' });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    // Check cooldown (prevent spam — 60 second cooldown)
    if (user.otp.expiresAt && (new Date(user.otp.expiresAt).getTime() - Date.now()) > 4 * 60 * 1000) {
      return res.status(429).json({ message: 'Please wait before requesting a new OTP.' });
    }

    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      used: false,
    };
    await user.save();

    await sendOTPEmail(user.email, otp, user.username);

    const isDev = process.env.NODE_ENV !== 'production';
    console.log(`🔑 [DEV] Resent OTP for ${user.email}: ${otp}`);

    return res.status(200).json({
      message: 'New OTP sent to your email.',
      ...(isDev && { devOtp: otp }),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error resending OTP.' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Email not verified. Please verify your email first.',
        userId: user._id,
        needsVerification: true,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      isOnboarded: user.isOnboarded,
      isVerified: user.isVerified,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Logout
const logout = async (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully.' });
};

module.exports = {
  checkUsername,
  signup,
  verifyOTP,
  resendOTP,
  login,
  getMe,
  logout,
};
