import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineShieldCheck, HiOutlineAcademicCap, HiOutlineChartBar, 
  HiOutlineUsers, HiOutlineArrowRight, HiOutlineLightningBolt,
  HiOutlineDocumentReport, HiOutlineStar, HiOutlineBadgeCheck,
  HiOutlineLockClosed, HiOutlineLockOpen
} from 'react-icons/hi';
import './LandingPage.css';

const LandingPage = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { icon: '📝', title: 'Sign Up & Profile', desc: 'Create your account, upload your resume, and let our AI understand your background.' },
    { icon: '🧠', title: 'AI Assessment', desc: 'Take a personalized, role-specific assessment tailored to your skills and target role.' },
    { icon: '🎫', title: 'Get Your Passport', desc: 'Receive a verified Career Readiness Passport with detailed skill scores and growth metrics.' },
    { icon: '🚀', title: 'Get Hired', desc: 'Use your passport as proof, connect with mentors, and get referred to partner companies.' },
  ];

  const features = [
    { icon: <HiOutlineShieldCheck />, title: 'AI-Powered Assessments', desc: 'Every profession gets a completely different assessment pipeline. No generic tests.' },
    { icon: <HiOutlineDocumentReport />, title: 'Career Readiness Passport', desc: 'A verified credential showcasing your skills, scores, and growth across assessments.' },
    { icon: <HiOutlineChartBar />, title: 'Growth Analytics', desc: 'Track your improvement from assessment to assessment with detailed performance graphs.' },
    { icon: <HiOutlineAcademicCap />, title: 'Smart Recommendations', desc: 'AI-driven suggestions on what to learn next based on industry requirements.' },
    { icon: <HiOutlineUsers />, title: 'Industry Mentorship', desc: '1:1 sessions with industry experts who understand career transitions.' },
    { icon: <HiOutlineLightningBolt />, title: 'Gamified Streaks', desc: 'Stay motivated with daily engagement tracking and milestone achievements.' },
  ];

  const professions = [
    { 
      role: 'Software Engineer', 
      sections: ['Coding Sandbox', 'Hidden Test Cases', 'Debugging', 'System Design', 'AI Pair Programming', 'Git Workflow'] 
    },
    { 
      role: 'Marketing Professional', 
      sections: ['Campaign Design', 'Market Analysis', 'Customer Persona', 'Budget Planning', 'Brand Strategy', 'AI Marketing Tools'] 
    },
    { 
      role: 'HR Professional', 
      sections: ['Conflict Resolution', 'Hiring Simulation', 'Policy Creation', 'Employee Case Studies', 'Communication Assessment'] 
    },
    { 
      role: 'UI/UX Designer', 
      sections: ['Figma Challenge', 'Accessibility Review', 'User Journey Design', 'Visual Hierarchy Evaluation'] 
    },
  ];

  return (
    <div className="landing">
      {/* Floating particles background */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 20}s`,
          }} />
        ))}
      </div>

      {/* ===== NAVBAR ===== */}
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">◆</span>
            <span className="logo-text">Credence</span>
          </Link>
          <div className="nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Plans</a>
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <div className="hero-badge">
              <HiOutlineStar />
              <span>Career Re-Entry Platform</span>
            </div>
            <h1 className="hero-title">
              <span className="gradient-text">Trust Beyond</span>
              <br />
              <span>Resumes</span>
            </h1>
            <p className="hero-subtitle">
              Career breaks don't define your capabilities. Credence uses AI to create 
              personalized assessments that prove your real skills — giving you a 
              verified Career Readiness Passport that speaks louder than any resume gap.
            </p>
            <div className="hero-cta">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start Your Journey <HiOutlineArrowRight />
              </Link>
              <a href="#how-it-works" className="btn btn-secondary btn-lg">
                Learn More
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-value">AI-Powered</span>
                <span className="stat-label">Assessments</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-value">Role-Specific</span>
                <span className="stat-label">Evaluation</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-value">Verified</span>
                <span className="stat-label">Passport</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== PROBLEM ===== */}
      <section className="problem-section">
        <div className="section">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">The <span className="gradient-text">Problem</span></h2>
            <p className="section-subtitle">
              Career re-entry after a break is one of the most common professional situations — 
              and one of the worst served by existing systems.
            </p>
          </motion.div>
          <div className="problem-grid">
            <motion.div className="problem-card glass-card" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="problem-icon">🚫</div>
              <h3>Resume Gaps = Rejection</h3>
              <p>Hiring algorithms filter for recency. A 2-year gap means your application never reaches human eyes.</p>
            </motion.div>
            <motion.div className="problem-card glass-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="problem-icon">🔇</div>
              <h3>Skills Treated as Expired</h3>
              <p>Years of leadership, technical expertise, and professional growth — treated as if they expired during the break.</p>
            </motion.div>
            <motion.div className="problem-card glass-card" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <div className="problem-icon">❓</div>
              <h3>No Way to Prove Readiness</h3>
              <p>There's no standardized way for career returners to demonstrate they've caught up with industry changes.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="how-section">
        <div className="section">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="section-title">How <span className="gradient-text">Credence</span> Works</h2>
            <p className="section-subtitle">Four simple steps to prove your career readiness.</p>
          </motion.div>
          <div className="steps-container">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className={`step-card glass-card ${activeStep === i ? 'active' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                onMouseEnter={() => setActiveStep(i)}
              >
                <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < steps.length - 1 && <div className="step-connector" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="features-section">
        <div className="section">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="section-title">Why <span className="gradient-text">Credence</span>?</h2>
            <p className="section-subtitle">Built specifically for career re-entry professionals.</p>
          </motion.div>
          <div className="features-grid">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="feature-card glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROFESSION SHOWCASE ===== */}
      <section className="profession-section">
        <div className="section">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="section-title">Every Profession Gets a <span className="gradient-text">Different Journey</span></h2>
            <p className="section-subtitle">There is no universal assessment. AI creates personalized assessment pipelines.</p>
          </motion.div>
          <div className="profession-grid">
            {professions.map((prof, i) => (
              <motion.div 
                key={i} 
                className="profession-card glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h3 className="gradient-text">{prof.role}</h3>
                <div className="profession-sections">
                  {prof.sections.map((sec, j) => (
                    <span key={j} className="profession-tag">{sec}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="pricing-section">
        <div className="section">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="section-title">Subscription <span className="gradient-text">Plans</span></h2>
            <p className="section-subtitle">Choose the plan that fits your career comeback journey.</p>
          </motion.div>
          <div className="pricing-grid">
            <motion.div 
              className="pricing-card glass-card"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="pricing-badge badge badge-primary">
                <HiOutlineLockOpen /> Available
              </div>
              <h3>Mentorship Plan</h3>
              <div className="pricing-price">
                <span className="price-amount">₹2,999</span>
                <span className="price-period">/month</span>
              </div>
              <p className="pricing-desc">Get 1:1 guidance from industry experts who understand career transitions.</p>
              <ul className="pricing-features">
                <li><HiOutlineBadgeCheck /> 1:1 session with industry mentor</li>
                <li><HiOutlineBadgeCheck /> Personalized career guidance path</li>
                <li><HiOutlineBadgeCheck /> Industry trends briefing</li>
                <li><HiOutlineBadgeCheck /> Mentor-led skill assessment</li>
                <li><HiOutlineBadgeCheck /> Career roadmap creation</li>
              </ul>
              <Link to="/signup" className="btn btn-secondary" style={{ width: '100%' }}>Get Started</Link>
            </motion.div>

            <motion.div 
              className="pricing-card glass-card premium"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="pricing-badge badge badge-warning">
                <HiOutlineLockClosed /> Unlocks at 80%+ Score
              </div>
              <h3>Hiring Plan</h3>
              <div className="pricing-price">
                <span className="price-amount">₹4,999</span>
                <span className="price-period">/month</span>
              </div>
              <p className="pricing-desc">Get referred to partner companies that match your verified skills.</p>
              <ul className="pricing-features">
                <li><HiOutlineBadgeCheck /> Company referrals from MOU partners</li>
                <li><HiOutlineBadgeCheck /> Skill-matched job opportunities</li>
                <li><HiOutlineBadgeCheck /> Priority application processing</li>
                <li><HiOutlineBadgeCheck /> Interview preparation support</li>
                <li><HiOutlineBadgeCheck /> Direct recruiter connection</li>
              </ul>
              <div className="btn btn-ghost" style={{ width: '100%', opacity: 0.5 }}>
                <HiOutlineLockClosed /> Score 80%+ to Unlock
              </div>
            </motion.div>
          </div>
          <motion.p 
            className="pricing-note"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            📄 Career Readiness Report download is <strong>always free</strong> for all users.
          </motion.p>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="section">
          <motion.div 
            className="cta-container glass-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Prove Your <span className="gradient-text">Worth</span>?</h2>
            <p>Your skills speak louder than gaps. Start your career comeback today.</p>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Create Free Account <HiOutlineArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="nav-logo">
              <span className="logo-icon">◆</span>
              <span className="logo-text">Credence</span>
            </div>
            <p>Trust Beyond Resumes — Bridging the career re-entry gap with AI-powered skill verification.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              <a href="#how-it-works">How It Works</a>
              <a href="#features">Features</a>
              <a href="#pricing">Plans</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Contact</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Credence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
