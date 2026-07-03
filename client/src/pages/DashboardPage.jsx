import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, assessmentAPI } from '../services/api';
import {
  HiOutlineUser, HiOutlineShieldCheck, HiOutlineChartBar, HiOutlineFire,
  HiOutlineDocumentReport, HiOutlineLightningBolt, HiOutlineLogout,
  HiOutlineLockClosed, HiOutlineLockOpen, HiOutlineArrowRight,
  HiOutlineClipboardCheck, HiOutlineDownload, HiOutlineStar,
  HiOutlineBadgeCheck, HiOutlineAcademicCap, HiOutlineBriefcase,
  HiOutlineSparkles, HiOutlinePresentationChartLine, HiOutlineTrendingUp,
  HiOutlineIdentification, HiOutlineOfficeBuilding
} from 'react-icons/hi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import toast from 'react-hot-toast';
import ReportGenerator from '../components/report/ReportGenerator';
import StreakPhoenix from '../components/dashboard/StreakPhoenix';
import BookingModal from '../components/dashboard/BookingModal';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingPlan, setBookingPlan] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, subRes] = await Promise.all([
        dashboardAPI.getData(),
        dashboardAPI.getSubscriptions(),
      ]);
      setDashData(dashRes.data);
      setSubscriptions(subRes.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handlePurchasePlan = async (planId) => {
    try {
      await dashboardAPI.purchaseSubscription(planId);
      toast.success('Plan activated!');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate plan.');
    }
  };

  const getStreakIcon = (count) => {
    if (count >= 90) return <HiOutlineLightningBolt style={{ color: '#6366F1' }} />;
    if (count >= 30) return <HiOutlineFire style={{ color: '#F59E0B' }} />;
    if (count >= 7)  return <HiOutlineFire style={{ color: '#06B6D4' }} />;
    if (count >= 1)  return <HiOutlineStar style={{ color: '#6366F1' }} />;
    return <HiOutlineFire style={{ color: '#9CA3AF' }} />;
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <span className="loading-text">Loading your dashboard...</span>
      </div>
    );
  }

  const { profile, passport, streak, stats } = dashData || {};

  // Prepare chart data
  const growthData = passport?.assessments?.map(a => ({
    name: `Assessment ${a.assessmentNumber}`,
    readiness: a.careerReadinessScore,
    alignment: a.industryAlignmentScore,
    overall: a.overallScore,
  })) || [];

  const latestSkills = passport?.assessments?.length > 0
    ? passport.assessments[passport.assessments.length - 1].skillBreakdown?.map(s => ({
        skill: s.skill?.length > 12 ? s.skill.substring(0, 12) + '...' : s.skill,
        score: s.score,
        fullMark: s.maxScore || 100,
      })) || []
    : [];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">Credence</span>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <HiOutlineChartBar /> Overview
          </button>
          <button className={`nav-item ${activeTab === 'assessment' ? 'active' : ''}`} onClick={() => setActiveTab('assessment')}>
            <HiOutlineClipboardCheck /> Take Assessment
          </button>
          <button className={`nav-item ${activeTab === 'passport' ? 'active' : ''}`} onClick={() => setActiveTab('passport')}>
            <HiOutlineIdentification /> Passport
          </button>
          <button className={`nav-item ${activeTab === 'plans' ? 'active' : ''}`} onClick={() => setActiveTab('plans')}>
            <HiOutlineStar /> Plans
          </button>
          <button className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <HiOutlineTrendingUp /> Analytics
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item logout" onClick={handleLogout}>
            <HiOutlineLogout /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <header className="dash-header">
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:300 }}>Welcome back, <span style={{ color:'var(--slate)' }}>{profile?.name?.split(' ')[0] || user?.username}</span></h1>
            <p>Your career comeback journey continues.</p>
          </div>
          <div className="header-streak">
            <span style={{ fontSize: 18, display: 'flex', color: 'var(--accent-primary)' }}>{getStreakIcon(streak?.currentStreak)}</span>
            <div>
              <span className="streak-count">{streak?.currentStreak || 0}</span>
              <span className="streak-label">Day Streak</span>
            </div>
          </div>
        </header>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <div className="overview-bento animate-fadeIn">

            {/* ── LEFT COL 1: Profile Card ── */}
            <div className="bento-card bento-profile">
              <p className="profile-name">{profile?.name || user?.username}</p>
              <p className="profile-role">
                {profile?.pastRole && `${profile.pastRole}`}
                {profile?.pastCompany && ` · ${profile.pastCompany}`}
              </p>
              <div className="profile-field-group">
                {profile?.careerGap?.days && (
                  <div className="profile-field">
                    <label>Career Gap</label>
                    <span>{profile.careerGap.days} days</span>
                  </div>
                )}
                {profile?.breakReason && (
                  <div className="profile-field">
                    <label>Break Reason</label>
                    <span>{profile.breakReason}</span>
                  </div>
                )}
                {profile?.domain && (
                  <div className="profile-field">
                    <label>Domain</label>
                    <span>{profile.domain}</span>
                  </div>
                )}
                {profile?.experience != null && (
                  <div className="profile-field">
                    <label>Experience</label>
                    <span style={{ fontSize: 'var(--fs-xs)', lineHeight: 1.5 }}>
                      {profile.experience} {profile.experience === 1 ? 'year' : 'years'}
                    </span>
                  </div>
                )}
              </div>
            </div>


            {/* ── LEFT COL 2: Subscription Plans ── */}
            <div className="bento-card bento-plans">
              <p className="plans-card-title">Subscription Plans</p>
              {subscriptions.map((plan, i) => (
                <div key={i} className="plan-row">
                  <span>{plan.name}</span>
                  {plan.isLocked ? (
                    <div className="plan-locked-row">
                      <span style={{ display:'flex', alignItems:'center', gap:4, color:'var(--text-muted)' }}>
                        <HiOutlineLockClosed style={{ fontSize:12 }} />
                        <span className="plan-lock-note">{plan.unlockRequirement}</span>
                      </span>
                    </div>
                  ) : plan.isActive ? (
                    <span className="plan-active-badge">Active</span>
                  ) : (
                    <span style={{ fontSize:'var(--fs-xs)', color:'var(--slate)' }}>Available</span>
                  )}
                </div>
              ))}
            </div>

            {/* ── LEFT COL 3: Streak ── */}
            <div className="bento-card bento-streak">
              <p className="streak-title">Daily Streak</p>
              <div className="streak-card-inner">
                <StreakPhoenix streak={streak?.currentStreak || 0} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-3xl)', fontWeight: 400, color: 'var(--slate)', lineHeight: 1 }}>
                    {streak?.currentStreak || 0}
                  </div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginTop: 3 }}>Days</div>
                  {streak?.longestStreak > 0 && (
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 6 }}>
                      Best: {streak.longestStreak}d
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── CENTER: Take Assessment ── */}
            <div className="bento-card bento-assessment">
              <p className="assessment-card-header">Start Your Credence Journey</p>
              <div className="assessment-cta-area">
                <button
                  className="btn btn-primary"
                  style={{ fontSize: 'var(--fs-xl)', fontFamily: 'var(--font-display)', fontStyle:'italic', padding:'16px 0', width:'100%', borderRadius:'var(--radius-md)' }}
                  onClick={() => setActiveTab('assessment')}
                >
                  Take Assessment
                </button>
              </div>

              <p className="assessment-sub-label">Personalized Assessment — {profile?.domain || 'Your Domain'}</p>
              <p style={{ fontSize:'var(--fs-xs)', color:'var(--text-muted)', marginBottom: 10 }}>Seek Role (or upload JD)</p>
              <input
                className="seek-role-input"
                placeholder="Seek Role (paste JD or upload PDF)"
                readOnly
                onClick={() => setActiveTab('assessment')}
              />

              {stats && (
                <div style={{ marginTop: 20, display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap: 10 }}>
                  <div style={{ background:'var(--bg-secondary)', borderRadius:'var(--radius-md)', padding:'12px', border:'1px solid var(--border-primary)', textAlign:'center' }}>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'var(--fs-2xl)', color:'var(--obsidian)' }}>{stats.totalAssessments || 0}</div>
                    <div style={{ fontSize:'var(--fs-xs)', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Assessments</div>
                  </div>
                  <div style={{ background:'var(--bg-secondary)', borderRadius:'var(--radius-md)', padding:'12px', border:'1px solid var(--border-primary)', textAlign:'center' }}>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'var(--fs-2xl)', color:'var(--slate)' }}>{stats.latestScore || '—'}</div>
                    <div style={{ fontSize:'var(--fs-xs)', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Latest Score</div>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: Passport Scores ── */}
            <div className="bento-card bento-passport">
              {passport && passport.assessments?.length > 0 ? (
                <>
                  <p className="passport-label">Your Credence Passport</p>

                  {/* Timeline bar */}
                  <div className="timeline-labels">
                    {passport.assessments.slice(-3).map((a, i) => (
                      <span key={i}>{new Date(a.date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}</span>
                    ))}
                  </div>
                  <div className="timeline-track" style={{ marginBottom: 16, height: 4, background:'var(--border-primary)', borderRadius: 99, position:'relative' }}>
                    <div className="timeline-fill" style={{ height:'100%', width:`${Math.min((passport.currentHighestScore / 100) * 100, 100)}%`, background:'var(--slate)', borderRadius: 99 }} />
                    <div className="timeline-dot" style={{ right: 0, top:'50%', transform:'translateY(-50%)' }} />
                  </div>

                  {/* Skill pills */}
                  {passport.assessments[passport.assessments.length - 1]?.skillBreakdown?.slice(0, 4).map((s, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'var(--fs-xs)', color:'var(--text-secondary)', marginBottom: 3 }}>
                        <span>{s.skill}</span>
                        <span style={{ fontWeight: 600, color:'var(--slate)' }}>{s.score}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width:`${(s.score / (s.maxScore || 100)) * 100}%` }} />
                      </div>
                    </div>
                  ))}

                  <p className="passport-overall">Your Passport Overall: {passport.currentHighestScore}%</p>
                  <div className="progress-bar" style={{ marginBottom: 14 }}>
                    <div className="progress-bar-fill" style={{ width:`${passport.currentHighestScore}%` }} />
                  </div>

                  <button className="download-report-btn" onClick={() => setActiveTab('passport')}>
                    <HiOutlineDownload /> Download Career Readiness Report
                  </button>
                </>
              ) : (
                <>
                  <p className="passport-label">Your Credence Passport</p>
                  <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)' }}>
                    <HiOutlineIdentification style={{ fontSize: 36, marginBottom: 8 }} />
                    <p style={{ fontSize:'var(--fs-sm)' }}>Complete your first assessment<br/>to generate your passport.</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setActiveTab('assessment')}>
                      Start Assessment
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* ── BOTTOM: Analytics Chart ── */}
            <div className="bento-card bento-analytics">
              <div className="analytics-header">
                <span className="analytics-title">Analytics</span>
                <div className="analytics-legend">
                  <span><span className="legend-dot" style={{ background:'var(--slate)' }} />1st Assessment</span>
                  <span><span className="legend-dot" style={{ background:'var(--gold)' }} />2nd Assessment</span>
                </div>
              </div>
              {growthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={[0,100]} />
                    <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border-primary)', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="overall" stroke="var(--accent-primary)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="readiness" stroke="var(--accent-secondary)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-muted)', fontSize:'var(--fs-sm)' }}>
                  No assessment data yet — take your first assessment.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ===== ASSESSMENT TAB ===== */}
        {activeTab === 'assessment' && (
          <div className="dash-content animate-fadeIn">
            <AssessmentTab navigate={navigate} />
          </div>
        )}

        {/* ===== PASSPORT TAB ===== */}
        {activeTab === 'passport' && (
          <div className="dash-content animate-fadeIn">
            <PassportTab passport={passport} profile={profile} latestSkills={latestSkills} streak={streak} />
          </div>
        )}

        {/* ===== PLANS TAB ===== */}
        {activeTab === 'plans' && (
          <div className="dash-content animate-fadeIn">
            <div className="plans-grid">
              {subscriptions.map((plan, i) => (
                <div key={i} className={`plan-card glass-card ${plan.isLocked ? 'locked' : ''}`}>
                  <div className="plan-header">
                    {plan.isLocked ? (
                      <span className="badge badge-locked"><HiOutlineLockClosed /> Locked</span>
                    ) : plan.isActive ? (
                      <span className="badge badge-success"><HiOutlineBadgeCheck /> Active</span>
                    ) : (
                      <span className="badge badge-primary">Available</span>
                    )}
                    <h3>{plan.name}</h3>
                    <p className="plan-price">{plan.price}<span>{plan.priceLabel || '/session'}</span></p>
                  </div>
                  <p className="plan-desc">{plan.description}</p>
                  <ul className="plan-features">
                    {plan.features.map((f, j) => (
                      <li key={j}><HiOutlineBadgeCheck /> {f}</li>
                    ))}
                  </ul>
                  {plan.isLocked ? (
                    <div className="btn btn-ghost" style={{ width: '100%', opacity: 0.5 }}>
                      <HiOutlineLockClosed /> {plan.unlockRequirement}
                    </div>
                  ) : plan.isActive ? (
                    <div className="btn btn-success" style={{ width: '100%' }}>
                      <HiOutlineBadgeCheck /> Session Booked
                    </div>
                  ) : (
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setBookingPlan(plan)}>
                      Book Session
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== ANALYTICS TAB ===== */}
        {activeTab === 'analytics' && (
          <div className="dash-content animate-fadeIn">
            {growthData.length > 0 ? (
              <>
                <div className="chart-card glass-card">
                  <h3>Score Progression</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                      <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} />
                      <YAxis stroke="var(--text-tertiary)" fontSize={12} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8, color: 'var(--text-primary)' }} />
                      <Line type="monotone" dataKey="overall" stroke="#4A6D8C" strokeWidth={3} name="Overall Score" dot={{ fill: '#4A6D8C', r: 5 }} />
                      <Line type="monotone" dataKey="readiness" stroke="#BFA04A" strokeWidth={2} name="Career Readiness" dot={{ fill: '#BFA04A', r: 4 }} />
                      <Line type="monotone" dataKey="alignment" stroke="#2A6B4A" strokeWidth={2} name="Industry Alignment" dot={{ fill: '#2A6B4A', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {latestSkills.length > 0 && (
                  <div className="chart-card glass-card">
                    <h3>Skill Radar</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={latestSkills}>
                        <PolarGrid stroke="var(--border-primary)" />
                        <PolarAngleAxis dataKey="skill" stroke="var(--text-secondary)" fontSize={11} />
                        <PolarRadiusAxis stroke="var(--text-muted)" fontSize={10} />
                        <Radar name="Score" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.12} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <HiOutlineChartBar style={{ fontSize: 44, color: 'var(--text-muted)' }} />
                <h3>No Analytics Yet</h3>
                <p>Complete your first assessment to see performance analytics.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('assessment')}>
                  Take Assessment <HiOutlineArrowRight />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {bookingPlan && (
        <BookingModal plan={bookingPlan} onClose={() => setBookingPlan(null)} />
      )}
    </div>
  );
};

// ===== Assessment Tab Component =====
const AssessmentTab = ({ navigate }) => {
  const [seekingRole, setSeekingRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('keyword'); // 'keyword' or 'jd'

  const handleStartAssessment = async () => {
    if (!seekingRole.trim()) {
      toast.error('Please enter a seeking role.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await assessmentAPI.start({
        seekingRole,
        jobDescription: mode === 'jd' ? jobDescription : '',
      });
      toast.success('Assessment generated!');
      navigate(`/assessment/${data.assessment._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate assessment.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="assessment-generating glass-card">
        <div className="generating-animation">
          <div className="spinner spinner-lg" />
          <div className="generating-dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
        </div>
        <h2>Generating Your Personalized Assessment</h2>
        <p>Our AI is analyzing your profile, resume, and target role to create a unique assessment just for you.</p>
        <div className="generating-steps">
          <div className="gen-step active"><HiOutlineUser style={{flexShrink:0}} /> Analyzing your profile</div>
          <div className="gen-step"><HiOutlineDocumentReport style={{flexShrink:0}} /> Processing resume data</div>
          <div className="gen-step"><HiOutlineAcademicCap style={{flexShrink:0}} /> Researching industry requirements</div>
          <div className="gen-step"><HiOutlineBadgeCheck style={{flexShrink:0}} /> Crafting personalized questions</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="assessment-start glass-card">
        <h2>Start New Assessment</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Tell us what role you're seeking. Our AI will generate a personalized, multi-section assessment 
          tailored to your background and this role.
        </p>

        <div className="mode-toggle">
          <button className={`mode-btn ${mode === 'keyword' ? 'active' : ''}`} onClick={() => setMode('keyword')}>
            By Role Keyword
          </button>
          <button className={`mode-btn ${mode === 'jd' ? 'active' : ''}`} onClick={() => setMode('jd')}>
            By Job Description
          </button>
        </div>

        <div className="input-group" style={{ marginBottom: 20 }}>
          <label>Seeking Role <span className="required">*</span></label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g., Full Stack Developer, Marketing Manager, HR Lead"
            value={seekingRole}
            onChange={e => setSeekingRole(e.target.value)}
          />
        </div>

        {mode === 'jd' && (
          <div className="input-group" style={{ marginBottom: 20 }}>
            <label>Job Description</label>
            <textarea
              className="input-field"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={6}
            />
          </div>
        )}

        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleStartAssessment}>
          Generate Assessment <HiOutlineArrowRight />
        </button>
      </div>
    </>
  );
};

// ===== Passport Tab Component =====
const PassportTab = ({ passport, profile, latestSkills, streak }) => {
  const [showReport, setShowReport] = useState(false);

  if (!passport || passport.assessments.length === 0) {
    return (
      <div className="empty-state">
        <HiOutlineIdentification style={{ fontSize: 44, color: 'var(--text-muted)' }} />
        <h3>No Passport Yet</h3>
        <p>Complete your first assessment to generate your Career Readiness Passport.</p>
      </div>
    );
  }

  return (
    <div className="passport-full-view">
      <div className="passport-card glass-card">
        <div className="passport-header">
          <div className="passport-brand">
            <span className="logo-icon" style={{ fontSize: 20 }}>◆</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Credence Passport</span>
          </div>
          <span className="badge badge-primary">{passport.credenceId}</span>
        </div>

        <div className="passport-user">
          <div className="passport-avatar">{profile?.name?.charAt(0)?.toUpperCase() || '?'}</div>
          <div>
            <h2>{profile?.name}</h2>
            <p>{profile?.pastRole} • {profile?.domain}</p>
            {profile?.breakReason && (
              <p className="passport-break-reason" style={{ fontSize: 'var(--fs-xs)', color: 'var(--indigo)', marginTop: '4px', fontWeight: 600 }}>
                Reason for Break: {profile.breakReason}
              </p>
            )}
          </div>
        </div>

        <div className="passport-scores">
          <div className="passport-score-item">
            <span className="score-value" style={{ color:'var(--slate)' }}>{passport.currentHighestScore}</span>
            <span className="score-label">Highest Score</span>
          </div>
          <div className="passport-score-item">
            <span className="score-value" style={{ color: 'var(--gold)' }}>{passport.overallGrowth}%</span>
            <span className="score-label">Growth</span>
          </div>
          <div className="passport-score-item">
            <span className="score-value" style={{ color: 'var(--text-secondary)' }}>{passport.assessments.length}</span>
            <span className="score-label">Assessments</span>
          </div>
        </div>

        <div className="passport-history">
          <h4>Assessment History</h4>
          {passport.assessments.map((a, i) => (
            <div key={i} className="passport-assessment-row">
              <span className="assessment-num">#{a.assessmentNumber}</span>
              <span className="assessment-date">{new Date(a.date).toLocaleDateString()}</span>
              <span className="assessment-role">{a.seekingRole}</span>
              <span className="assessment-score" style={{ 
                color: a.overallScore >= 80 ? 'var(--success)' : a.overallScore >= 50 ? 'var(--gold)' : 'var(--danger)' 
              }}>
                {a.overallScore}/100
              </span>
            </div>
          ))}
        </div>

        {latestSkills.length > 0 && (
          <div className="passport-skills">
            <h4>Skill Scores (Latest)</h4>
            <div className="skill-bars">
              {latestSkills.map((s, i) => (
                <div key={i} className="skill-bar-item">
                  <div className="skill-bar-header">
                    <span>{s.skill}</span>
                    <span>{s.score}/{s.fullMark}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${(s.score / s.fullMark) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {streak && (
          <div className="passport-skills" style={{ marginTop: 20 }}>
            <h4 style={{ display:'flex', alignItems:'center', gap:6 }}><HiOutlineFire style={{color:'var(--accent-secondary)'}} /> Career Comeback Streak</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '14px 12px', textAlign: 'center', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--slate)' }}>{streak.currentStreak}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Current Streak</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '14px 12px', textAlign: 'center', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--gold)' }}>{streak.longestStreak}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Longest Streak</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '14px 12px', textAlign: 'center', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--success)' }}>{streak.freezesAvailable}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Freeze Left</div>
              </div>
            </div>
            {streak.milestones?.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {streak.milestones.map((m, i) => (
                  <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{m.icon}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={() => setShowReport(true)}>
        <HiOutlineDownload /> Download Report (PDF)
      </button>

      {showReport && (
        <ReportGenerator
          passport={passport}
          profile={profile}
          streak={streak}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
