# Credence 🚀

> An AI-powered career re-entry platform that helps professionals prove their readiness — not just claim it.

![Credence Banner](https://img.shields.io/badge/Credence-Trust%20Beyond%20Resumes-00d4ff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkw0IDZWMTJDNCAyMCAxMiAyMiAxMiAyMkMyMCAyMiAyMCAyMCAyMCAxMlY2TDEyIDJaIiBmaWxsPSIjMDBkNGZmIi8+PC9zdmc+)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Made with Love](https://img.shields.io/badge/made%20with-%E2%9D%A4%EF%B8%8F-red)
![Team](https://img.shields.io/badge/team-Team%20SILVER-silver)
![Hackathon](https://img.shields.io/badge/hackathon-CODEZAP25-orange)

---

## 🎯 What It Does

Credence bridges the critical gap between career re-entry professionals and employers by replacing assumptions with verified proof. It uses AI to generate deeply personalized, role-specific assessments for any profession — marketing, engineering, HR, design, and more — then issues a verifiable **Career Readiness Passport** that candidates can share as proof of their skills. For professionals who took a career break for caregiving, health, education, or personal reasons, Credence is the platform that finally gives them a fair chance to say: *"I'm ready. Here's the proof."*

---

## 👥 Team

**Team SILVER**

| Member | Role |
|--------|------|
| **Sarvesh P** | Full-Stack Developer & System Architecture |
| **Nishanth M** | Backend Developer & API Integration |
| **Ramya K** | AI/ML Integration & Assessment Engine |
| **Maharaja K** | Database Design & DevOps |
| **Anitha** | Frontend Developer & UI/UX Design |

---

## 🚀 How to Run It

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Gmail account with App Password enabled (for OTP emails)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Sarvesh2905/Credence.git

# Navigate to project directory
cd Credence
```

#### Backend Setup
```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Fill in your keys in .env (see Environment Variables section below)

# Start the server
npm run dev
# Server runs at http://localhost:5000
```

#### Frontend Setup
```bash
# Open a new terminal, navigate to client
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Fill in your Firebase and API keys

# Start the dev server
npm run dev
# App runs at http://localhost:5173
```

### Environment Variables

**`server/.env`**
```env
MONGODB_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RESEND_API_KEY=your_resend_api_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

---

## ✨ Features

### 🔐 Authentication
- ✅ **Secure Signup** — Username uniqueness check, email + password + OTP verification
- ✅ **OTP via Gmail SMTP** — 5-minute expiry, locked spinner to prevent duplicate sends
- ✅ **JWT Authentication** — Protected routes with auto-redirect after login

### 📋 Onboarding
- ✅ **Smart Profile Setup** — Name, gender, age, career gap duration & timeline
- ✅ **Break Reason Capture** — Optional field: Maternity, Health, Caregiving, Education, etc.
- ✅ **AI Resume Analysis** — Upload PDF → AI extracts skills, experience, education, certifications
- ✅ **Social Links** — LinkedIn, GitHub + preferred companies (optional)

### 🧠 AI Assessment Engine
- ✅ **Personalized by Profession** — Every role gets a completely different assessment pipeline
- ✅ **Role-Specific Sections** — Software Engineers get Coding + System Design; HR gets Conflict Resolution + Hiring Simulation; Designers get Figma Challenge + UX Review
- ✅ **Anti-Repetition Logic** — No question repeated across 1st, 2nd, or Nth assessments
- ✅ **Section-by-Section Locking** — Cannot skip to Section 2 before completing Section 1
- ✅ **Dual AI Fallback** — Gemini primary → Groq (Llama 3.3 70B) fallback for 100% uptime

### 📊 Scoring System
- ✅ **Career Readiness Score** — How well the user performed (0–100)
- ✅ **Industry Alignment Score** — How current skills match market demand for the role (0–100)
- ✅ **Skill-Level Breakdown** — Per-skill scores (e.g., Node.js: 80/100, System Design: 55/100)
- ✅ **AI Suggestions** — Specific techs to learn; never discouraging, always actionable

### 🎫 Career Readiness Passport
- ✅ **Cumulative Record** — All assessments with date, role, scores, skill breakdown
- ✅ **Growth Graph** — Visual chart tracking improvement from Assessment 1 → N
- ✅ **Streak Details** — Current streak, longest streak, freeze tokens, milestone badges
- ✅ **Hiring Eligibility Badge** — Auto-unlocked when overall score ≥ 80%

### 📄 Professional Report
- ✅ **PDF Download** — Always free for all users
- ✅ **Candidate Profile Section** — Includes career gap, break reason, experience
- ✅ **Assessment History Table** — All assessments with all scores in one table
- ✅ **Streak Section** — Shows consistency and commitment to employers
- ✅ **Hiring Eligibility Status** — Verified by Credence AI

### 💼 Subscription Plans
- ✅ **Mentorship Plan (₹2,999)** — 1:1 session with industry expert, career guidance, mentor-led skill assessment. Available to all users.
- ✅ **Hiring Plan (₹4,999)** — Company referrals to MOU-signed partner firms. **Locked until score ≥ 80%** — ensures only truly ready candidates get referred.

### 🔥 Gamification
- ✅ **Phoenix Streak System** — Daily comeback streak with unique milestones
  - 🔥 Momentum — 7-day streak
  - ⚡ Unstoppable — 30-day streak
  - 🦅 Transformed — 90-day streak
- ✅ **Streak Freeze** — Weekly freeze token to protect streak on missed days
- ✅ **Milestone Badges** — Displayed on Passport and Report

### 📧 Automated Emails
- ✅ OTP Verification Email
- ✅ Assessment Completion Email (with score)
- ✅ Hiring Plan Unlock Email (when eligible)
- ✅ Weekly Progress Digest (streak, score, growth)
- ✅ Re-engagement Email (7/14/30+ days inactive)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React.js (Vite)** | UI Framework |
| **Vanilla CSS** | Custom styling, glassmorphism design |
| **Recharts** | Analytics charts, radar skill map, growth graph |
| **React Router v6** | Client-side routing with protected routes |
| **html2canvas + jsPDF** | PDF report generation |
| **React Hot Toast** | Notification system |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | Server runtime & API framework |
| **MongoDB + Mongoose** | Database with 6 models (User, Profile, Assessment, Passport, Streak, Subscription) |
| **Firebase Admin SDK** | Authentication & identity verification |
| **Nodemailer (Gmail SMTP)** | OTP and notification emails |
| **Multer + Cloudinary** | Resume upload & cloud storage |
| **node-cron** | Automated weekly digest & re-engagement emails |
| **JWT** | Secure session tokens |

### AI / ML
| Technology | Purpose |
|-----------|---------|
| **Google Gemini 2.0 Flash** | Primary AI for assessment generation & evaluation |
| **Groq (Llama 3.3 70B)** | Fallback AI when Gemini is rate-limited |
| **Custom Prompt Engineering** | Role-specific, persona-aware assessment pipelines |

---

## 📸 Screenshots

> The platform features a dark glassmorphism UI with vibrant cyan/purple gradients.

| Screen | Description |
|--------|-------------|
| 🏠 Landing Page | Full product overview, workflow, subscription plans |
| 🔐 Signup / OTP | Email verification with 5-min OTP and lock spinner |
| 📋 Onboarding | 4-step profile wizard with AI resume analysis |
| 📊 Dashboard | Stats, streaks, analytics charts, action cards |
| 🧠 Assessment | Section-locked, AI-personalized question flow |
| 🎫 Passport | Career readiness card with skill bars and growth graph |
| 📄 Report | Professional PDF with full career story |

---

## 🎥 Demo

> Live assessment flow: Profile → AI Generation → Section-locked Assessment → Dual Score → Passport → Report

---

## 🏆 Hackathon Journey

### What We Learned
- Building AI prompt pipelines that generate truly different assessments for each profession
- Implementing sequential section-locking with server-side enforcement (not just UI)
- Designing a dual AI fallback (Gemini → Groq) for zero-downtime AI responses
- Generating downloadable PDFs that capture live React state using html2canvas + jsPDF
- Structuring MongoDB schemas for cumulative passport data across N assessments

### Challenges We Faced
- Resume parsing from PDF binary — had to handle both text-extractable and scanned PDFs
- AI occasionally returning malformed JSON — solved with robust response cleaning and fallback defaults
- Port conflict between dual dev servers — fixed with `strictPort: true` in Vite config
- Gmail SMTP App Password setup for OTP delivery in development environment

### What We're Proud Of
- The AI actually generates **completely different assessment sections** for a Software Engineer vs a Marketing Manager vs an HR professional — this was our biggest technical challenge and it works beautifully
- The **Career Readiness Passport** gives career re-entry professionals something they've never had before: a verifiable, professional document that proves current skill levels — not just lists past experience
- Full end-to-end flow working: Signup → OTP → Profile + Resume AI → Dashboard → Assessment → Dual Scores → Passport → PDF Report → Hiring Unlock

---

## 🔮 Future Plans

If we had more time, we'd add:

- 🌐 **Deployed Production Build** — Vercel (frontend) + Railway (backend)
- 💳 **Razorpay Integration** — Real payment gateway for Mentorship and Hiring plans
- 🎙️ **Voice Assessment** — Deepgram-powered voice evaluation for Teacher/HR roles
- 📱 **Native Mobile Apps** — React Native iOS and Android
- 🤝 **Company Partner Portal** — Dashboard for MOU-signed companies to browse eligible candidates
- 🗺️ **Skill Learning Path** — Curated external resources (YouTube, docs, courses) matched to each weakness
- 🌍 **Multi-language Support** — Regional Indian languages for wider accessibility

---

## 🤖 AI Tools Used

This project was built with assistance from:

- **Google Gemini** — Primary assessment generation, resume analysis, evaluation scoring
- **Groq / Llama 3.3 70B** — Fallback AI provider for uninterrupted service
- **Antigravity (Google DeepMind)** — Agentic AI pair programmer for code generation, debugging, architecture decisions
- **Figma AI** — UI layout exploration during design phase

> All AI-generated code was reviewed, tested, and customized by our team. The AI prompt engineering for role-specific assessments was designed entirely by us.

---

## 🗂️ Project Structure

```
Credence/
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── pages/            # LandingPage, LoginPage, SignupPage, OnboardingPage, DashboardPage, AssessmentPage
│   │   ├── components/
│   │   │   ├── assessment/   # CodeEditor
│   │   │   ├── dashboard/    # StreakPhoenix
│   │   │   └── report/       # ReportGenerator (PDF)
│   │   ├── contexts/         # AuthContext
│   │   └── services/         # API service layer
│   └── vite.config.js
│
└── server/                   # Node.js + Express backend
    ├── controllers/          # authController, profileController, assessmentController, dashboardController
    ├── models/               # User, Profile, Assessment, Passport, Streak, Subscription
    ├── routes/               # Auth, Profile, Assessment, Dashboard routes
    ├── services/             # aiService (Gemini + Groq), emailService (Nodemailer)
    ├── utils/                # cronJobs (weekly digest, re-engagement)
    ├── middleware/           # JWT auth middleware
    └── config/               # Cloudinary, Firebase config
```

---

## 📄 License

MIT License — feel free to use this for learning and building!

---

## 🙏 Acknowledgments

- Thanks to **CODEZAP25** organizers for the opportunity
- Problem Statement **PS 13 — Human Capital** for the meaningful real-world challenge
- Inspired by the millions of professionals globally who deserve a fair chance after career breaks
- Special thanks to our mentors and evaluators

---

<div align="center">

Built with ❤️ by **Team SILVER** at **CODEZAP25**

*Credence — Trust Beyond Resumes*

**◆**

</div>
