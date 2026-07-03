const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* ================================================================
   AI PROVIDER CHAIN  (Groq primary → OpenRouter fallback)
   Models verified live: 2026-07-03
   ================================================================ */
const GROQ_MODELS = [
  'meta-llama/llama-4-scout-17b-16e-instruct', // ✅ fast, newest
  'qwen/qwen3-32b',                             // ✅ strong JSON output
  'openai/gpt-oss-120b',                        // ✅ high quality
  'openai/gpt-oss-20b',                         // ✅ fast fallback
  'llama-3.3-70b-versatile',                    // may be rate-limited
  'llama-3.1-8b-instant',                       // last Groq resort
];

const OPENROUTER_MODELS = [
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
];

/* ── Groq call ─────────────────────────────────────────────────── */
const callGroq = async (prompt, maxTokens = 6000) => {
  for (const model of GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model,
        temperature: 0.7,
        max_tokens: maxTokens,
      });
      const text = completion.choices[0]?.message?.content?.trim();
      if (text) {
        console.log(`✅ Groq: ${model}`);
        return text;
      }
    } catch (err) {
      console.warn(`⚠️  Groq ${model}: ${err.message?.substring(0, 80)}`);
    }
  }
  return null;
};

/* ── OpenRouter call ───────────────────────────────────────────── */
const callOpenRouter = async (prompt, maxTokens = 6000) => {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  for (const model of OPENROUTER_MODELS) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://credence.app',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
        }),
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) {
        console.log(`✅ OpenRouter: ${model}`);
        return text;
      }
    } catch (err) {
      console.warn(`⚠️  OpenRouter ${model}: ${err.message?.substring(0, 60)}`);
    }
  }
  return null;
};

/* ── Master call with fallback chain ──────────────────────────── */
const callAI = async (prompt, maxTokens = 6000) => {
  const text = await callGroq(prompt, maxTokens) || await callOpenRouter(prompt, maxTokens);
  if (text) return text;
  throw new Error('All AI models currently unavailable. Please retry in a few minutes.');
};

/* ── Safe JSON extractor (handles markdown wrappers, trailing text) */
const extractJSON = (raw) => {
  if (!raw) throw new Error('Empty AI response');
  // Strip markdown code fences
  let text = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  // Try direct parse first
  try { return JSON.parse(text); } catch (_) {}
  // Find first { and last } and try to parse between them
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch (_) {}
  }
  throw new Error('Could not extract valid JSON from AI response');
};

/* ================================================================
   RESUME ANALYSIS
   ================================================================ */
const analyzeResume = async (resumeText) => {
  const prompt = `Analyze this resume. Return ONLY valid JSON (no markdown):
{"skills":[{"name":"skill","proficiency":"beginner|intermediate|advanced|expert"}],"workExperience":[{"role":"title","company":"name","duration":"time","highlights":["achievement"]}],"education":[{"degree":"name","institution":"school","year":"year"}],"certifications":["cert"],"achievements":["achievement"],"summary":"2-3 sentence summary"}

Resume:
${resumeText.substring(0, 3000)}`;

  try {
    const text = await callAI(prompt, 3000);
    return extractJSON(text);
  } catch (error) {
    console.error('❌ Resume analysis error:', error.message);
    return { skills: [], workExperience: [], education: [], certifications: [], achievements: [], summary: 'Analysis pending.' };
  }
};

/* ================================================================
   ASSESSMENT GENERATION
   ================================================================ */
