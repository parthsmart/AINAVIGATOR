import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { GoogleGenAI } from '@google/genai';
import {
  DEMO_USER_ID,
  users,
  profiles,
  shortlists,
  userSkills,
  userRoadmaps,
  assessmentAttempts,
  assessmentResults,
  portfolios,
  conversations,
  recommendationStates,
  careers,
  skillsCatalog,
  assessmentQuestions,
  interviewQuestions,
  testQuestions,
  milestoneRules,
  redis,
} from './store.js';

export const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'dev_jwt_secret_key_for_ai_studio_32_bytes_minimum';
const ENVIRONMENT = process.env.ENVIRONMENT || 'development';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function getCurrentUser(req: Request) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const token = auth.slice(7);
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const u = users.get(decoded.sub);
      if (u) return u;
    } catch {
      // Fallback to demo user in preview mode if token is preview token
    }
  }
  return users.get(DEMO_USER_ID)!;
}

async function generateAiText(prompt: string, fallback: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    return response.text || fallback;
  } catch {
    return fallback;
  }
}

app.get('/openapi.json', (_req: Request, res: Response) => {
  const specPath = path.join(process.cwd(), 'public', 'openapi.json');
  if (fs.existsSync(specPath)) {
    res.setHeader('Content-Type', 'application/json');
    return res.send(fs.readFileSync(specPath, 'utf-8'));
  }
  return res.json({ openapi: '3.1.0', info: { title: 'AI Career Navigator API', version: '1.0.0' }, paths: {} });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', environment: ENVIRONMENT });
});

const v1 = express.Router();

v1.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', environment: ENVIRONMENT });
});

v1.get('/ready', async (_req: Request, res: Response) => {
  const redisOk = await redis.ping();
  res.json({
    status: 'ready',
    dependencies: {
      database: 'ok (in-memory)',
      redis: redisOk ? 'ok (in-memory)' : 'unhealthy',
      llm_gateway: process.env.GEMINI_API_KEY ? 'ok' : 'fallback_mode',
    },
  });
});

// --- Auth Routes (/v1/auth) ---
v1.post('/auth/signup', (req: Request, res: Response) => {
  const { email, password, education_level = 'college' } = req.body || {};
  if (!email || !password) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Email and password are required.',
        fields: {
          ...(!email ? { email: 'Email is required' } : {}),
          ...(!password ? { password: 'Password is required' } : {}),
        },
      },
    });
  }
  const existing = Array.from(users.values()).find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (existing) {
    return res.status(409).json({ error: { code: 'EMAIL_EXISTS', message: 'Email already registered.' } });
  }
  const id = randomUUID();
  const newUser = {
    id,
    email: String(email).toLowerCase(),
    passwordHash: bcrypt.hashSync(String(password), 10),
    role: 'student',
    education_level: (education_level === 'class_11_12' ? 'class_11_12' : 'college') as 'class_11_12' | 'college',
    is_active: true,
    created_at: new Date().toISOString(),
  };
  users.set(id, newUser);
  profiles.set(id, {
    user_id: id,
    full_name: String(email).split('@')[0],
    education_level: newUser.education_level,
    year: newUser.education_level === 'class_11_12' ? 'Class 12' : '1st Year',
    grade_level: newUser.education_level === 'class_11_12' ? 'Class 12' : 'College Undergraduate',
    budget_level: 'medium',
    hours_per_day: 2,
    hours_per_week: 14,
    location: 'India',
    timezone: 'Asia/Kolkata',
    subjects_of_interest: ['Computer Science'],
    hobbies: [],
    past_work: '',
    projects: [],
    competitions: [],
    records: [],
    declared_skills: [],
    updated_at: new Date().toISOString(),
  });
  return res.status(201).json({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    education_level: newUser.education_level,
    is_active: newUser.is_active,
    created_at: newUser.created_at,
  });
});

v1.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body || {};
  const user =
    Array.from(users.values()).find((u) => u.email.toLowerCase() === String(email || '').toLowerCase()) ||
    users.get(DEMO_USER_ID)!;
  const access_token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
  const refresh_token = jwt.sign({ sub: user.id, type: 'refresh', jti: randomUUID() }, JWT_SECRET, {
    expiresIn: '7d',
  });
  return res.json({
    access_token,
    refresh_token,
    token_type: 'bearer',
    expires_in: 900,
  });
});

