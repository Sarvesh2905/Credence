import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { HiOutlineDownload } from 'react-icons/hi';
import './ReportGenerator.css';

const ReportGenerator = ({ passport, profile, streak, onClose }) => {
  const reportRef = useRef(null);
  const downloading = useRef(false);

  const handleDownload = async () => {
    if (downloading.current || !reportRef.current) return;
    downloading.current = true;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#06080f',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // 10mm margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // top margin

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Credence_Report_${profile?.name?.replace(/\s+/g, '_') || 'User'}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      downloading.current = false;
    }
  };

  if (!passport || !profile) return null;

  const latestAssessment = passport.assessments[passport.assessments.length - 1];

  return (
    <div className="report-overlay">
      <div className="report-modal">
        <div className="report-toolbar">
          <h3>Career Readiness Report</h3>
          <div className="report-toolbar-actions">
            <button className="btn btn-primary" onClick={handleDownload}>
              <HiOutlineDownload /> Download PDF
            </button>
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="report-preview-scroll">
          <div className="report-content" ref={reportRef}>
            {/* Report Header */}
            <div className="report-header-section">
              <div className="report-brand">
                <span className="report-logo">◆</span>
                <div>
                  <h1>Credence</h1>
                  <span>Trust Beyond Resumes</span>
                </div>
              </div>
              <div className="report-meta">
                <span>Career Readiness Report</span>
                <span>ID: {passport.credenceId}</span>
                <span>Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Candidate Info */}
            <div className="report-section">
              <h2 className="report-section-title">Candidate Profile</h2>
              <div className="report-profile-grid">
                <div className="report-field">
                  <span className="field-label">Name</span>
                  <span className="field-value">{profile.name}</span>
                </div>
                <div className="report-field">
                  <span className="field-label">Domain</span>
                  <span className="field-value">{profile.domain}</span>
                </div>
                <div className="report-field">
                  <span className="field-label">Past Role</span>
                  <span className="field-value">{profile.pastRole} at {profile.pastCompany}</span>
                </div>
                <div className="report-field">
                  <span className="field-label">Experience</span>
                  <span className="field-value">{profile.experience} years</span>
                </div>
                <div className="report-field">
                  <span className="field-label">Career Gap</span>
                  <span className="field-value">{profile.careerGap?.days} days ({new Date(profile.careerGap?.from).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} – {new Date(profile.careerGap?.to).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })})</span>
                </div>
                {profile.breakReason && (
                  <div className="report-field">
                    <span className="field-label">Reason for Break</span>
                    <span className="field-value">{profile.breakReason}</span>
                  </div>
                )}
                <div className="report-field">
                  <span className="field-label">Assessments Taken</span>
                  <span className="field-value">{passport.assessments.length}</span>
                </div>
              </div>
            </div>

            {/* Overall Scores */}
            <div className="report-section">
              <h2 className="report-section-title">Overall Performance</h2>
              <div className="report-scores-row">
                <div className="report-score-box">
                  <span className="report-score-value" style={{ color: '#00d4ff' }}>
                    {passport.currentHighestScore}
                  </span>
                  <span className="report-score-name">Highest Score</span>
                </div>
                {latestAssessment && (
                  <>
                    <div className="report-score-box">
                      <span className="report-score-value" style={{ color: '#7b2ffc' }}>
                        {latestAssessment.careerReadinessScore}
                      </span>
                      <span className="report-score-name">Career Readiness</span>
                    </div>
                    <div className="report-score-box">
                      <span className="report-score-value" style={{ color: '#00ff88' }}>
                        {latestAssessment.industryAlignmentScore}
                      </span>
                      <span className="report-score-name">Industry Alignment</span>
                    </div>
                  </>
                )}
                <div className="report-score-box">
                  <span className="report-score-value" style={{ color: '#ffbb33' }}>
                    {passport.overallGrowth}%
                  </span>
                  <span className="report-score-name">Growth</span>
                </div>
              </div>
            </div>

            {/* Assessment History */}
            <div className="report-section">
              <h2 className="report-section-title">Assessment History</h2>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Target Role</th>
                    <th>Readiness</th>
                    <th>Alignment</th>
                    <th>Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {passport.assessments.map((a, i) => (
                    <tr key={i}>
                      <td>{a.assessmentNumber}</td>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td>{a.seekingRole}</td>
                      <td>{a.careerReadinessScore}/100</td>
                      <td>{a.industryAlignmentScore}/100</td>
                      <td style={{ fontWeight: 700, color: a.overallScore >= 80 ? '#00ff88' : a.overallScore >= 50 ? '#ffbb33' : '#ff4757' }}>
                        {a.overallScore}/100
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Skill Breakdown */}
            {latestAssessment?.skillBreakdown?.length > 0 && (
              <div className="report-section">
                <h2 className="report-section-title">Skill Breakdown (Latest Assessment)</h2>
                <div className="report-skill-grid">
                  {latestAssessment.skillBreakdown.map((s, i) => (
                    <div key={i} className="report-skill-item">
                      <div className="report-skill-header">
                        <span>{s.skill}</span>
                        <span>{s.score}/{s.maxScore || 100}</span>
                      </div>
                      <div className="report-skill-bar">
                        <div
                          className="report-skill-fill"
                          style={{
                            width: `${(s.score / (s.maxScore || 100)) * 100}%`,
                            background: s.score >= 80 ? '#00ff88' : s.score >= 50 ? '#ffbb33' : '#ff4757',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {passport.badges?.length > 0 && (
              <div className="report-section">
                <h2 className="report-section-title">Achievements</h2>
                <div className="report-badges">
                  {passport.badges.map((b, i) => (
                    <div key={i} className="report-badge">
                      <span className="badge-icon-lg">{b.icon}</span>
                      <div>
                        <span className="badge-name">{b.name}</span>
                        <span className="badge-desc">{b.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career Comeback Streak */}
            {streak && (
              <div className="report-section">
                <h2 className="report-section-title">Career Comeback Streak</h2>
                <div className="report-scores-row">
                  <div className="report-score-box">
                    <span className="report-score-value" style={{ color: '#00d4ff' }}>{streak.currentStreak}</span>
                    <span className="report-score-name">Current Streak</span>
                  </div>
                  <div className="report-score-box">
                    <span className="report-score-value" style={{ color: '#7b2ffc' }}>{streak.longestStreak}</span>
                    <span className="report-score-name">Longest Streak</span>
                  </div>
                  <div className="report-score-box">
                    <span className="report-score-value" style={{ color: '#ffbb33' }}>{streak.milestones?.length || 0}</span>
                    <span className="report-score-name">Milestones</span>
                  </div>
                </div>
                {streak.milestones?.length > 0 && (
                  <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {streak.milestones.map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,255,0.06)', border: '1px solid #1e293b', borderRadius: 8, padding: '6px 14px' }}>
                        <span style={{ fontSize: 18 }}>{m.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: '#5a6080' }}>{m.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Hiring Eligibility */}
            <div className="report-section">
              <h2 className="report-section-title">Hiring Eligibility</h2>
              <div className={`report-eligibility ${passport.isHiringEligible ? 'eligible' : 'not-eligible'}`}>
                <span className="eligibility-icon">{passport.isHiringEligible ? '✅' : '🔒'}</span>
                <div>
                  <h3>{passport.isHiringEligible ? 'Eligible for Hiring Plan' : 'Not Yet Eligible'}</h3>
                  <p>{passport.isHiringEligible
                    ? 'This candidate has scored 80%+ and is eligible for referral to partner companies.'
                    : 'Score 80%+ on any assessment to unlock hiring eligibility.'
                  }</p>
                </div>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="report-footer">
              <div className="report-verification">
                <p>This report is generated by Credence — an AI-powered career readiness verification platform.</p>
                <p>Passport ID: <strong>{passport.credenceId}</strong></p>
                <p className="report-disclaimer">
                  This document is a proof of the candidate's assessed career readiness. 
                  Scores are AI-evaluated and represent the candidate's performance at the time of assessment.
                </p>
              </div>
              <div className="report-brand-footer">
                <span className="report-logo-sm">◆</span>
                <span>Credence — Trust Beyond Resumes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
