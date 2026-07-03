import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
import { HiOutlineArrowRight, HiOutlineCheck, HiOutlineLockClosed, HiOutlineClock,
  HiOutlineLightBulb, HiOutlineThumbUp, HiOutlineTrendingUp, HiOutlineSparkles,
  HiOutlineBeaker, HiOutlineChartBar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import CodeEditor from '../components/assessment/CodeEditor';
import './AssessmentPage.css';

const AssessmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const { data } = await assessmentAPI.getById(id);
      setAssessment(data);

      // Initialize answers structure
      const initAnswers = {};
      data.sections.forEach((section, si) => {
        section.questions.forEach((q, qi) => {
          initAnswers[`${si}-${qi}`] = q.userAnswer || '';
        });
      });
      setAnswers(initAnswers);

      // Find first incomplete section
      const firstIncomplete = data.sections.findIndex(s => !s.isCompleted);
      if (firstIncomplete >= 0) setCurrentSection(firstIncomplete);
    } catch (error) {
      toast.error('Failed to load assessment.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [`${currentSection}-${questionIndex}`]: value,
    }));
  };

  const handleSubmitSection = async () => {
    const section = assessment.sections[currentSection];
    const sectionAnswers = section.questions.map((q, i) => ({
      userAnswer: answers[`${currentSection}-${i}`] || '',
      timeSpent: 0,
    }));

    // Check that all questions are answered
    const unanswered = sectionAnswers.filter(a => !a.userAnswer.trim());
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions before proceeding. (${unanswered.length} unanswered)`);
      return;
    }

    setSubmitting(true);
    try {
      await assessmentAPI.submitSection(id, {
        sectionIndex: currentSection,
        answers: sectionAnswers,
      });

      // Refresh assessment to get updated state
      const { data } = await assessmentAPI.getById(id);
      setAssessment(data);

      // Move to next section or evaluate
      if (currentSection + 1 < data.sections.length) {
        setCurrentSection(currentSection + 1);
        toast.success('Section submitted! Moving to next section.');
      } else {
        toast.success('All sections completed!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit section.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishAssessment = async () => {
    setEvaluating(true);
    try {
      const { data } = await assessmentAPI.submit(id);
      setResults(data.results);
      toast.success('Assessment evaluated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to evaluate assessment.');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <span className="loading-text">Loading assessment...</span>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <span className="loading-text">AI is evaluating your responses...</span>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)' }}>
          This may take a moment while we generate detailed feedback.
        </p>
      </div>
    );
  }

  // Show results if evaluation is done
  if (results) {
    return (
      <div className="results-page">
        <div className="results-container">
          <div className="results-header">
            <h1>Assessment <span style={{ color:'var(--slate)' }}>Complete</span></h1>
            <p>Here are your results and recommendations.</p>
          </div>

          <div className="results-scores">
            <div className="score-card glass-card">
              <span className="score-big" style={{ color: results.careerReadinessScore >= 80 ? 'var(--success)' : results.careerReadinessScore >= 50 ? 'var(--gold)' : 'var(--danger)' }}>
                {results.careerReadinessScore}
              </span>
              <span className="score-label">Career Readiness</span>
              <span className="score-out">/100</span>
            </div>
            <div className="score-card glass-card">
              <span className="score-big" style={{ color: results.industryAlignmentScore >= 80 ? 'var(--success)' : results.industryAlignmentScore >= 50 ? 'var(--gold)' : 'var(--danger)' }}>
                {results.industryAlignmentScore}
              </span>
              <span className="score-label">Industry Alignment</span>
              <span className="score-out">/100</span>
            </div>
            <div className="score-card glass-card overall">
              <span className="score-big" style={{ color:'var(--slate)' }}>{results.overallScore}</span>
              <span className="score-label">Overall Score</span>
              <span className="score-out">/100</span>
            </div>
          </div>

          {results.aiSuggestions?.summary && (
            <div className="results-summary glass-card">
              <h3 style={{ display:'flex', alignItems:'center', gap:6 }}><HiOutlineLightBulb /> AI Summary</h3>
              <p>{results.aiSuggestions.summary}</p>
            </div>
          )}

          <div className="results-grid">
            <div className="results-section glass-card">
              <h3 style={{ color: 'var(--accent-success)', display:'flex', alignItems:'center', gap:6 }}><HiOutlineThumbUp /> Strengths</h3>
              <ul>
                {results.strengths?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            <div className="results-section glass-card">
              <h3 style={{ color: 'var(--accent-secondary)', display:'flex', alignItems:'center', gap:6 }}><HiOutlineTrendingUp /> Areas to Improve</h3>
              <ul>
                {results.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </div>

          {results.recommendations?.length > 0 && (
            <div className="results-recommendations glass-card">
              <h3 style={{ display:'flex', alignItems:'center', gap:6 }}><HiOutlineSparkles /> Recommendations</h3>
              <ul>
                {results.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {results.aiSuggestions?.techToLearn?.length > 0 && (
            <div className="results-tech glass-card">
              <h3 style={{ display:'flex', alignItems:'center', gap:6 }}><HiOutlineBeaker /> Technologies to Learn</h3>
              <div className="tech-tags">
                {results.aiSuggestions.techToLearn.map((t, i) => (
                  <span key={i} className="tech-tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          {results.skillBreakdown?.length > 0 && (
            <div className="results-skills glass-card">
              <h3 style={{ display:'flex', alignItems:'center', gap:6 }}><HiOutlineChartBar /> Skill Breakdown</h3>
              <div className="skill-bars">
                {results.skillBreakdown.map((s, i) => (
                  <div key={i} className="skill-bar-item">
                    <div className="skill-bar-header">
                      <span>{s.skill}</span>
                      <span>{s.score}/{s.maxScore}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${(s.score / s.maxScore) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')} style={{ marginTop: 24 }}>
            Back to Dashboard <HiOutlineArrowRight />
          </button>
        </div>
      </div>
    );
  }

  if (!assessment) return null;

  const allSectionsCompleted = assessment.sections.every(s => s.isCompleted);
  const section = assessment.sections[currentSection];
  const progress = ((assessment.sections.filter(s => s.isCompleted).length) / assessment.sections.length) * 100;

  return (
    <div className="assessment-page">
      {/* Header */}
      <div className="assessment-header">
        <div>
          <h1>Assessment #{assessment.assessmentNumber}</h1>
          <p>Role: <strong>{assessment.seekingRole}</strong></p>
        </div>
        <div className="progress-info">
          <span>{Math.round(progress)}% Complete</span>
          <div className="progress-bar" style={{ width: 200 }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="section-tabs">
        {assessment.sections.map((sec, i) => (
          <button
            key={i}
            className={`section-tab ${i === currentSection ? 'active' : ''} ${sec.isCompleted ? 'completed' : ''} ${!sec.isUnlocked ? 'locked' : ''}`}
            onClick={() => sec.isUnlocked && setCurrentSection(i)}
            disabled={!sec.isUnlocked}
          >
            <span className="tab-icon">
              {sec.isCompleted ? <HiOutlineCheck /> : !sec.isUnlocked ? <HiOutlineLockClosed /> : sec.icon}
            </span>
            <span className="tab-title">{sec.title}</span>
          </button>
        ))}
      </div>

      {/* Current Section */}
      {section && (
        <div className="section-content animate-fadeIn">
          <div className="section-header glass-card">
            <span className="section-icon">{section.icon}</span>
            <div>
              <h2>{section.title}</h2>
              <p>{section.description}</p>
            </div>
            <span className="badge badge-primary">{section.questions.length} Questions</span>
          </div>

          {/* Questions */}
          <div className="questions-container">
            {section.questions.map((q, qi) => (
              <div key={qi} className="question-card glass-card">
                <div className="question-header">
                  <span className="question-number">Q{qi + 1}</span>
                  <span className="badge badge-primary">{q.type.toUpperCase()}</span>
                  <span className="question-points">{q.maxScore} pts</span>
                </div>

                <p className="question-text">{q.question}</p>

                {q.context && <p className="question-context">{q.context}</p>}

                {/* Answer input based on type */}
                {q.type === 'mcq' && q.options?.length > 0 ? (
                  <div className="mcq-options">
                    {q.options.map((opt, oi) => (
                      <label
                        key={oi}
                        className={`mcq-option ${answers[`${currentSection}-${qi}`] === opt ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`q-${currentSection}-${qi}`}
                          value={opt}
                          checked={answers[`${currentSection}-${qi}`] === opt}
                          onChange={() => handleAnswerChange(qi, opt)}
                          disabled={section.isCompleted}
                        />
                        <span className="mcq-radio" />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : q.type === 'code' ? (
                  <CodeEditor
                    value={answers[`${currentSection}-${qi}`] || ''}
                    onChange={val => handleAnswerChange(qi, val)}
                    disabled={section.isCompleted}
                    placeholder={q.starterCode || '// Write your code here...'}
                  />
                ) : (
                  <textarea
                    className="input-field answer-textarea"
                    placeholder="Type your answer here..."
                    value={answers[`${currentSection}-${qi}`] || ''}
                    onChange={e => handleAnswerChange(qi, e.target.value)}
                    disabled={section.isCompleted}
                    rows={q.type === 'essay' ? 8 : 4}
                  />
                )}

                {/* Show feedback after evaluation */}
                {section.isCompleted && q.feedback && (
                  <div className="question-feedback">
                    <strong>Score: {q.score}/{q.maxScore}</strong>
                    <p>{q.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Section Actions */}
          <div className="section-actions">
            {!section.isCompleted ? (
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSubmitSection}
                disabled={submitting}
              >
                {submitting ? (
                  <><div className="spinner spinner-sm" /> Submitting...</>
                ) : currentSection + 1 < assessment.sections.length ? (
                  <>Submit & Next Section <HiOutlineArrowRight /></>
                ) : (
                  <>Submit Final Section <HiOutlineCheck /></>
                )}
              </button>
            ) : allSectionsCompleted && assessment.status !== 'evaluated' ? (
              <button className="btn btn-success btn-lg" onClick={handleFinishAssessment}>
                Finish & Get Results <HiOutlineCheck />
              </button>
            ) : (
              <span className="badge badge-success" style={{ padding: '10px 20px', fontSize: 'var(--fs-sm)' }}>
                <HiOutlineCheck /> Section Completed
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;