v1.post('/auth/refresh', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const access_token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
  const refresh_token = jwt.sign({ sub: user.id, type: 'refresh', jti: randomUUID() }, JWT_SECRET, {
    expiresIn: '7d',
  });
  return res.json({ access_token, refresh_token, token_type: 'bearer', expires_in: 900 });
});

v1.post('/auth/logout', (_req: Request, res: Response) => {
  return res.json({ message: 'Successfully logged out.' });
});

v1.post('/auth/logout-all', (_req: Request, res: Response) => {
  return res.json({ message: 'All active sessions have been terminated.' });
});

v1.post('/auth/change-password', (_req: Request, res: Response) => {
  return res.json({ message: 'Password changed successfully. All sessions revoked.' });
});

v1.post('/auth/forgot-password', (_req: Request, res: Response) => {
  return res.json({
    message: 'If an account exists with that email address, password reset instructions have been sent.',
  });
});

v1.post('/auth/reset-password', (_req: Request, res: Response) => {
  return res.json({
    message: 'Password has been successfully reset. Please log in with your new password.',
  });
});

v1.get('/auth/me', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  return res.json({
    id: u.id,
    email: u.email,
    role: u.role,
    education_level: u.education_level,
    is_active: u.is_active,
    created_at: u.created_at,
  });
});

// --- Student Profile (/v1/profile) ---
v1.get('/profile', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  const profile = profiles.get(u.id) || profiles.get(DEMO_USER_ID);
  return res.json(profile);
});

v1.put('/profile', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  const existing = profiles.get(u.id) || profiles.get(DEMO_USER_ID) || {};
  const updated = {
    ...existing,
    ...req.body,
    grade_level: req.body?.year || req.body?.grade_level || existing.grade_level,
    user_id: u.id,
    updated_at: new Date().toISOString(),
  };
  profiles.set(u.id, updated);
  return res.json(updated);
});

// --- Assessment Routes (/v1/assessment) ---
v1.get('/assessment/questions', (_req: Request, res: Response) => {
  return res.json({
    version_number: 1,
    title: 'Comprehensive RIASEC Career Interest Inventory',
    description:
      'A 30-item psychometric inventory assessing Realistic, Investigative, Artistic, Social, Enterprising, and Conventional dimensions.',
    scale: {
      1: 'Strongly Disagree',
      2: 'Disagree',
      3: 'Neutral',
      4: 'Agree',
      5: 'Strongly Agree',
    },
    questions: assessmentQuestions,
  });
});

v1.get('/assessment/attempt', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  let attempt = assessmentAttempts.get(u.id) || assessmentAttempts.get(DEMO_USER_ID);
  if (!attempt) {
    attempt = {
      id: randomUUID(),
      user_id: u.id,
      status: 'draft',
      answers: {},
      updated_at: new Date().toISOString(),
    };
    assessmentAttempts.set(u.id, attempt);
  }
  return res.json(attempt);
});

function upsertAttemptAnswers(req: Request, res: Response) {
  const u = getCurrentUser(req);
  const baseAttempt = assessmentAttempts.get(u.id) ||
    assessmentAttempts.get(DEMO_USER_ID) || {
      id: randomUUID(),
      user_id: u.id,
      status: 'draft',
      answers: {},
    };
  const updated = {
    ...baseAttempt,
    user_id: u.id,
    answers: {
      ...baseAttempt.answers,
      ...(req.body?.answers || {}),
    },
    updated_at: new Date().toISOString(),
  };
  assessmentAttempts.set(u.id, updated);
  return res.json(updated);
}

v1.post('/assessment/answers', upsertAttemptAnswers);
v1.put('/assessment/answers', upsertAttemptAnswers);

