import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// In-memory Redis mock
const redisMap = new Map<string, any>();
export const redis = {
  get: async (k: string) => redisMap.get(k) ?? null,
  set: async (k: string, v: any) => {
    redisMap.set(k, v);
    return 'OK';
  },
  del: async (k: string) => redisMap.delete(k),
  incr: async (k: string) => {
    const n = (Number(redisMap.get(k)) || 0) + 1;
    redisMap.set(k, n);
    return n;
  },
  ping: async () => true,
};

function loadJson(filename: string, fallback: any = {}) {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.warn(`[AI Studio] Could not load seed file ${filename}:`, err);
  }
  return fallback;
}

const rawCareers = loadJson('careers.json', []);
const rawCatalog = loadJson('career_catalog.json', { exams: [], colleges: [], profiles: [] });
const rawAssessment = loadJson('assessment_questions.json', { questions: [] });
const rawSkills = loadJson('skills_catalog.json', { skills: [] });
const rawRoadmaps = loadJson('roadmap_templates.json', { templates: [] });
const rawInterviews = loadJson('interview_questions.json', { questions: [] });
const rawTests = loadJson('test_questions.json', { questions: [] });
const rawMilestones = loadJson('milestone_rules.json', { rules: [] });

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  education_level: 'class_11_12' | 'college';
  is_active: boolean;
  created_at: string;
}

export const users = new Map<string, UserRecord>();
export const profiles = new Map<string, any>();
export const shortlists = new Map<string, Set<string>>();
export const userSkills = new Map<string, any[]>();
export const userRoadmaps = new Map<string, any[]>();
export const assessmentAttempts = new Map<string, any>();
export const assessmentResults = new Map<string, any[]>();
export const portfolios = new Map<string, any>();
export const conversations = new Map<string, any[]>();
export const recommendationStates = new Map<string, Map<string, string>>();

// Build unified Career list from seed files
export const careers: any[] = (Array.isArray(rawCareers) ? rawCareers : []).map((c: any, idx: number) => {
  const id = `00000000-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`;
  const catalogProfile = (rawCatalog.profiles || []).find((p: any) => p.career_code === c.code) || {};
  return {
    id,
    code: c.code,
    title: c.title,
    cluster: c.cluster,
    overview: c.overview,
    status: 'verified',
    source_url: c.source_url,
    dimension_weights: c.dimension_weights || { R: 50, I: 80, A: 40, S: 40, E: 50, C: 60 },
    salary_min_inr: catalogProfile.salary_band?.entry_min_inr || 600000,
    salary_max_inr: catalogProfile.salary_band?.senior_max_inr || 2800000,
    industry_demand: catalogProfile.market_outlook?.demand_level || 'very_high',
    growth_summary: catalogProfile.market_outlook?.summary || 'High growth trajectory across enterprise and product teams.',
    required_skills: catalogProfile.required_skills || [
      { name: 'Python', level: 'advanced' },
      { name: 'Data Structures & Algorithms', level: 'intermediate' },
      { name: 'SQL & Databases', level: 'intermediate' },
      { name: 'System Design', level: 'beginner' },
    ],
    education_paths: catalogProfile.education_paths || [
      {
        stage: 'Undergraduate',
        stream: 'Computer Science / Engineering',
        degree: 'B.Tech / B.E. / B.Sc.',
        description: 'Core engineering and computational foundations.',
      },
    ],
    exams: (rawCatalog.exams || []).slice(0, 3),
    colleges: (rawCatalog.colleges || []).slice(0, 3),
    certificates: catalogProfile.certificates || [],
    internships: catalogProfile.internships || [],
  };
});

if (!careers.some((c) => c.code === 'SWE')) {
  careers.unshift({
    id: '00000000-0000-0000-0000-000000000099',
    code: 'SWE',
    title: 'Software Development Engineer',
    cluster: 'Information Technology',
    overview: 'Designs, implements, and maintains scalable software applications, backend services, and distributed systems.',
    status: 'verified',
    source_url: 'https://www.onetonline.org/link/summary/15-1252.00',
    dimension_weights: { R: 70, I: 90, A: 50, S: 30, E: 40, C: 75 },
    salary_min_inr: 800000,
    salary_max_inr: 3500000,
    industry_demand: 'very_high',
    growth_summary: 'Strong demand across product companies, SaaS startups, and R&D centers.',
    required_skills: [
      { name: 'Data Structures & Algorithms', level: 'advanced' },
      { name: 'Python', level: 'advanced' },
      { name: 'SQL & Databases', level: 'intermediate' },
      { name: 'System Design', level: 'intermediate' },
    ],
    education_paths: [],
    exams: (rawCatalog.exams || []).slice(0, 3),
    colleges: (rawCatalog.colleges || []).slice(0, 3),
    certificates: [],
    internships: [],
  });
}

