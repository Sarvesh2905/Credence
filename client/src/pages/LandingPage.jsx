import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineShieldCheck, HiOutlineAcademicCap, HiOutlineChartBar,
  HiOutlineUsers, HiOutlineArrowRight, HiOutlineLightningBolt,
  HiOutlineDocumentReport, HiOutlineStar, HiOutlineBadgeCheck,
  HiOutlineLockClosed, HiOutlineLockOpen, HiOutlineUserAdd,
  HiOutlineClipboardCheck, HiOutlineIdentification, HiOutlineBriefcase,
  HiOutlineXCircle, HiOutlineVolumeOff, HiOutlineQuestionMarkCircle,
  HiOutlineCheckCircle, HiOutlineSparkles, HiOutlineTrendingUp,
  HiOutlineMenu, HiOutlineX
} from 'react-icons/hi';
import './LandingPage.css';

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(p => (p + 1) % 4), 2800);
    return () => clearInterval(t);
  }, []);

  const steps = [
    { icon: <HiOutlineUserAdd />,        num: '01', title: 'Create Your Profile',   desc: 'Sign up, upload your resume, and let Credence AI understand your background, experience, and career gap.' },
    { icon: <HiOutlineClipboardCheck />, num: '02', title: 'Take AI Assessment',    desc: 'Complete a role-specific, multi-section assessment crafted uniquely for your target job and your profile.' },
    { icon: <HiOutlineIdentification />, num: '03', title: 'Get Your Passport',     desc: 'Receive a verified Career Readiness Passport with detailed skill scores, growth metrics, and AI analysis.' },
    { icon: <HiOutlineBriefcase />,      num: '04', title: 'Book & Get Hired',      desc: 'Book a mentorship or hiring session, get referred to MOU-signed partner companies, and land your comeback.' },
  ];

  const features = [
    { icon: <HiOutlineShieldCheck />,     title: 'AI-Powered Assessments',      desc: 'Every profession gets a completely different assessment pipeline — no generic tests, only precision evaluation.' },
    { icon: <HiOutlineDocumentReport />,  title: 'Career Readiness Passport',   desc: 'A verified, shareable credential with skill scores, growth data, and AI-generated insights for employers.' },
    { icon: <HiOutlineChartBar />,        title: 'Growth Analytics',            desc: "Track your progression from assessment to assessment. Visual graphs show exactly where you've improved." },
    { icon: <HiOutlineAcademicCap />,     title: 'Smart Recommendations',       desc: 'AI-driven next steps based on your score, gaps, and the live requirements of your target industry.' },
    { icon: <HiOutlineUsers />,           title: 'Industry Mentorship',         desc: '1:1 sessions with expert mentors who have navigated career transitions and understand your journey.' },
    { icon: <HiOutlineLightningBolt />,   title: 'Streak & Milestones',         desc: 'Gamified daily engagement keeps you accountable. Earn badges, maintain streaks, and hit milestones.' },
  ];

  const problems = [
    { icon: <HiOutlineXCircle />,             title: 'Resume Gaps = Auto-Rejection',  desc: "Hiring algorithms filter for recency. A gap means your application never reaches human eyes — even if you're fully capable." },
    { icon: <HiOutlineVolumeOff />,           title: 'Skills Treated as Expired',     desc: 'Years of leadership, technical depth, and professional growth — treated as if they expired the moment you paused.' },
    { icon: <HiOutlineQuestionMarkCircle />,  title: 'No Way to Prove Readiness',     desc: "There's no standard for career returners to demonstrate they've caught up with industry changes. Until now." },
  ];

  const professions = [
    { role: 'Software Engineer',       tags: ['Coding Sandbox', 'Hidden Test Cases', 'Debugging', 'System Design', 'AI Pair Programming', 'Git Workflow'] },
    { role: 'Marketing Professional',  tags: ['Campaign Design', 'Market Analysis', 'Customer Persona', 'Budget Planning', 'Brand Strategy', 'AI Tools'] },
    { role: 'HR Professional',         tags: ['Conflict Resolution', 'Hiring Simulation', 'Policy Creation', 'Case Studies', 'Communication'] },
    { role: 'UI/UX Designer',          tags: ['Figma Challenge', 'Accessibility Review', 'User Journey', 'Visual Hierarchy'] },
  ];

  const stats = [
    { val: 'AI-Powered', lbl: 'Assessment Engine' },
    { val: 'Role-Specific', lbl: 'Question Pipeline' },
    { val: 'Verified', lbl: 'Career Passport' },
    { val: 'Always Free', lbl: 'Report Download' },
  ];

  return (
    <div className="landing">

      {/* ===== NAVBAR ===== */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <img src="/favicon.png" alt="Credence" className="nav-logo-img" />
            <span className="logo-text">Credence</span>
          </Link>

          <div className="nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#professions">Professions</a>
            <a href="#pricing">Plans</a>
          </div>

          <div className="nav-actions">
            <Link to="/login"  className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
            <button className="nav-mobile-toggle" onClick={() => setMobileMenuOpen(o => !o)}>
              {mobileMenuOpen ? <HiOutlineX /> : <HiOutlineMenu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="nav-mobile-menu">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#features"     onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#professions"  onClick={() => setMobileMenuOpen(false)}>Professions</a>
            <a href="#pricing"      onClick={() => setMobileMenuOpen(false)}>Plans</a>
            <div className="nav-mobile-ctas">
              <Link to="/login"  className="btn btn-ghost" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg-mesh" />
        <div className="hero-inner">
          <motion.div
            className="hero-content"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div className="hero-badge" variants={fadeUp}>
              <HiOutlineSparkles />
              <span>AI-Powered Career Re-Entry Platform</span>
            </motion.div>

            <motion.h1 className="hero-title" variants={fadeUp}>
              Trust Beyond<br />
              <span className="gradient-text">Resumes</span>
            </motion.h1>

            <motion.p className="hero-subtitle" variants={fadeUp}>
              Career breaks don't define your capabilities. Credence uses AI to build
              personalized assessments that prove your real skills — giving you a
              verified Career Readiness Passport that speaks louder than any gap.
            </motion.p>

            <motion.div className="hero-cta" variants={fadeUp}>
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start Your Journey <HiOutlineArrowRight />
              </Link>
              <a href="#how-it-works" className="btn btn-outline btn-lg">
                See How It Works
              </a>
            </motion.div>

            {/* Mini stats row */}
            <motion.div className="hero-stats" variants={fadeUp}>
              {stats.map((s, i) => (
                <div key={i} className="hero-stat">
                  <span className="hero-stat-val">{s.val}</span>
                  <span className="hero-stat-lbl">{s.lbl}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero card mockup */}
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="passport-mockup">
              <div className="passport-mockup-header">
                <div className="pm-brand">
                  <HiOutlineShieldCheck className="pm-icon" />
                  <span>Credence Passport</span>
                </div>
                <span className="pm-badge">Verified</span>
              </div>
              <div className="pm-name">Priya Sharma</div>
              <div className="pm-role">Senior Marketing Manager · Career Returner</div>
              <div className="pm-scores">
                {[
                  { label: 'Campaign Strategy', pct: 88 },
                  { label: 'Data Analytics',    pct: 74 },
                  { label: 'AI Marketing Tools',pct: 91 },
                  { label: 'Brand Management',  pct: 82 },
                ].map((s, i) => (
                  <div key={i} className="pm-score-row">
                    <div className="pm-score-label">
                      <span>{s.label}</span>
                      <span>{s.pct}%</span>
                    </div>
                    <div className="pm-bar">
                      <motion.div
                        className="pm-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${s.pct}%` }}
                        transition={{ duration: 1, delay: 0.8 + i * 0.15 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pm-footer">
                <HiOutlineBadgeCheck className="pm-check" />
                <span>Credence Score: <strong>86/100</strong></span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== PROBLEM ===== */}
      <section className="problem-section">
        <div className="lp-container">
          <motion.div
            className="section-heading"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          >
            <motion.span className="section-label" variants={fadeUp}>The Problem</motion.span>
            <motion.h2 className="section-title" variants={fadeUp}>
              The system is broken for <span className="gradient-text">career returners</span>
            </motion.h2>
            <motion.p className="section-desc" variants={fadeUp}>
              Career re-entry after a break is one of the most common professional situations — and the worst served by existing systems.
            </motion.p>
          </motion.div>

          <div className="problem-grid">
            {problems.map((p, i) => (
              <motion.div
                key={i}
                className="problem-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.14 }}
              >
                <div className="problem-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="how-section">
        <div className="lp-container">
          <motion.div
            className="section-heading centered"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          >
            <motion.span className="section-label" variants={fadeUp}>How It Works</motion.span>
            <motion.h2 className="section-title" variants={fadeUp}>
              Four steps to your <span className="gradient-text">comeback</span>
            </motion.h2>
            <motion.p className="section-desc" variants={fadeUp}>
              A simple, structured journey from profile to placement.
            </motion.p>
          </motion.div>

          <div className="steps-grid">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className={`step-card ${activeStep === i ? 'active' : ''}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.13 }}
                onMouseEnter={() => setActiveStep(i)}
              >
                <div className="step-num">{step.num}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="features-section">
        <div className="lp-container">
          <motion.div
            className="section-heading centered"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          >
            <motion.span className="section-label" variants={fadeUp}>Features</motion.span>
            <motion.h2 className="section-title" variants={fadeUp}>
              Built for <span className="gradient-text">career re-entry</span>
            </motion.h2>
            <motion.p className="section-desc" variants={fadeUp}>
              Every feature is crafted specifically for professionals returning to work after a break.
            </motion.p>
          </motion.div>

          <div className="features-grid">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="feature-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROFESSIONS ===== */}
      <section id="professions" className="professions-section">
        <div className="lp-container">
          <motion.div
            className="section-heading centered"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          >
            <motion.span className="section-label" variants={fadeUp}>For Every Profession</motion.span>
            <motion.h2 className="section-title" variants={fadeUp}>
              No two journeys are <span className="gradient-text">the same</span>
            </motion.h2>
            <motion.p className="section-desc" variants={fadeUp}>
              AI builds a completely unique assessment pipeline for your role — not a one-size-fits-all test.
            </motion.p>
          </motion.div>

          <div className="professions-grid">
            {professions.map((prof, i) => (
              <motion.div
                key={i}
                className="profession-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h3 className="profession-role">{prof.role}</h3>
                <div className="profession-tags">
                  {prof.tags.map((tag, j) => (
                    <span key={j} className="profession-tag">{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="pricing-section">
        <div className="lp-container">
          <motion.div
            className="section-heading centered"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          >
            <motion.span className="section-label" variants={fadeUp}>Session Plans</motion.span>
            <motion.h2 className="section-title" variants={fadeUp}>
              Simple, <span className="gradient-text">one-time</span> sessions
            </motion.h2>
            <motion.p className="section-desc" variants={fadeUp}>
              No subscriptions. No lock-ins. Just real sessions with real impact.
            </motion.p>
          </motion.div>

          <div className="pricing-grid">
            {/* Mentorship */}
            <motion.div
              className="pricing-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="pricing-card-header">
                <div className="pricing-plan-icon"><HiOutlineUsers /></div>
                <span className="pricing-available">Available Now</span>
              </div>
              <h3 className="pricing-plan-name">Mentorship Session</h3>
              <div className="pricing-price-row">
                <span className="pricing-amount">₹500</span>
                <span className="pricing-per">/ session</span>
              </div>
              <p className="pricing-plan-desc">
                A one-time 1:1 session with an industry expert who understands career transitions — get clarity, guidance, and a personal roadmap.
              </p>
              <ul className="pricing-features">
                {[
                  '1:1 session with industry mentor',
                  'Personalized career guidance path',
                  'Industry trends briefing',
                  'Mentor-led skill assessment',
                  'Career roadmap creation',
                ].map((f, i) => (
                  <li key={i}><HiOutlineCheckCircle /><span>{f}</span></li>
                ))}
              </ul>
              <Link to="/signup" className="btn btn-primary" style={{ width: '100%' }}>
                Book Mentorship Session <HiOutlineArrowRight />
              </Link>
            </motion.div>

            {/* Hiring */}
            <motion.div
              className="pricing-card featured"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="pricing-card-header">
                <div className="pricing-plan-icon premium"><HiOutlineBriefcase /></div>
                <span className="pricing-locked"><HiOutlineLockClosed /> Score 80%+ to Unlock</span>
              </div>
              <h3 className="pricing-plan-name">Hiring Session</h3>
              <div className="pricing-price-row">
                <span className="pricing-amount">₹2,500</span>
                <span className="pricing-per">/ session</span>
              </div>
              <p className="pricing-plan-desc">
                A one-time referral session — get matched and referred to our MOU-signed partner companies based on your verified Credence score.
              </p>
              <ul className="pricing-features">
                {[
                  'Referrals to MOU partner companies',
                  'Skill-matched job opportunities',
                  'Priority application processing',
                  'Interview preparation support',
                  'Direct recruiter connection',
                ].map((f, i) => (
                  <li key={i}><HiOutlineCheckCircle /><span>{f}</span></li>
                ))}
              </ul>
              <div className="btn btn-outline" style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed', justifyContent: 'center' }}>
                <HiOutlineLockClosed /> Score 80%+ to Unlock
              </div>
              <p className="pricing-unlock-hint">Take the assessment and score 80 or above to unlock this plan.</p>
            </motion.div>
          </div>

          <motion.div
            className="pricing-note"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <HiOutlineBadgeCheck />
            <span>Career Readiness Report download is always <strong>free</strong> for all verified users.</span>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="lp-container">
          <motion.div
            className="cta-box"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <HiOutlineTrendingUp className="cta-icon" />
            <h2>Ready to prove your <span className="gradient-text">real worth?</span></h2>
            <p>Your skills speak louder than gaps. Start your career comeback today — completely free.</p>
            <div className="cta-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Create Free Account <HiOutlineArrowRight />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                I Already Have an Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/favicon.png" alt="Credence" className="footer-logo-img" />
              <span className="logo-text">Credence</span>
            </div>
            <p>Trust Beyond Resumes — Bridging the career re-entry gap with AI-powered skill verification.</p>
          </div>

          <div className="footer-cols">
            <div className="footer-col">
              <h4>Platform</h4>
              <a href="#how-it-works">How It Works</a>
              <a href="#features">Features</a>
              <a href="#professions">Professions</a>
              <a href="#pricing">Plans</a>
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <Link to="/signup">Get Started</Link>
              <Link to="/login">Login</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Contact</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Credence. All rights reserved.</p>
          <p>Built for career returners, by people who care.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
