const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
};

/**
 * Call AI with automatic Groq fallback when Gemini is rate-limited
 */
const callAI = async (prompt) => {
  // Try Gemini first
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('✅ AI response from: Gemini');
    return text;
  } catch (geminiError) {
    console.warn(`⚠️  Gemini failed (${geminiError.message?.substring(0, 80)}). Falling back to Groq...`);
  }

  // Fallback to Groq
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 8000,
    });
    const text = completion.choices[0]?.message?.content || '';
    console.log('✅ AI response from: Groq (fallback)');
    return text;
  } catch (groqError) {
    console.error('❌ Both Gemini and Groq failed:', groqError.message);
    throw new Error('AI service unavailable. Please try again later.');
  }
};

/**
 * Analyze a resume text and extract structured data
 */
const analyzeResume = async (resumeText) => {

  const prompt = `You are an expert resume analyzer. Analyze the following resume text and extract structured information.

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "skills": [{"name": "skill name", "proficiency": "beginner|intermediate|advanced|expert"}],
  "workExperience": [{"role": "job title", "company": "company name", "duration": "duration", "highlights": ["key achievement 1", "key achievement 2"]}],
  "education": [{"degree": "degree name", "institution": "institution name", "year": "year"}],
  "certifications": ["certification 1", "certification 2"],
  "achievements": ["achievement 1", "achievement 2"],
  "summary": "A brief 2-3 sentence professional summary"
}

Resume Text:
${resumeText}`;

  try {
    const text = await callAI(prompt);
    // Clean the response - remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('❌ Resume analysis error:', error.message);
    return {
      skills: [],
      workExperience: [],
      education: [],
      certifications: [],
      achievements: [],
      summary: 'Unable to analyze resume. Please try again.',
    };
  }
};

/**
 * Generate a personalized assessment based on user profile and seeking role
 */
const generateAssessment = async (profile, resumeAnalysis, seekingRole, jobDescription, previousAssessments) => {

  // Build context about previous assessments to avoid repetition
  let previousContext = '';
  if (previousAssessments && previousAssessments.length > 0) {
    const prevQuestions = previousAssessments.flatMap(a =>
      a.sections.flatMap(s => s.questions.map(q => q.question))
    );
    previousContext = `
IMPORTANT: The user has taken ${previousAssessments.length} previous assessment(s). 
DO NOT repeat any of these questions:
${prevQuestions.slice(0, 50).map((q, i) => `${i + 1}. ${q}`).join('\n')}

Generate ENTIRELY NEW and DIFFERENT questions that test different aspects of their knowledge.`;
  }

  const prompt = `You are an expert assessment designer for career re-entry professionals. Create a personalized, multi-section assessment.

USER PROFILE:
- Name: ${profile.name}
- Career Gap: ${profile.careerGap?.days || 0} days (from ${profile.careerGap?.from || 'N/A'} to ${profile.careerGap?.to || 'N/A'})
- Past Role: ${profile.pastRole} at ${profile.pastCompany}
- Domain: ${profile.domain}
- Experience: ${profile.experience} years
- Areas of Interest: ${profile.areaOfInterest?.join(', ') || 'Not specified'}

RESUME SKILLS: ${resumeAnalysis?.skills?.map(s => s.name).join(', ') || 'Not available'}

SEEKING ROLE: ${seekingRole}
${jobDescription ? `JOB DESCRIPTION: ${jobDescription}` : ''}

${previousContext}

Create a comprehensive, role-specific assessment with 4-6 sections. Each section should test a different competency area relevant to the seeking role.

Every profession gets a COMPLETELY DIFFERENT assessment pipeline. Examples:
- Software Engineer: Coding, Debugging, System Design, AI Pair Programming, Git Workflow
- Marketing Professional: Campaign Design, Market Analysis, Customer Persona, Brand Strategy
- HR: Conflict Resolution, Hiring Simulation, Policy Creation, Communication
- UI/UX Designer: Figma Challenge, Accessibility Review, User Journey Design
- Teacher: Teaching Simulation, Lesson Planning, Student Interaction

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "sections": [
    {
      "title": "Section Title",
      "description": "What this section tests",
      "icon": "emoji icon",
      "questions": [
        {
          "type": "mcq",
          "question": "The question text",
          "context": "Additional context if needed",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "The correct option text",
          "maxScore": 10
        },
        {
          "type": "scenario",
          "question": "Describe a scenario and ask how they'd handle it",
          "context": "Background information",
          "options": [],
          "correctAnswer": "Key points the answer should cover",
          "maxScore": 15
        },
        {
          "type": "essay",
          "question": "An open-ended question testing deep understanding",
          "context": "",
          "options": [],
          "correctAnswer": "Key themes and points expected",
          "maxScore": 20
        }
      ]
    }
  ]
}

RULES:
1. Generate 4-6 sections with 3-5 questions each
2. Mix question types: mcq, scenario, essay, case_study, ranking, debugging, design
3. Questions should be challenging but fair for someone re-entering the field
4. Consider their career gap — test both foundational knowledge AND current industry trends
5. Make it personalized to their specific background and target role
6. Each question must have a maxScore value
7. For MCQs, always provide exactly 4 options`;

  try {
    const text = await callAI(prompt);
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('❌ Assessment generation error:', error.message);
    throw new Error('Failed to generate assessment. Please try again.');
  }
};