export const skillsCatalog: any[] = rawSkills.skills || [];
export const assessmentQuestions: any[] = (rawAssessment.questions || []).map((q: any) => ({
  id: `00000000-0000-0000-0001-${String(q.order).padStart(12, '0')}`,
  order: q.order,
  text: q.text,
  dimension: q.dimension,
  reverse_scored: q.reverse_scored,
}));
export const roadmapTemplates: any[] = rawRoadmaps.templates || [];
export const interviewQuestions: any[] = rawInterviews.questions || [];
export const testQuestions: any[] = rawTests.questions || [];
export const milestoneRules: any[] = rawMilestones.rules || [];

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
const demoUser: UserRecord = {
  id: DEMO_USER_ID,
  email: 'demo@career-navigator.io',
  passwordHash: bcrypt.hashSync('DemoAccount@2026!', 10),
  role: 'student',
  education_level: 'college',
  is_active: true,
  created_at: new Date().toISOString(),
};
users.set(DEMO_USER_ID, demoUser);

profiles.set(DEMO_USER_ID, {
  user_id: DEMO_USER_ID,
  full_name: 'Alex Chen',
  education_level: 'college',
  year: 'B.Tech 3rd Year',
  grade_level: 'B.Tech 3rd Year',
  budget_level: 'medium',
  hours_per_day: 2.5,
  hours_per_week: 15,
  location: 'Bengaluru, India',
  timezone: 'Asia/Kolkata',
  subjects_of_interest: ['Computer Science', 'Mathematics', 'Data Systems'],
  hobbies: ['Competitive Programming', 'Open Source', 'Chess'],
  past_work: 'Backend Engineering Summer Intern at University Systems Lab',
  projects: [
    {
      title: 'Distributed Task Queue & Rate Limiter',
      description: 'Built an async worker pipeline with sliding-window rate limiting and deterministic retry fallbacks.',
      link: 'https://github.com/alex-chen/task-engine',
    },
  ],
  competitions: [
    {
      title: 'Smart India Hackathon',
      outcome: 'National Finalist',
      year: '2026',
    },
  ],
  records: [
    {
      title: 'NPTEL Data Structures & Algorithms Certificate',
      url: 'https://swayam.gov.in/explorer',
      category: 'Certification',
    },
  ],
  declared_skills: ['Python', 'Data Structures & Algorithms', 'SQL & Databases'],
  target_career_id: careers[0]?.id,
  updated_at: new Date().toISOString(),
});

shortlists.set(DEMO_USER_ID, new Set([careers[0]?.id, careers[1]?.id].filter(Boolean)));

userSkills.set(DEMO_USER_ID, [
  {
    skill_id: '00000000-0000-0000-0000-000000000101',
    slug: 'dsa',
    name: 'Data Structures & Algorithms',
    category: 'Computer Science',
    level: 'intermediate',
    confidence_score: 0.78,
    verified_source: 'adaptive_test',
    updated_at: new Date().toISOString(),
  },
  {
    skill_id: '00000000-0000-0000-0000-000000000102',
    slug: 'python',
    name: 'Python',
    category: 'Programming',
    level: 'advanced',
    confidence_score: 0.88,
    verified_source: 'roadmap_milestone',
    updated_at: new Date().toISOString(),
  },
]);

const sweTemplate = roadmapTemplates[0] || {
  career_code: 'SWE',
  title: 'Software Development Engineer (SDE) Accelerated Roadmap',
  description: 'Comprehensive engineering roadmap spanning core DSA topics, backend systems, portfolio capstones, and industry outreach.',
  phases: [],
  items: [],
};

const demoRoadmap = {
  id: '00000000-0000-0000-0000-000000000501',
  user_id: DEMO_USER_ID,
  career_id: careers[0]?.id,
  career_code: sweTemplate.career_code,
  title: sweTemplate.title,
  description: sweTemplate.description,
  hours_per_week: 15,
  status: 'active',
  completion_percentage: 35,
  created_at: new Date().toISOString(),
  phases: (sweTemplate.phases || []).map((p: any) => ({
    phase_order: p.phase_order,
    name: p.name,
    description: p.description,
    items: (sweTemplate.items || [])
      .filter((item: any) => item.phase_order === p.phase_order)
      .map((item: any, i: number) => ({
        id: `00000000-0000-0000-0005-${String(p.phase_order * 100 + i + 1).padStart(12, '0')}`,
        item_code: item.item_code,
        type: item.type,
        title: item.title,
        source_url: item.source_url,
        estimated_minutes: item.estimated_minutes,
        difficulty: item.difficulty,
        topic: item.topic,
        skill_slug: item.skill_slug,
        status: p.phase_order === 1 && i < 2 ? 'completed' : p.phase_order === 1 && i === 2 ? 'in_progress' : 'pending',
      })),
  })),
};
userRoadmaps.set(DEMO_USER_ID, [demoRoadmap]);

