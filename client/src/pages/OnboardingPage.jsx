import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import {
  HiOutlineUser, HiOutlineBriefcase, HiOutlineDocumentText,
  HiOutlineLink, HiOutlineArrowRight, HiOutlineArrowLeft,
  HiOutlineCheck, HiOutlineCloudUpload
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './OnboardingPage.css';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    gender: '',
    age: '',
    careerGapDays: '',
    careerGapFrom: '',
    careerGapTo: '',
    breakReason: '',
    areaOfInterest: '',
    experience: '',
    pastRole: '',
    pastCompany: '',
    domain: '',
    linkedIn: '',
    github: '',
    preferredCompanies: '',
  });

  const steps = [
    { icon: <HiOutlineUser />,         title: 'Personal Info',   desc: 'About yourself' },
    { icon: <HiOutlineBriefcase />,    title: 'Professional',    desc: 'Work background' },
    { icon: <HiOutlineDocumentText />, title: 'Resume',          desc: 'Upload & links' },
    { icon: <HiOutlineLink />,         title: 'Preferences',     desc: 'Goals & targets' },
  ];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        if (!form.name || !form.gender || !form.age || !form.careerGapDays) {
          toast.error('Please fill all required fields.');
          return false;
        }
        return true;
      case 1:
        if (!form.experience || !form.pastRole || !form.pastCompany || !form.domain) {
          toast.error('Please fill all required fields.');
          return false;
        }
        return true;
      case 2:
      case 3:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'areaOfInterest' || key === 'preferredCompanies') {
          formData.append(key, JSON.stringify(value.split(',').map(s => s.trim()).filter(Boolean)));
        } else {
          formData.append(key, value);
        }
      });
      if (resumeFile) formData.append('resume', resumeFile);

      await profileAPI.create(formData);
      updateUser({ isOnboarded: true });
      toast.success('Profile created! Welcome to Credence.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">

        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-logo">
            <img src="/favicon.png" alt="Credence" style={{ width: 28, height: 28 }} />
            <span className="logo-text">Credence</span>
          </div>
          <h1>Complete Your Profile</h1>
          <p>Tell us about your professional journey so we can personalise your experience.</p>
        </div>

        {/* Step Indicators */}
        <div className="steps-indicator">
          {steps.map((s, i) => (
            <div key={i} className={`step-indicator ${i === step ? 'active' : i < step ? 'completed' : ''}`}>
              <div className="step-dot">
                {i < step ? <HiOutlineCheck /> : <span>{i + 1}</span>}
              </div>
              <div className="step-info">
                <span className="step-title">{s.title}</span>
                <span className="step-desc">{s.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="onboarding-card">

          {/* ── Step 0: Personal Info ── */}
          {step === 0 && (
            <div className="form-step">
              <div className="form-step-header">
                <h2>Personal Information</h2>
                <p>Basic details that help us understand who you are.</p>
              </div>
              <div className="form-grid">

                <div className="input-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text" className="input-field" placeholder="e.g. Priya Sharma"
                    value={form.name} onChange={e => handleChange('name', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Gender <span className="required">*</span></label>
                  <select className="input-field" value={form.gender} onChange={e => handleChange('gender', e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Age <span className="required">*</span></label>
                  <input
                    type="number" className="input-field" placeholder="30" min="18" max="100"
                    value={form.age} onChange={e => handleChange('age', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Career Gap — Total Days <span className="required">*</span></label>
                  <input
                    type="number" className="input-field" placeholder="e.g. 730 (2 years)"
                    min="0" value={form.careerGapDays}
                    onChange={e => handleChange('careerGapDays', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Gap Start Date <span className="optional">(Optional)</span></label>
                  <input
                    type="date" className="input-field"
                    value={form.careerGapFrom} onChange={e => handleChange('careerGapFrom', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Gap End Date <span className="optional">(Optional)</span></label>
                  <input
                    type="date" className="input-field"
                    value={form.careerGapTo} onChange={e => handleChange('careerGapTo', e.target.value)}
                  />
                </div>

                <div className="input-group full-width">
                  <label>Reason for Career Break <span className="optional">(Optional)</span></label>
                  <input
                    type="text" className="input-field"
                    placeholder="e.g. Family caregiving, Maternity leave, Personal health, Relocation…"
                    value={form.breakReason} onChange={e => handleChange('breakReason', e.target.value)}
                  />
                  <span className="input-hint">This helps us personalise your assessment and is shown on your Passport & Report.</span>
                </div>

              </div>
            </div>
          )}

          {/* ── Step 1: Professional Info ── */}
          {step === 1 && (
            <div className="form-step">
              <div className="form-step-header">
                <h2>Professional Background</h2>
                <p>Tell us about your work experience and domain.</p>
              </div>
              <div className="form-grid">

                <div className="input-group">
                  <label>Years of Experience <span className="required">*</span></label>
                  <input
                    type="number" className="input-field" placeholder="5" min="0"
                    value={form.experience} onChange={e => handleChange('experience', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Past Role <span className="required">*</span></label>
                  <input
                    type="text" className="input-field" placeholder="e.g. Senior Software Engineer"
                    value={form.pastRole} onChange={e => handleChange('pastRole', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Past Company <span className="required">*</span></label>
                  <input
                    type="text" className="input-field" placeholder="e.g. Google"
                    value={form.pastCompany} onChange={e => handleChange('pastCompany', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Domain / Industry <span className="required">*</span></label>
                  <input
                    type="text" className="input-field"
                    placeholder="e.g. Software Engineering, HR, Marketing"
                    value={form.domain} onChange={e => handleChange('domain', e.target.value)}
                  />
                </div>

                <div className="input-group full-width">
                  <label>Areas of Interest <span className="optional">(Optional)</span></label>
                  <input
                    type="text" className="input-field"
                    placeholder="e.g. React, Node.js, Cloud — comma separated"
                    value={form.areaOfInterest} onChange={e => handleChange('areaOfInterest', e.target.value)}
                  />
                </div>

              </div>
            </div>
          )}

          {/* ── Step 2: Resume & Links ── */}
          {step === 2 && (
            <div className="form-step">
              <div className="form-step-header">
                <h2>Resume &amp; Social Links</h2>
                <p>Upload your resume for AI analysis and add your professional profiles.</p>
              </div>
              <div className="form-grid">

                <div className="input-group full-width">
                  <label>Resume (PDF) <span className="optional">(Optional)</span></label>
                  <div
                    className={`file-upload-area ${resumeFile ? 'has-file' : ''}`}
                    onClick={() => document.getElementById('resume-input').click()}
                  >
                    {resumeFile ? (
                      <div className="file-preview">
                        <HiOutlineDocumentText style={{ fontSize: 36, color: 'var(--emerald)' }} />
                        <span>{resumeFile.name}</span>
                        <span className="file-size">{(resumeFile.size / 1024).toFixed(1)} KB — Click to replace</span>
                      </div>
                    ) : (
                      <>
                        <HiOutlineCloudUpload style={{ fontSize: 36, color: 'var(--text-muted)' }} />
                        <p>Click to upload your resume</p>
                        <span className="file-hint">PDF only · Max 10 MB</span>
                      </>
                    )}
                  </div>
                  <input
                    id="resume-input" type="file" accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={e => setResumeFile(e.target.files[0])}
                  />
                  <span className="input-hint">Your resume is analysed by AI to extract skills and experience for personalised assessments.</span>
                </div>

                <div className="input-group">
                  <label>LinkedIn URL <span className="optional">(Optional)</span></label>
                  <input
                    type="url" className="input-field"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={form.linkedIn} onChange={e => handleChange('linkedIn', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>GitHub URL <span className="optional">(Optional)</span></label>
                  <input
                    type="url" className="input-field"
                    placeholder="https://github.com/yourusername"
                    value={form.github} onChange={e => handleChange('github', e.target.value)}
                  />
                </div>

              </div>
            </div>
          )}

          {/* ── Step 3: Preferences ── */}
          {step === 3 && (
            <div className="form-step">
              <div className="form-step-header">
                <h2>Preferences</h2>
                <p>Tell us about your target companies so we can tailor your journey.</p>
              </div>
              <div className="form-grid">

                <div className="input-group full-width">
                  <label>Preferred Companies <span className="optional">(Optional)</span></label>
                  <input
                    type="text" className="input-field"
                    placeholder="e.g. Google, Microsoft, Amazon — comma separated"
                    value={form.preferredCompanies}
                    onChange={e => handleChange('preferredCompanies', e.target.value)}
                  />
                  <span className="input-hint">This is optional but helps us understand your placement goals.</span>
                </div>

              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="form-nav">
            {step > 0 ? (
              <button className="btn btn-secondary" onClick={prevStep}>
                <HiOutlineArrowLeft /> Previous
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button className="btn btn-primary" onClick={nextStep}>
                Continue <HiOutlineArrowRight />
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><div className="spinner spinner-sm" /> Setting up...</>
                  : <>Complete Setup <HiOutlineCheck /></>}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
