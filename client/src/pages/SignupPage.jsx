import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './AuthPages.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds
  const [otpSending, setOtpSending] = useState(false);
  const otpRefs = useRef([]);
  const usernameTimeout = useRef(null);

  // Username availability check (debounced)
  useEffect(() => {
    if (usernameTimeout.current) clearTimeout(usernameTimeout.current);

    if (form.username.length >= 3) {
      setUsernameStatus('checking');
      usernameTimeout.current = setTimeout(async () => {
        try {
          const { data } = await authAPI.checkUsername(form.username);
          setUsernameStatus(data.available ? 'available' : 'taken');
        } catch {
          setUsernameStatus(null);
        }
      }, 500);
    } else {
      setUsernameStatus(null);
    }

    return () => clearTimeout(usernameTimeout.current);
  }, [form.username]);

  // OTP Timer countdown
  useEffect(() => {
    if (!showOTP || otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showOTP, otpTimer]);

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 2) return { level: score, label: 'Weak',   color: 'var(--danger)' };
    if (score <= 3) return { level: score, label: 'Fair',   color: 'var(--gold)' };
    return             { level: score, label: 'Strong', color: 'var(--success)' };
  };

  const validate = () => {
    const errs = {};
    if (!form.username || form.username.length < 3) errs.username = 'Username must be at least 3 characters.';
    if (usernameStatus === 'taken') errs.username = 'Username is already taken.';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required.';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await authAPI.signup(form);
      setUserId(data.userId);
      setShowOTP(true);
      setOtpTimer(300);
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.verifyOTP({ userId, otp: otpCode });
      toast.success('Email verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpSending) return;
    setOtpSending(true);
    try {
      await authAPI.resendOTP({ userId });
      setOtpTimer(300);
      setOtp(['', '', '', '', '', '']);
      toast.success('New OTP sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setTimeout(() => setOtpSending(false), 60000); // 60s cooldown
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />
      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">Credence</span>
        </Link>

        {!showOTP ? (
          <div className="auth-card glass-card animate-fadeInUp">
            <h1>Create Account</h1>
            <p className="auth-subtitle">Join Credence and prove your career readiness.</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label>Username <span className="required">*</span></label>
                <div className="input-with-icon">
                  <HiOutlineUser className="input-icon" />
                  <input
                    type="text"
                    className={`input-field ${errors.username ? 'error' : usernameStatus === 'available' ? 'success' : ''}`}
                    placeholder="Choose a username"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  />
                  {usernameStatus === 'checking' && <div className="input-status-icon spinner spinner-sm" />}
                  {usernameStatus === 'available' && <HiOutlineCheck className="input-status-icon success-icon" />}
                  {usernameStatus === 'taken' && <HiOutlineX className="input-status-icon error-icon" />}
                </div>
                {usernameStatus === 'taken' && <span className="input-error">Username is already taken.</span>}
                {usernameStatus === 'available' && <span className="input-success">Username is available!</span>}
                {errors.username && usernameStatus !== 'taken' && <span className="input-error">{errors.username}</span>}
              </div>

              <div className="input-group">
                <label>Email <span className="required">*</span></label>
                <div className="input-with-icon">
                  <HiOutlineMail className="input-icon" />
                  <input
                    type="email"
                    className={`input-field ${errors.email ? 'error' : ''}`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                {errors.email && <span className="input-error">{errors.email}</span>}
              </div>

              <div className="input-group">
                <label>Password <span className="required">*</span></label>
                <div className="input-with-icon">
                  <HiOutlineLockClosed className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`input-field ${errors.password ? 'error' : ''}`}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                  <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  </button>
                </div>
                {form.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div className="strength-fill" style={{ width: `${(strength.level / 5) * 100}%`, background: strength.color }} />
                    </div>
                    <span style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}
                {errors.password && <span className="input-error">{errors.password}</span>}
              </div>

              <div className="input-group">
                <label>Confirm Password <span className="required">*</span></label>
                <div className="input-with-icon">
                  <HiOutlineLockClosed className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                  <button type="button" className="input-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="input-error">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? <><div className="spinner spinner-sm" /> Creating Account...</> : 'Create Account'}
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        ) : (
          <div className="auth-card glass-card animate-fadeInUp">
            <h1>Verify Email</h1>
            <p className="auth-subtitle">Enter the 6-digit OTP sent to <strong>{form.email}</strong></p>

            <div className="otp-container">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-input"
                  value={digit}
                  onChange={e => handleOTPChange(i, e.target.value)}
                  onKeyDown={e => handleOTPKeyDown(i, e)}
                />
              ))}
            </div>

            <div className="otp-timer">
              {otpTimer > 0 ? (
                <span>OTP expires in <strong style={{ color: otpTimer < 60 ? 'var(--accent-danger)' : 'var(--accent-primary)' }}>{formatTime(otpTimer)}</strong></span>
              ) : (
                <span style={{ color: 'var(--accent-danger)' }}>OTP expired</span>
              )}
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={handleVerifyOTP}
              disabled={loading || otpTimer <= 0}
            >
              {loading ? <><div className="spinner spinner-sm" /> Verifying...</> : 'Verify OTP'}
            </button>

            <button
              className="btn btn-ghost"
              style={{ width: '100%', marginTop: '12px' }}
              onClick={handleResendOTP}
              disabled={otpSending}
            >
              {otpSending ? <><div className="spinner spinner-sm" /> Please wait...</> : 'Resend OTP'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