/**
 * Evaluate user's assessment responses and generate scores
 */
const evaluateAssessment = async (sections, profile, seekingRole) => {

  const questionsWithAnswers = sections.map(section => ({
    title: section.title,
    questions: section.questions.map(q => ({
      type: q.type,
      question: q.question,
      correctAnswer: q.correctAnswer,
      userAnswer: q.userAnswer,
      maxScore: q.maxScore,
    })),
  }));

  const prompt = `You are an expert assessment evaluator. Evaluate the user's responses fairly and constructively.

USER CONTEXT:
- Past Role: ${profile.pastRole}
- Domain: ${profile.domain}
- Career Gap: ${profile.careerGap?.days || 0} days
- Seeking: ${seekingRole}

ASSESSMENT RESPONSES:
${JSON.stringify(questionsWithAnswers, null, 2)}

Evaluate each answer and return ONLY a valid JSON object (no markdown, no code blocks):
{
  "sectionResults": [
    {
      "title": "Section Title",
      "questionScores": [
        {
          "score": 8,
          "maxScore": 10,
          "feedback": "Constructive feedback on the answer"
        }
      ],
      "sectionScore": 24,
      "maxSectionScore": 30
    }
  ],
  "careerReadinessScore": 72,
  "industryAlignmentScore": 65,
  "overallScore": 68,
  "skillBreakdown": [
    {"skill": "JavaScript", "score": 80, "maxScore": 100},
    {"skill": "System Design", "score": 55, "maxScore": 100}
  ],
  "strengths": ["Strong foundation in...", "Good understanding of..."],
  "weaknesses": ["Need to improve in...", "Should focus on..."],
  "recommendations": [
    "Learn modern frameworks like...",
    "Practice system design patterns..."
  ],
  "aiSuggestions": {
    "techToLearn": ["Technology 1", "Technology 2"],
    "summary": "A supportive, encouraging 3-4 sentence summary of their performance. Never discourage. Focus on growth potential."
  }
}

SCORING RULES:
1. Be fair but constructive — never discouraging
2. careerReadinessScore: Based on how well they performed (0-100)
3. industryAlignmentScore: How well their current skills match what the industry needs for the role (0-100)
4. For low scores, emphasize specific areas to improve, NOT that they're not ready
5. Always provide actionable, specific recommendations
6. Highlight their strengths to boost confidence`;

  try {
    const text = await callAI(prompt);
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('❌ Assessment evaluation error:', error.message);
    throw new Error('Failed to evaluate assessment. Please try again.');
  }
};

module.exports = {
  analyzeResume,
  generateAssessment,
  evaluateAssessment,
};
