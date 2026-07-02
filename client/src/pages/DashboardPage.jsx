import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, assessmentAPI } from '../services/api';
import { 
  HiOutlineUser, HiOutlineShieldCheck, HiOutlineChartBar, HiOutlineFire,
  HiOutlineDocumentReport, HiOutlineLightningBolt, HiOutlineLogout,
  HiOutlineLockClosed, HiOutlineLockOpen, HiOutlineArrowRight,
  HiOutlineClipboardCheck, HiOutlineDownload, HiOutlineStar,
  HiOutlineBadgeCheck, HiOutlineAcademicCap
} from 'react-icons/hi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import toast from 'react-hot-toast';
import ReportGenerator from '../components/report/ReportGenerator';
import StreakPhoenix from '../components/dashboard/StreakPhoenix';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  const getStreakEmoji = (count) => {
    if (count >= 90) return '🦅';
    if (count >= 30) return '⚡';
    if (count >= 7) return '🔥';
    if (count >= 1) return '✨';
    return '💤';
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
      {/* Sidebar */}
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
            <HiOutlineShieldCheck /> Passport
          </button>
          <button className={`nav-item ${activeTab === 'plans' ? 'active' : ''}`} onClick={() => setActiveTab('plans')}>
            <HiOutlineStar /> Plans
          </button>
          <button className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <HiOutlineLightningBolt /> Analytics
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
            <h1>Welcome back, <span className="gradient-text">{profile?.name?.split(' ')[0] || user?.username}</span></h1>
            <p>Your career comeback journey continues.</p>
          </div>
          <div className="header-streak glass-card">
            <span className="streak-emoji">{getStreakEmoji(streak?.currentStreak)}</span>
            <div>
              <span className="streak-count">{streak?.currentStreak || 0}</span>
              <span className="streak-label">Day Streak</span>
            </div>
          </div>
        </header>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <div className="dash-content animate-fadeIn">
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card glass-card">
                <div className="stat-icon" style={{ background: 'rgba(0, 212, 255, 0.1)', color: 'var(--accent-primary)' }}>
                  <HiOutlineClipboardCheck />
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats?.totalAssessments || 0}</span>
                  <span className="stat-label-text">Assessments Taken</span>
                </div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-icon" style={{ background: 'rgba(0, 255, 136, 0.1)', color: 'var(--accent-tertiary)' }}>
                  <HiOutlineChartBar />
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats?.latestScore || '—'}</span>
                  <span className="stat-label-text">Latest Score</span>
                </div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-icon" style={{ background: 'rgba(123, 47, 252, 0.1)', color: 'var(--accent-secondary)' }}>
                  <HiOutlineFire />
                </div>
                <div className="stat-info">
                  <span className="stat-number">{streak?.longestStreak || 0}</span>
                  <span className="stat-label-text">Longest Streak</span>
                </div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-icon" style={{ background: stats?.hiringEligible ? 'rgba(0, 255, 136, 0.1)' : 'rgba(90, 96, 128, 0.1)', color: stats?.hiringEligible ? 'var(--accent-tertiary)' : 'var(--text-tertiary)' }}>
                  {stats?.hiringEligible ? <HiOutlineLockOpen /> : <HiOutlineLockClosed />}
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats?.hiringEligible ? 'Eligible' : 'Locked'}</span>
                  <span className="stat-label-text">Hiring Plan</span>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="action-grid">
              <div className="action-card glass-card take-assessment" onClick={() => setActiveTab('assessment')}>
                <div className="action-icon-large">🧠</div>
                <h3>Take Assessment</h3>
                <p>Get a personalized, AI-driven assessment tailored to your target role.</p>
                <span className="action-link">Start Now <HiOutlineArrowRight /></span>
              </div>

              <div className="action-card glass-card" onClick={() => setActiveTab('passport')}>
                <div className="action-icon-large">🎫</div>
                <h3>View Passport</h3>
                <p>Check your Career Readiness Passport with scores and growth graph.</p>
                <span className="action-link">View <HiOutlineArrowRight /></span>
              </div>

              <div className="action-card glass-card" onClick={() => setActiveTab('analytics')}>
                <div className="action-icon-large">📊</div>
                <h3>Analytics</h3>
                <p>Track your performance growth across all assessments.</p>
                <span className="action-link">Analyze <HiOutlineArrowRight /></span>
              </div>
            </div>

            {/* Streak Banner */}
            {streak && (
              <div className="streak-banner glass-card">
                <div className="streak-flame-container">
                  <StreakPhoenix streak={streak.currentStreak} />
                </div>
                <div className="streak-info">
                  <h3>Career Comeback Streak</h3>
                  <p>{streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''} and counting! Keep the momentum going.</p>
                  <div className="streak-milestones">
                    {['7 Day', '30 Day', '90 Day'].map((milestone, i) => {
                      const thresholds = [7, 30, 90];
                      const achieved = streak.currentStreak >= thresholds[i];
                      return (
                        <div key={i} className={`milestone ${achieved ? 'achieved' : ''}`}>
                          <span>{['🔥', '⚡', '🦅'][i]}</span>
                          <span>{milestone}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Growth Chart Preview */}
            {growthData.length > 0 && (
              <div className="chart-card glass-card">
                <h3>Performance Growth</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                    <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} />
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8, color: 'var(--text-primary)' }}
                    />
                    <Line type="monotone" dataKey="overall" stroke="#00d4ff" strokeWidth={2} dot={{ fill: '#00d4ff' }} />
                    <Line type="monotone" dataKey="readiness" stroke="#7b2ffc" strokeWidth={2} dot={{ fill: '#7b2ffc' }} />
                    <Line type="monotone" dataKey="alignment" stroke="#00ff88" strokeWidth={2} dot={{ fill: '#00ff88' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
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
                    <p className="plan-price">{plan.price}<span>/month</span></p>
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
                      <HiOutlineBadgeCheck /> Active Plan
                    </div>
                  ) : (
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handlePurchasePlan(plan.id)}>
                      Activate Plan
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
                      <Line type="monotone" dataKey="overall" stroke="#00d4ff" strokeWidth={3} name="Overall Score" dot={{ fill: '#00d4ff', r: 5 }} />
                      <Line type="monotone" dataKey="readiness" stroke="#7b2ffc" strokeWidth={2} name="Career Readiness" dot={{ fill: '#7b2ffc', r: 4 }} />
                      <Line type="monotone" dataKey="alignment" stroke="#00ff88" strokeWidth={2} name="Industry Alignment" dot={{ fill: '#00ff88', r: 4 }} />
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
                        <Radar name="Score" dataKey="score" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state glass-card">
                <span style={{ fontSize: 48 }}>📊</span>
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
          <div className="gen-step active">📋 Analyzing your profile</div>
          <div className="gen-step">📄 Processing resume data</div>
          <div className="gen-step">🔍 Researching industry requirements</div>
          <div className="gen-step">🧠 Crafting personalized questions</div>
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
      <div className="empty-state glass-card">
        <span style={{ fontSize: 48 }}>🎫</span>
        <h3>No Passport Yet</h3>
        <p>Complete your first assessment to generate your Career Readiness Passport.</p>
      </div>
    );
  }

  return (
    <div className="passport-view">
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
          </div>
        </div>

        <div className="passport-scores">
          <div className="passport-score-item">
            <span className="score-value gradient-text">{passport.currentHighestScore}</span>
            <span className="score-label">Highest Score</span>
          </div>
          <div className="passport-score-item">
            <span className="score-value" style={{ color: 'var(--accent-tertiary)' }}>{passport.overallGrowth}%</span>
            <span className="score-label">Growth</span>
          </div>
          <div className="passport-score-item">
            <span className="score-value" style={{ color: 'var(--accent-secondary)' }}>{passport.assessments.length}</span>
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
                color: a.overallScore >= 80 ? 'var(--accent-tertiary)' : a.overallScore >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)' 
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
            <h4>🔥 Career Comeback Streak</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '14px 12px', textAlign: 'center', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-primary)' }}>{streak.currentStreak}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Current Streak</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '14px 12px', textAlign: 'center', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-secondary)' }}>{streak.longestStreak}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Longest Streak</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '14px 12px', textAlign: 'center', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-tertiary)' }}>{streak.freezesAvailable}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Freeze Left</div>
              </div>
            </div>
            {streak.milestones?.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {streak.milestones.map((m, i) => (
                  <div key={i} style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid var(--border-primary)', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
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