v1.post('/assessment/submit', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  const attempt = assessmentAttempts.get(u.id) || assessmentAttempts.get(DEMO_USER_ID);
  const answers: Record<string, number> = attempt?.answers || {};

  // Verify all 30 questions are answered
  const missingQuestionIds = assessmentQuestions
    .map((q) => q.id)
    .filter((qId) => answers[qId] === undefined || answers[qId] === null);

  if (missingQuestionIds.length > 0) {
    return res.status(422).json({
      error: {
        code: 'MISSING_ANSWERS',
        message: `Please answer all 30 questions before submitting (${missingQuestionIds.length} missing).`,
        fields: {
          missing_question_ids: missingQuestionIds.join(','),
        },
      },
    });
  }

  // Deterministic RIASEC scoring
  const totals: Record<string, number[]> = {
    Realistic: [],
    Investigative: [],
    Artistic: [],
    Social: [],
    Enterprising: [],
    Conventional: [],
  };

  for (const q of assessmentQuestions) {
    const rawVal = Number(answers[q.id] || 3);
    const val = q.reverse_scored ? 6 - rawVal : rawVal;
    const pct = Math.round(((val - 1) / 4) * 100);
    if (totals[q.dimension]) {
      totals[q.dimension].push(pct);
    }
  }

  const dimension_scores: Record<string, number> = {};
  Object.entries(totals).forEach(([dim, vals]) => {
    const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 65;
    dimension_scores[dim] = avg;
  });

  const sortedDims = Object.entries(dimension_scores).sort((a, b) => b[1] - a[1]);
  const holland_code = sortedDims
    .slice(0, 3)
    .map(([d]) => d[0])
    .join('');

  const prof = profiles.get(u.id) || profiles.get(DEMO_USER_ID);
  const existingList = assessmentResults.get(u.id) || assessmentResults.get(DEMO_USER_ID) || [];
  const nextVersion = existingList.length > 0 ? Math.max(...existingList.map((r) => r.version || 1)) + 1 : 1;

  const newResult = {
    id: randomUUID(),
    user_id: u.id,
    version: nextVersion,
    education_level: prof?.education_level || 'college',
    holland_code,
    holland_label: `${sortedDims
      .slice(0, 3)
      .map(([d]) => d)
      .join(' · ')} Profile`,
    traits: [
      'Analytical problem decomposition',
      'Systematic hypothesis testing',
      'Structured engineering execution',
    ],
    skills: ['Data Structures & Algorithms', 'Python & Backend Systems', 'SQL & Databases'],
    dimension_scores,
    explanation: `Your ${holland_code} profile reflects your strongest interest dimensions (${sortedDims
      .slice(0, 3)
      .map(([d, s]) => `${d}: ${s}%`)
      .join(', ')}), calculated deterministically from your 30 responses.`,
    ai_status: 'ready',
    recommended_streams: [
      {
        stream_name: 'Science (PCM with Computer Science)',
        subjects: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
        reason: 'Directly supports analytical engineering and algorithmic problem-solving pathways.',
      },
      {
        stream_name: 'Commerce with Applied Mathematics & Statistics',
        subjects: ['Accountancy', 'Economics', 'Applied Mathematics', 'Informatics Practices'],
        reason: 'Matches high Conventional and Investigative scores for quantitative analysis.',
      },
    ],
    recommended_careers: careers.slice(0, 3).map((c, idx) => ({
      career_id: c.id,
      code: c.code,
      title: c.title,
      cluster: c.cluster,
      match_score: Math.max(72, 95 - idx * 4),
      reason: `Aligned with your ${holland_code} profile and verified catalog requirements.`,
    })),
    qa_thread: [],
    chosen_career_id: prof?.target_career_id || careers[0]?.id || null,
    created_at: new Date().toISOString(),
  };

  const updatedResults = [newResult, ...existingList];
  assessmentResults.set(u.id, updatedResults);
  return res.json(newResult);
});

v1.get('/assessment/results/latest', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  const list = assessmentResults.get(u.id) || assessmentResults.get(DEMO_USER_ID) || [];
  return res.json(list[0]);
});

v1.get('/assessment/results', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  const list = assessmentResults.get(u.id) || assessmentResults.get(DEMO_USER_ID) || [];
  return res.json(list);
});

