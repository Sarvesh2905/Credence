import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { HiOutlineDownload, HiOutlineBadgeCheck, HiOutlineLockClosed } from 'react-icons/hi';
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
        backgroundColor: '#FFFFFF',
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
      <div className="report-wrapper">
        <div className="report-actions">
          <button className="btn btn-primary" onClick={handleDownload}>
            <HiOutlineDownload /> Download PDF
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>

        <div className="report-document" ref={reportRef}>
          {/* Top Bar */}
          <div className="report-top-bar">
            <div className="report-brand">
              <div>
                <div className="report-brand-name">Credence</div>
                <div className="report-brand-tagline">Trust Beyond Resumes</div>
              </div>
            </div>
            <div className="report-id-block">
              <div className="report-id">ID: {passport.credenceId}</div>
              <div className="report-date">Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          {/* Candidate */}
          <div className="report-candidate-row">
            <h2>{profile.name}</h2>
            <div className="report-field">
              <label>Domain</label>
              <span>{profile.domain}</span>
            </div>
            <div className="report-field">
              <label>Past Role</label>
              <span>{profile.pastRole}{profile.pastCompany ? ` at ${profile.pastCompany}` : ''}</span>
            </div>
            <div className="report-field">
              <label>Career Gap</label>
              <span>{profile.careerGap?.days} days</span>
            </div>
            {profile.breakReason && (
              <div className="report-field">
                <label>Reason for Break</label>
                <span>{profile.breakReason}</span>
              </div>
            )}
            <div className="report-field">
              <label>Assessments Taken</label>
              <span>{passport.assessments.length}</span>
            </div>
          </div>

          {/* Overall Performance */}
          <div className="report-section">
            <h2 className="report-section-title">Overall Performance</h2>
              <div className="report-score-hero">
                <span className="score-main">{passport.currentHighestScore}</span>
                <span className="score-of">out of 100 — Highest Overall Score</span>
              </div>
              {latestAssessment && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: 10, marginTop: 12 }}>
                  <div className="report-streak-item">
                    <span className="report-streak-value" style={{ color:'var(--slate)' }}>{latestAssessment.careerReadinessScore}</span>
                    <span className="report-streak-label">Career Readiness</span>
                  </div>
                  <div className="report-streak-item">
                    <span className="report-streak-value" style={{ color:'var(--gold)' }}>{latestAssessment.industryAlignmentScore}</span>
                    <span className="report-streak-label">Industry Alignment</span>
                  </div>
                  <div className="report-streak-item">
                    <span className="report-streak-value" style={{ color:'var(--success)' }}>{passport.overallGrowth}%</span>
                    <span className="report-streak-label">Growth</span>
                  </div>
                </div>
              )}
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
                      <td style={{ fontWeight: 700, color: a.overallScore >= 80 ? 'var(--success)' : a.overallScore >= 50 ? 'var(--gold)' : 'var(--danger)' }}>
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
                            background: s.score >= 80 ? 'var(--success)' : s.score >= 50 ? 'var(--gold)' : 'var(--danger)',
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
                <div className="report-streak-grid">
                  <div className="report-streak-item">
                    <span className="report-streak-value" style={{ color:'var(--slate)' }}>{streak.currentStreak}</span>
                    <span className="report-streak-label">Current Streak</span>
                  </div>
                  <div className="report-streak-item">
                    <span className="report-streak-value" style={{ color:'var(--gold)' }}>{streak.longestStreak}</span>
                    <span className="report-streak-label">Longest Streak</span>
                  </div>
                  <div className="report-streak-item">
                    <span className="report-streak-value" style={{ color:'var(--success)' }}>{streak.milestones?.length || 0}</span>
                    <span className="report-streak-label">Milestones</span>
                  </div>
                </div>
                {streak.milestones?.length > 0 && (
                  <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {streak.milestones.map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 8, padding: '6px 14px' }}>
                        <span style={{ fontSize: 18 }}>{m.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.description}</div>
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
                <span className="eligibility-icon" style={{ fontSize: 18, display:'flex' }}>{passport.isHiringEligible ? <HiOutlineBadgeCheck /> : <HiOutlineLockClosed />}</span>
                <div>
                  <h3>{passport.isHiringEligible ? 'Eligible for Hiring Plan' : 'Not Yet Eligible'}</h3>
                  <p>{passport.isHiringEligible
                    ? 'This candidate has scored 80%+ and is eligible for referral to partner companies.'
                    : 'Score 80%+ on any assessment to unlock hiring eligibility.'
                  }</p>
                </div>
              </div>
            </div>

          {/* Footer */}
          <div className="report-footer">
            <span>Credence — Trust Beyond Resumes</span>
            <span>ID: {passport.credenceId} · AI-evaluated career readiness assessment</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
