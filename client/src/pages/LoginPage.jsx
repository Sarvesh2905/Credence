import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required.';
    if (!form.password) errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success('Welcome back!');
      
      // Redirect based on onboarding status
      if (data.user.isOnboarded) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed.';
      toast.error(msg);
      
      // If needs verification, redirect to signup with state
      if (error.response?.data?.needsVerification) {
        toast('Please verify your email first.', { icon: '📧' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />
      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">Credence</span>
        </Link>

        <div className="auth-card glass-card animate-fadeInUp">
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Login to continue your career comeback journey.</p>

          <form onSubmit={handleSubmit} className="auth-form">
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
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
              {errors.password && <span className="input-error">{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><div className="spinner spinner-sm" /> Logging in...</> : 'Login'}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/signup">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