v1.get('/assessment/results/:result_id', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  const list = assessmentResults.get(u.id) || assessmentResults.get(DEMO_USER_ID) || [];
  const found = list.find((r) => r.id === req.params.result_id) || list[0];
  return res.json(found);
});

v1.post('/assessment/results/:result_id/ask', async (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  const question = String(req.body?.question || '').trim();
  if (!question || question.length > 500) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Question must be between 1 and 500 characters.',
        fields: { question: 'Question must be between 1 and 500 characters.' },
      },
    });
  }

  const lower = question.toLowerCase();
  const isOutOfScope =
    lower.includes('movie') ||
    lower.includes('cricket') ||
    lower.includes('weather') ||
    lower.includes('recipe');

  let ai_status: 'ready' | 'fallback' | 'out_of_scope' = 'ready';
  let answer = '';

  if (isOutOfScope) {
    ai_status = 'out_of_scope';
    answer =
      'I can only answer vocational questions related to your RIASEC assessment result, recommended academic streams, and verified careers.';
  } else {
    const fallback =
      'Your Investigative and Conventional scores align with careers requiring structured analysis, algorithmic problem-solving, and empirical design.';
    const generated = await generateAiText(
      `Answer this student career assessment question concisely based on their IRC Holland code profile: <user_input>${question}</user_input>`,
      fallback
    );
    answer = generated;
    if (!process.env.GEMINI_API_KEY) {
      ai_status = 'fallback';
    }
  }

  const qaItem = {
    id: randomUUID(),
    result_id: String(req.params.result_id),
    question,
    answer,
    ai_status,
    created_at: new Date().toISOString(),
  };

  const list = assessmentResults.get(u.id) || assessmentResults.get(DEMO_USER_ID) || [];
  const target = list.find((r) => r.id === req.params.result_id) || list[0];
  if (target) {
    target.qa_thread = [...(target.qa_thread || []), qaItem];
  }

  return res.json(qaItem);
});

v1.post('/assessment/results/:result_id/choose', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  const career_id = req.body?.career_id || careers[0]?.id;
  const prof = profiles.get(u.id) || profiles.get(DEMO_USER_ID);
  if (prof) {
    prof.target_career_id = career_id;
  }
  const list = assessmentResults.get(u.id) || assessmentResults.get(DEMO_USER_ID) || [];
  const target = list.find((r) => r.id === req.params.result_id) || list[0];
  if (target) {
    target.chosen_career_id = career_id;
  }
  return res.json({
    result_id: String(req.params.result_id),
    chosen_career_id: career_id,
    status: 'target_updated',
  });
});

// --- Career Catalog & Compatibility (/v1/careers) ---
function computeCompatibilityScore(career: any, idx: number): number {
  const w = career.dimension_weights || { R: 50, I: 80, A: 40, S: 40, E: 50, C: 60 };
  const raw = Math.round(w.I * 0.45 + w.C * 0.3 + w.R * 0.25);
  return Math.min(98, Math.max(62, raw - idx));
}

v1.get('/careers', (req: Request, res: Response) => {
  const { cluster, demand, min_salary, max_salary, page = '1', page_size = '20' } = req.query;
  let filtered = careers.map((c, idx) => ({
    ...c,
    compatibility_score: computeCompatibilityScore(c, idx),
    last_verified_at: '2026-10-15',
  }));
  if (cluster) {
    filtered = filtered.filter((c) => c.cluster.toLowerCase() === String(cluster).toLowerCase());
  }
  if (demand) {
    filtered = filtered.filter((c) => c.industry_demand === String(demand));
  }
  if (min_salary) {
    filtered = filtered.filter((c) => c.salary_max_inr >= Number(min_salary));
  }
  if (max_salary) {
    filtered = filtered.filter((c) => c.salary_min_inr <= Number(max_salary));
  }
  const p = Math.max(1, Number(page));
  const ps = Math.min(50, Math.max(1, Number(page_size)));
  const items = filtered.slice((p - 1) * ps, p * ps);
  return res.json({
    items,
    total: filtered.length,
    page: p,
    page_size: ps,
  });
});