const generateAssessment = async (profile, resumeAnalysis, seekingRole, jobDescription, previousAssessments) => {
  // Limit previous context to avoid token overflow
  let prevNote = '';
  if (previousAssessments?.length > 0) {
    const prevQ = previousAssessments
      .flatMap(a => a.sections.flatMap(s => s.questions.map(q => q.question)))
      .slice(0, 10) // max 10 to keep prompt short
      .map((q, i) => `${i + 1}. ${q}`)
      .join('\n');
    prevNote = `\nAvoid repeating these ${Math.min(previousAssessments.flatMap(a => a.sections.flatMap(s => s.questions)).length, 10)} previous questions:\n${prevQ}\n`;
  }

  const prompt = `Create a personalized career re-entry assessment for:
- Role: ${profile.pastRole} → seeking: ${seekingRole}
- Domain: ${profile.domain} | Experience: ${profile.experience}yrs | Gap: ${profile.careerGap?.days || 0} days
- Skills: ${resumeAnalysis?.skills?.slice(0,8).map(s => s.name).join(', ') || 'N/A'}
${prevNote}
Return ONLY valid JSON (no markdown, no extra text):
{"sections":[{"title":"string","description":"string","icon":"emoji","questions":[{"type":"mcq|scenario|essay","question":"string","context":"string","options":["A","B","C","D"],"correctAnswer":"string","maxScore":10}]}]}

Rules: 4 sections, 3 questions each. Mix mcq/scenario/essay. MCQs need exactly 4 options. Personalize to their domain.`;

  // Try with primary prompt
  try {
    const text = await callAI(prompt, 6000);
    const result = extractJSON(text);
    if (result?.sections?.length > 0) return result;
    throw new Error('No sections in response');
  } catch (firstErr) {
    console.warn('⚠️  First attempt failed:', firstErr.message, '— retrying with minimal prompt...');
  }

  // Retry with an even simpler, shorter prompt
  const simplePrompt = `Generate a JSON assessment for a ${seekingRole} professional. 4 sections, 3 questions each (mix of mcq/essay). Return ONLY JSON: {"sections":[{"title":"str","description":"str","icon":"emoji","questions":[{"type":"mcq","question":"str","context":"","options":["A","B","C","D"],"correctAnswer":"A","maxScore":10}]}]}`;

  try {
    const text = await callAI(simplePrompt, 5000);
    const result = extractJSON(text);
    if (result?.sections?.length > 0) return result;
    throw new Error('No sections in retry response');
  } catch (retryErr) {
    console.error('❌ Both assessment attempts failed:', retryErr.message);
    throw new Error('Failed to generate assessment. Please try again.');
  }
};

/* ================================================================
   ASSESSMENT EVALUATION
   ================================================================ */
const evaluateAssessment = async (sections, profile, seekingRole) => {
  const qa = sections.map(s => ({
    title: s.title,
    questions: s.questions.map(q => ({
      type: q.type,
      question: q.question.substring(0, 200), // truncate long questions
      correctAnswer: q.correctAnswer?.substring(0, 200),
      userAnswer: q.userAnswer?.substring(0, 500),
      maxScore: q.maxScore,
    })),
  }));

  const prompt = `Evaluate this ${seekingRole} assessment. User: ${profile.pastRole}, ${profile.experience}yrs exp, ${profile.careerGap?.days || 0}day gap.

Responses: ${JSON.stringify(qa)}

Return ONLY valid JSON (no markdown):
{"sectionResults":[{"title":"str","questionScores":[{"score":8,"maxScore":10,"feedback":"str"}],"sectionScore":24,"maxSectionScore":30}],"careerReadinessScore":72,"industryAlignmentScore":65,"overallScore":68,"skillBreakdown":[{"skill":"str","score":80,"maxScore":100}],"strengths":["str"],"weaknesses":["str"],"recommendations":["str"],"aiSuggestions":{"techToLearn":["str"],"summary":"encouraging 3-4 sentence summary"}}

Be fair, constructive, encouraging. Give actionable feedback.`;

  try {
    const text = await callAI(prompt, 5000);
    return extractJSON(text);
  } catch (error) {
    console.error('❌ Evaluation error:', error.message);
    throw new Error('Failed to evaluate assessment. Please try again.');
  }
};

module.exports = { analyzeResume, generateAssessment, evaluateAssessment };
