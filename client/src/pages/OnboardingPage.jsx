import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import { HiOutlineUser, HiOutlineBriefcase, HiOutlineDocumentText, HiOutlineLink, HiOutlineArrowRight, HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi';
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
    { icon: <HiOutlineUser />, title: 'Personal Info', desc: 'Tell us about yourself' },
    { icon: <HiOutlineBriefcase />, title: 'Professional Info', desc: 'Your work background' },
    { icon: <HiOutlineDocumentText />, title: 'Resume & Links', desc: 'Upload resume & add links' },
    { icon: <HiOutlineLink />, title: 'Preferences', desc: 'Your goals & preferences' },
  ];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        if (!form.name || !form.gender || !form.age || !form.careerGapDays || !form.careerGapFrom || !form.careerGapTo) {
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
        return true; // Resume and links are optional here
      case 3:
        return true; // Preferences are optional
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

      // Append all text fields
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'areaOfInterest') {
          formData.append(key, JSON.stringify(value.split(',').map(s => s.trim()).filter(Boolean)));
        } else if (key === 'preferredCompanies') {
          formData.append(key, JSON.stringify(value.split(',').map(s => s.trim()).filter(Boolean)));
        } else {
          formData.append(key, value);
        }
      });

      // Append resume file
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      await profileAPI.create(formData);
      updateUser({ isOnboarded: true });
      toast.success('Profile created! Welcome to Credence! 🚀');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  const domains = [
    'Software Engineering', 'Data Science', 'Product Management', 'Marketing',
    'Design', 'Finance', 'Human Resources', 'Operations', 'Sales',
    'Healthcare', 'Education', 'Legal', 'Consulting', 'Other'
  ];

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1 className="gradient-text">Complete Your Profile</h1>
          <p>Tell us about your professional journey so we can personalize your experience.</p>
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
              {i < steps.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="onboarding-card glass-card">
          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div className="form-step animate-fadeInUp">
              <h2>Personal Information</h2>
              <div className="form-grid">
                <div className="input-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input type="text" className="input-field" placeholder="John Doe" value={form.name} onChange={e => handleChange('name', e.target.value)} />
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
                  <input type="number" className="input-field" placeholder="30" min="18" max="100" value={form.age} onChange={e => handleChange('age', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Career Gap (in days) <span className="required">*</span></label>
                  <input type="number" className="input-field" placeholder="730" min="0" value={form.careerGapDays} onChange={e => handleChange('careerGapDays', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Gap From <span className="required">*</span></label>
                  <input type="date" className="input-field" value={form.careerGapFrom} onChange={e => handleChange('careerGapFrom', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Gap To <span className="required">*</span></label>
                  <input type="date" className="input-field" value={form.careerGapTo} onChange={e => handleChange('careerGapTo', e.target.value)} />
                </div>
                <div className="input-group full-width">
                  <label>Reason for Career Break <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
                  <select className="input-field" value={form.breakReason} onChange={e => handleChange('breakReason', e.target.value)}>
                    <option value="">Select a reason</option>
                    <option>Maternity / Parental Leave</option>
                    <option>Personal Health / Medical</option>
                    <option>Family Caregiving</option>
                    <option>Relocation</option>
                    <option>Higher Education</option>
                    <option>Personal Choice / Sabbatical</option>
                    <option>Layoff / Redundancy</option>
                    <option>Entrepreneurship / Self-employment</option>
                    <option>Other</option>
                  </select>
                  <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                    This helps us personalise your assessment and is included in your report.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Professional Info */}
          {step === 1 && (
            <div className="form-step animate-fadeInUp">
              <h2>Professional Background</h2>
              <div className="form-grid">
                <div className="input-group full-width">
                  <label>Area of Interest</label>
                  <input type="text" className="input-field" placeholder="React, Node.js, Cloud (comma separated)" value={form.areaOfInterest} onChange={e => handleChange('areaOfInterest', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Years of Experience <span className="required">*</span></label>
                  <input type="number" className="input-field" placeholder="5" min="0" value={form.experience} onChange={e => handleChange('experience', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Past Working Role <span className="required">*</span></label>
                  <input type="text" className="input-field" placeholder="Senior Developer" value={form.pastRole} onChange={e => handleChange('pastRole', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Past Company <span className="required">*</span></label>
                  <input type="text" className="input-field" placeholder="Google" value={form.pastCompany} onChange={e => handleChange('pastCompany', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Domain <span className="required">*</span></label>
                  <select className="input-field" value={form.domain} onChange={e => handleChange('domain', e.target.value)}>
                    <option value="">Select domain</option>
                    {domains.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Resume & Links */}
          {step === 2 && (
            <div className="form-step animate-fadeInUp">
              <h2>Resume & Social Links</h2>
              <div className="form-grid">
                <div className="input-group full-width">
                  <label>Upload Current Resume (PDF)</label>
                  <div className="file-upload-area" onClick={() => document.getElementById('resume-input').click()}>
                    {resumeFile ? (
                      <div className="file-preview">
                        <HiOutlineDocumentText style={{ fontSize: 32, color: 'var(--accent-primary)' }} />
                        <span>{resumeFile.name}</span>
                        <span className="file-size">{(resumeFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ) : (
                      <>
                        <HiOutlineDocumentText style={{ fontSize: 40, color: 'var(--text-muted)' }} />
                        <p>Click to upload your resume</p>
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>PDF only, max 10MB</span>
                      </>
                    )}
                  </div>
                  <input
                    id="resume-input"
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={e => setResumeFile(e.target.files[0])}
                  />
                  <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginTop: 8 }}>
                    Your resume will be analyzed by AI to extract skills and experience for personalized assessments.
                  </p>
                </div>
                <div className="input-group">
                  <label>LinkedIn URL</label>
                  <input type="url" className="input-field" placeholder="https://linkedin.com/in/yourprofile" value={form.linkedIn} onChange={e => handleChange('linkedIn', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>GitHub URL</label>
                  <input type="url" className="input-field" placeholder="https://github.com/yourusername" value={form.github} onChange={e => handleChange('github', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="form-step animate-fadeInUp">
              <h2>Preferences</h2>
              <div className="form-grid">
                <div className="input-group full-width">
                  <label>Preferred Companies (Optional)</label>
                  <input type="text" className="input-field" placeholder="Google, Microsoft, Amazon (comma separated)" value={form.preferredCompanies} onChange={e => handleChange('preferredCompanies', e.target.value)} />
                  <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                    List companies you'd like to work with. This is optional but helps us understand your goals.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="form-nav">
            {step > 0 && (
              <button className="btn btn-secondary" onClick={prevStep}>
                <HiOutlineArrowLeft /> Previous
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 3 ? (
              <button className="btn btn-primary" onClick={nextStep}>
                Next <HiOutlineArrowRight />
              </button>
            ) : (
              <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={loading}>
                {loading ? <><div className="spinner spinner-sm" /> Setting up...</> : <>Complete Setup <HiOutlineCheck /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