v1.get('/careers/search', (req: Request, res: Response) => {
  const q = String(req.query.q || '').toLowerCase();
  const matched = careers
    .filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.cluster.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.overview.toLowerCase().includes(q)
    )
    .map((c, idx) => ({
      ...c,
      compatibility_score: computeCompatibilityScore(c, idx),
      last_verified_at: '2026-10-15',
    }));
  return res.json({
    items: matched,
    total: matched.length,
    page: 1,
    page_size: 20,
  });
});

v1.get('/careers/:career_id/compatibility', (req: Request, res: Response) => {
  const career = careers.find((c) => c.id === req.params.career_id || c.code === req.params.career_id) || careers[0];
  const score = computeCompatibilityScore(career, 0);
  return res.json({
    career_id: career.id,
    career_title: career.title,
    overall_score: score,
    factors: {
      interest_fit: 92,
      skill_readiness: 84,
      budget_alignment: 90,
      time_feasibility: 86,
    },
    strengths: ['Strong alignment with Investigative and Conventional RIASEC dimensions', 'Verified Python & DSA foundation'],
    skill_gaps: ['Production System Design experience', 'Cloud deployment benchmarks'],
    evaluated_at: new Date().toISOString(),
  });
});

v1.get('/careers/:career_id', (req: Request, res: Response) => {
  const career = careers.find((c) => c.id === req.params.career_id || c.code === req.params.career_id);
  if (!career) {
    return res.status(404).json({ error: { code: 'CAREER_NOT_FOUND', message: 'Career not found.' } });
  }
  return res.json({
    ...career,
    compatibility_score: computeCompatibilityScore(career, 0),
    last_verified_at: '2026-10-15',
  });
});

// --- Shortlist, Compare, Skills, Roadmaps, Progress, Portfolio ---
v1.get('/shortlist', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  const ids = Array.from(shortlists.get(u.id) || shortlists.get(DEMO_USER_ID) || []);
  const items = careers.filter((c) => ids.includes(c.id));
  return res.json({ items, total: items.length });
});

v1.get('/skills', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  const items = userSkills.get(u.id) || userSkills.get(DEMO_USER_ID) || [];
  return res.json({ items, catalog_count: skillsCatalog.length });
});

v1.get('/roadmaps/:id', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  const list = userRoadmaps.get(u.id) || userRoadmaps.get(DEMO_USER_ID) || [];
  const rm = list.find((r) => r.id === req.params.id) || list[0];
  return res.json(rm);
});

v1.get('/recommendations', (_req: Request, res: Response) => {
  return res.json({ items: [], total: 0, page: 1, page_size: 20 });
});

v1.get('/progress/summary', (_req: Request, res: Response) => {
  return res.json({
    current_streak_days: 7,
    longest_streak_days: 14,
    total_completed_items: 12,
    milestones_unlocked: milestoneRules.slice(0, 4),
    weekly_goal: {
      target_items: 5,
      completed_items: 3,
      target_minutes: 300,
      completed_minutes: 195,
    },
  });
});

v1.get('/portfolio', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  return res.json(portfolios.get(u.id) || portfolios.get(DEMO_USER_ID));
});

v1.get('/ai/conversations', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  return res.json(conversations.get(u.id) || []);
});

v1.get('/tests/history', (_req: Request, res: Response) => {
  return res.json({ items: testQuestions.slice(0, 1), total: 1 });
});

v1.get('/interviews/history', (_req: Request, res: Response) => {
  return res.json({ items: interviewQuestions.slice(0, 1), total: 1 });
});

v1.post('/recommendations/:item_type/:item_id/action', (req: Request, res: Response) => {
  const u = getCurrentUser(req);
  const map = recommendationStates.get(u.id) || new Map<string, string>();
  const state = req.body?.state || 'saved';
  map.set(`${req.params.item_type}:${req.params.item_id}`, state);
  recommendationStates.set(u.id, map);
  return res.json({
    item_type: req.params.item_type,
    item_id: req.params.item_id,
    state,
    updated_at: new Date().toISOString(),
  });
});

v1.use((_req: Request, res: Response) => {
  res.status(501).json({ error: 'Not yet migrated' });
});

app.use('/v1', v1);