const defaultAnswers: Record<string, number> = {};
assessmentQuestions.forEach((q, idx) => {
  defaultAnswers[q.id] = (idx % 3) + 3; // 3, 4, 5
});
assessmentAttempts.set(DEMO_USER_ID, {
  id: '00000000-0000-0000-0000-000000000201',
  user_id: DEMO_USER_ID,
  status: 'draft',
  answers: defaultAnswers,
  updated_at: new Date().toISOString(),
});

assessmentResults.set(DEMO_USER_ID, [
  {
    id: '00000000-0000-0000-0000-000000000302',
    user_id: DEMO_USER_ID,
    version: 2,
    education_level: 'college',
    holland_code: 'IRC',
    holland_label: 'Investigative · Realistic · Conventional (Analytical Systems Builder)',
    traits: [
      'Analytical problem decomposition',
      'Systematic hypothesis testing',
      'Structured engineering execution',
    ],
    skills: [
      'Data Structures & Algorithms',
      'Python & Backend Systems',
      'Statistical Modeling & SQL',
    ],
    dimension_scores: {
      Investigative: 92,
      Conventional: 78,
      Realistic: 68,
      Enterprising: 52,
      Artistic: 48,
      Social: 38,
    },
    explanation:
      'Your Investigative-Realistic-Conventional (IRC) profile highlights strong analytical problem-solving, systems thinking, and structured engineering execution.',
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
        reason: 'Matches your high Conventional (78%) and Investigative (92%) scores for quantitative analysis.',
      },
    ],
    recommended_careers: careers.slice(0, 3).map((c, idx) => ({
      career_id: c.id,
      code: c.code,
      title: c.title,
      cluster: c.cluster,
      match_score: 94 - idx * 4,
      reason: `Strong alignment with your ${idx === 0 ? 'Investigative (92%) and Realistic (68%)' : 'Investigative (92%) and Conventional (78%)'} dimensions and technical skill profile.`,
    })),
    qa_thread: [
      {
        id: 'qa-1',
        question: 'Why does Software Development Engineer fit my IRC profile?',
        answer:
          'Software Development Engineer rewards Investigative root-cause debugging (92%), Realistic system building (68%), and Conventional code quality standards (78%).',
        ai_status: 'ready',
        created_at: '2026-10-23T10:00:00Z',
      },
    ],
    chosen_career_id: careers[0]?.id || null,
    created_at: '2026-10-23T09:30:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000301',
    user_id: DEMO_USER_ID,
    version: 1,
    education_level: 'class_11_12',
    holland_code: 'ICR',
    holland_label: 'Investigative · Conventional · Realistic (Quantitative Analyst)',
    traits: ['Data-driven reasoning', 'Structured organization', 'Practical experimentation'],
    skills: ['Quantitative Aptitude', 'Logical Reasoning', 'Python'],
    dimension_scores: {
      Investigative: 88,
      Conventional: 82,
      Realistic: 64,
      Enterprising: 48,
      Artistic: 44,
      Social: 40,
    },
    explanation:
      'Attempt v1 captured during Class 12 exploration: strong preference for structured mathematical and computational domains.',
    ai_status: 'ready',
    recommended_streams: [
      {
        stream_name: 'Science (PCM with Computer Science)',
        subjects: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
        reason: 'Opens undergraduate pathways into B.Tech CS, Data Science, and Quantitative Engineering.',
      },
    ],
    recommended_careers: careers.slice(0, 3).map((c, idx) => ({
      career_id: c.id,
      code: c.code,
      title: c.title,
      cluster: c.cluster,
      match_score: 90 - idx * 5,
      reason: 'Aligned with your quantitative and structured reasoning strengths.',
    })),
    qa_thread: [],
    chosen_career_id: null,
    created_at: '2026-09-15T09:00:00Z',
  },
]);

portfolios.set(DEMO_USER_ID, {
  id: '00000000-0000-0000-0000-000000000701',
  user_id: DEMO_USER_ID,
  slug: 'alex-chen',
  is_public: true,
  is_persisted: true,
  headline: 'Aspiring Software Systems & ML Engineer | B.Tech CS',
  summary_statement:
    'Computer Science undergraduate focused on distributed backend systems, algorithmic problem solving, and applied machine learning.',
  projects: [
    {
      title: 'Distributed Task Queue & Rate Limiter',
      description: 'Built an async worker pipeline with sliding-window rate limiting and deterministic retry fallbacks.',
      skills_used: ['Python', 'Data Structures & Algorithms', 'System Design'],
      artifact_url: 'https://github.com/alex-chen/task-engine',
    },
  ],
  updated_at: new Date().toISOString(),
});
