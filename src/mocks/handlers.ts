import { http, HttpResponse } from 'msw';

let refreshCallCount = 0;
export function getRefreshCallCount() {
  return refreshCallCount;
}
export function resetRefreshCallCount() {
  refreshCallCount = 0;
}

export const mock30Questions = Array.from({ length: 30 }).map((_, idx) => {
  const dimensions = ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'];
  const order = idx + 1;
  return {
    id: `00000000-0000-0000-0001-${String(order).padStart(12, '0')}`,
    order,
    text: `Question ${order}: I enjoy analytical and practical problem-solving activity #${order}.`,
    dimension: dimensions[Math.floor(idx / 5)],
    reverse_scored: order % 5 === 0,
  };
});

export let mockDraftAnswers: Record<string, number> = {};
export function resetMockDraftAnswers() {
  mockDraftAnswers = {};
  mock30Questions.forEach((q, i) => {
    if (i < 28) {
      mockDraftAnswers[q.id] = 4;
    }
  });
}
resetMockDraftAnswers();

export const handlers = [
  http.get('*/health', () => {
    return HttpResponse.json({ status: 'ok', environment: 'test' });
  }),

  http.get('*/v1/auth/me', () => {
    return HttpResponse.json({
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo@career-navigator.io',
      role: 'student',
      education_level: 'college',
      is_active: true,
      created_at: '2026-10-23T00:00:00Z',
    });
  }),

  http.post('*/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as any;
    if (body?.email === 'invalid@example.com') {
      return HttpResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } },
        { status: 401 }
      );
    }
    return HttpResponse.json({
      access_token: 'mock-access-token-1',
      refresh_token: 'mock-refresh-token-1',
      token_type: 'bearer',
      expires_in: 900,
    });
  }),

  http.post('*/v1/auth/signup', async ({ request }) => {
    const body = (await request.json()) as any;
    if (body?.email === 'taken@example.com') {
      return HttpResponse.json(
        { error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } },
        { status: 409 }
      );
    }
    return HttpResponse.json(
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: body?.email || 'student@example.edu.in',
        role: 'student',
        education_level: body?.education_level || 'college',
        is_active: true,
        created_at: '2026-10-23T00:00:00Z',
      },
      { status: 201 }
    );
  }),

  http.post('*/v1/auth/refresh', async () => {
    refreshCallCount += 1;
    await new Promise((r) => setTimeout(r, 25));
    return HttpResponse.json({
      access_token: `rotated-access-token-${refreshCallCount}`,
      refresh_token: `rotated-refresh-token-${refreshCallCount}`,
      token_type: 'bearer',
      expires_in: 900,
    });
  }),

  http.post('*/v1/auth/logout', () => {
    return HttpResponse.json({ message: 'Successfully logged out.' });
  }),

  http.post('*/v1/auth/logout-all', () => {
    return HttpResponse.json({ message: 'All active sessions have been terminated.' });
  }),

  http.post('*/v1/auth/change-password', () => {
    return HttpResponse.json({ message: 'Password changed successfully.' });
  }),

  http.post('*/v1/auth/forgot-password', () => {
    return HttpResponse.json({
      message: 'If an account exists with that email address, password reset instructions have been sent.',
    });
  }),

  http.post('*/v1/auth/reset-password', () => {
    return HttpResponse.json({
      message: 'Password has been successfully reset.',
    });
  }),

  http.get('*/v1/profile', () => {
    return HttpResponse.json({
      user_id: '00000000-0000-0000-0000-000000000001',
      full_name: 'Alex Chen',
      education_level: 'college',
      year: 'B.Tech 3rd Year',
      grade_level: 'B.Tech 3rd Year',
      budget_level: 'medium',
      hours_per_day: 2.5,
      hours_per_week: 15,
      location: 'Bengaluru, India',
      timezone: 'Asia/Kolkata',
      subjects_of_interest: ['Computer Science', 'Mathematics'],
      hobbies: ['Competitive Programming', 'Chess'],
      past_work: 'Backend Engineering Intern',
      projects: [
        {
          title: 'Distributed Task Queue',
          description: 'Async worker queue with sliding window rate limiter.',
          link: 'https://github.com/alex-chen/task-engine',
        },
      ],
      competitions: [
        {
          title: 'Smart India Hackathon',
          outcome: 'Finalist',
          year: '2026',
        },
      ],
      records: [
        {
          title: 'NPTEL DSA Certificate',
          url: 'https://swayam.gov.in/explorer',
          category: 'Certificate',
        },
      ],
      declared_skills: ['Python', 'Data Structures & Algorithms'],
      target_career_id: '00000000-0000-0000-0000-000000000099',
      updated_at: '2026-10-23T00:00:00Z',
    });
  }),

  http.put('*/v1/profile', async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({
      user_id: '00000000-0000-0000-0000-000000000001',
      full_name: body?.full_name || 'Alex Chen',
      education_level: body?.education_level || 'college',
      year: body?.year || 'B.Tech 3rd Year',
      grade_level: body?.year || 'B.Tech 3rd Year',
      budget_level: body?.budget_level || 'medium',
      hours_per_day: body?.hours_per_day ?? 2.5,
      hours_per_week: body?.hours_per_week ?? 15,
      location: body?.location || 'Bengaluru, India',
      timezone: body?.timezone || 'Asia/Kolkata',
      subjects_of_interest: body?.subjects_of_interest || [],
      hobbies: body?.hobbies || [],
      past_work: body?.past_work || '',
      projects: body?.projects || [],
      competitions: body?.competitions || [],
      records: body?.records || [],
      declared_skills: body?.declared_skills || [],
      updated_at: new Date().toISOString(),
    });
  }),

  http.get('*/v1/assessment/questions', () => {
    return HttpResponse.json({
      version_number: 1,
      title: 'Comprehensive RIASEC Career Interest Inventory',
      description: '30-item RIASEC assessment.',
      scale: {
        1: 'Strongly Disagree',
        2: 'Disagree',
        3: 'Neutral',
        4: 'Agree',
        5: 'Strongly Agree',
      },
      questions: mock30Questions,
    });
  }),

  http.get('*/v1/assessment/attempt', () => {
    return HttpResponse.json({
      id: 'attempt-1',
      user_id: '00000000-0000-0000-0000-000000000001',
      status: 'draft',
      answers: mockDraftAnswers,
      updated_at: '2026-10-23T00:00:00Z',
    });
  }),

  http.post('*/v1/assessment/answers', async ({ request }) => {
    const body = (await request.json()) as any;
    mockDraftAnswers = { ...mockDraftAnswers, ...(body?.answers || {}) };
    return HttpResponse.json({
      id: 'attempt-1',
      user_id: '00000000-0000-0000-0000-000000000001',
      status: 'draft',
      answers: mockDraftAnswers,
      updated_at: new Date().toISOString(),
    });
  }),

  http.put('*/v1/assessment/answers', async ({ request }) => {
    const body = (await request.json()) as any;
    mockDraftAnswers = { ...mockDraftAnswers, ...(body?.answers || {}) };
    return HttpResponse.json({
      id: 'attempt-1',
      user_id: '00000000-0000-0000-0000-000000000001',
      status: 'draft',
      answers: mockDraftAnswers,
      updated_at: new Date().toISOString(),
    });
  }),

  http.post('*/v1/assessment/submit', () => {
    const missing = mock30Questions
      .map((q) => q.id)
      .filter((id) => mockDraftAnswers[id] === undefined);

    if (missing.length > 0) {
      return HttpResponse.json(
        {
          error: {
            code: 'MISSING_ANSWERS',
            message: `Missing ${missing.length} answers`,
            fields: {
              missing_question_ids: missing.join(','),
            },
          },
        },
        { status: 422 }
      );
    }

    return HttpResponse.json({
      id: 'result-v2',
      user_id: '00000000-0000-0000-0000-000000000001',
      version: 2,
      education_level: 'college',
      holland_code: 'IRC',
      holland_label: 'Investigative · Realistic · Conventional',
      traits: ['Analytical problem decomposition', 'Structured execution'],
      skills: ['Data Structures & Algorithms', 'Python'],
      dimension_scores: {
        Investigative: 92,
        Conventional: 78,
        Realistic: 68,
        Enterprising: 52,
        Artistic: 48,
        Social: 38,
      },
      explanation: 'Your IRC profile highlights analytical systems thinking.',
      ai_status: 'ready',
      recommended_streams: [
        {
          stream_name: 'Science (PCM with Computer Science)',
          subjects: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
          reason: 'Core foundation for engineering and computer science.',
        },
      ],
      recommended_careers: [
        {
          career_id: '00000000-0000-0000-0000-000000000099',
          code: 'SWE',
          title: 'Software Development Engineer',
          cluster: 'Information Technology',
          match_score: 94,
          reason: 'Matches your Investigative (92%) and Realistic (68%) scores.',
        },
        {
          career_id: '00000000-0000-0000-0000-000000000001',
          code: 'DATA_SCIENTIST',
          title: 'Data Scientist & Machine Learning Engineer',
          cluster: 'Information Technology',
          match_score: 89,
          reason: 'Matches your Investigative (92%) and Conventional (78%) scores.',
        },
        {
          career_id: '00000000-0000-0000-0000-000000000002',
          code: 'SOFTWARE_ARCHITECT',
          title: 'Software Systems Architect',
          cluster: 'Information Technology',
          match_score: 85,
          reason: 'Matches your systems architecture and structured design preferences.',
        },
      ],
      qa_thread: [],
      chosen_career_id: null,
      created_at: '2026-10-23T10:00:00Z',
    });
  }),

  http.get('*/v1/assessment/results/latest', () => {
    return HttpResponse.json({
      id: 'result-v2',
      user_id: '00000000-0000-0000-0000-000000000001',
      version: 2,
      education_level: 'college',
      holland_code: 'IRC',
      holland_label: 'Investigative · Realistic · Conventional',
      traits: ['Analytical problem decomposition', 'Structured execution'],
      skills: ['Data Structures & Algorithms', 'Python'],
      dimension_scores: {
        Investigative: 92,
        Conventional: 78,
        Realistic: 68,
        Enterprising: 52,
        Artistic: 48,
        Social: 38,
      },
      explanation: 'Your IRC profile highlights analytical systems thinking.',
      ai_status: 'ready',
      recommended_streams: [
        {
          stream_name: 'Science (PCM with Computer Science)',
          subjects: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
          reason: 'Core foundation for engineering and computer science.',
        },
      ],
      recommended_careers: [
        {
          career_id: '00000000-0000-0000-0000-000000000099',
          code: 'SWE',
          title: 'Software Development Engineer',
          cluster: 'Information Technology',
          match_score: 94,
          reason: 'Matches your Investigative (92%) and Realistic (68%) scores.',
        },
        {
          career_id: '00000000-0000-0000-0000-000000000001',
          code: 'DATA_SCIENTIST',
          title: 'Data Scientist & Machine Learning Engineer',
          cluster: 'Information Technology',
          match_score: 89,
          reason: 'Matches your Investigative (92%) and Conventional (78%) scores.',
        },
        {
          career_id: '00000000-0000-0000-0000-000000000002',
          code: 'SOFTWARE_ARCHITECT',
          title: 'Software Systems Architect',
          cluster: 'Information Technology',
          match_score: 85,
          reason: 'Matches your systems architecture and structured design preferences.',
        },
      ],
      qa_thread: [],
      chosen_career_id: null,
      created_at: '2026-10-23T10:00:00Z',
    });
  }),

  http.get('*/v1/assessment/results', () => {
    return HttpResponse.json([
      {
        id: 'result-v2',
        user_id: '00000000-0000-0000-0000-000000000001',
        version: 2,
        education_level: 'college',
        holland_code: 'IRC',
        holland_label: 'Investigative · Realistic · Conventional',
        traits: ['Analytical problem decomposition', 'Structured execution'],
        skills: ['Data Structures & Algorithms', 'Python'],
        dimension_scores: {
          Investigative: 92,
          Conventional: 78,
          Realistic: 68,
          Enterprising: 52,
          Artistic: 48,
          Social: 38,
        },
        explanation: 'Your IRC profile highlights analytical systems thinking.',
        ai_status: 'ready',
        recommended_streams: [
          {
            stream_name: 'Science (PCM with Computer Science)',
            subjects: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
            reason: 'Core foundation for engineering and computer science.',
          },
        ],
        recommended_careers: [
          {
            career_id: '00000000-0000-0000-0000-000000000099',
            code: 'SWE',
            title: 'Software Development Engineer',
            cluster: 'Information Technology',
            match_score: 94,
            reason: 'Matches your Investigative (92%) and Realistic (68%) scores.',
          },
          {
            career_id: '00000000-0000-0000-0000-000000000001',
            code: 'DATA_SCIENTIST',
            title: 'Data Scientist & Machine Learning Engineer',
            cluster: 'Information Technology',
            match_score: 89,
            reason: 'Matches your Investigative (92%) and Conventional (78%) scores.',
          },
          {
            career_id: '00000000-0000-0000-0000-000000000002',
            code: 'SOFTWARE_ARCHITECT',
            title: 'Software Systems Architect',
            cluster: 'Information Technology',
            match_score: 85,
            reason: 'Matches your systems architecture and structured design preferences.',
          },
        ],
        qa_thread: [],
        chosen_career_id: null,
        created_at: '2026-10-23T10:00:00Z',
      },
      {
        id: 'result-v1',
        user_id: '00000000-0000-0000-0000-000000000001',
        version: 1,
        education_level: 'class_11_12',
        holland_code: 'ICR',
        holland_label: 'Investigative · Conventional · Realistic (Class 11–12 Baseline)',
        traits: ['Quantitative reasoning', 'Structured study habits'],
        skills: ['Mathematics', 'Python'],
        dimension_scores: {
          Investigative: 88,
          Conventional: 82,
          Realistic: 64,
          Enterprising: 48,
          Artistic: 44,
          Social: 40,
        },
        explanation: 'Class 12 baseline profile prioritizing PCM + Computer Science.',
        ai_status: 'fallback',
        recommended_streams: [
          {
            stream_name: 'Science (PCM with Computer Science)',
            subjects: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
            reason: 'Direct pathway into engineering and computational sciences.',
          },
        ],
        recommended_careers: [
          {
            career_id: '00000000-0000-0000-0000-000000000001',
            code: 'DATA_SCIENTIST',
            title: 'Data Scientist & Machine Learning Engineer',
            cluster: 'Information Technology',
            match_score: 91,
            reason: 'Strong quantitative fit.',
          },
          {
            career_id: '00000000-0000-0000-0000-000000000099',
            code: 'SWE',
            title: 'Software Development Engineer',
            cluster: 'Information Technology',
            match_score: 88,
            reason: 'Strong algorithmic fit.',
          },
          {
            career_id: '00000000-0000-0000-0000-000000000006',
            code: 'FINANCIAL_QUANT_ANALYST',
            title: 'Quantitative Financial Analyst',
            cluster: 'Finance & Banking',
            match_score: 84,
            reason: 'Strong mathematical modeling fit.',
          },
        ],
        qa_thread: [],
        chosen_career_id: null,
        created_at: '2026-09-15T09:00:00Z',
      },
    ]);
  }),

  http.post('*/v1/assessment/results/:result_id/ask', async ({ params, request }) => {
    const body = (await request.json()) as any;
    const question = String(body?.question || '');
    if (question.toLowerCase().includes('cricket') || question.toLowerCase().includes('movie')) {
      return HttpResponse.json({
        id: 'qa-oos',
        result_id: String(params.result_id),
        question,
        answer: 'Out of scope question.',
        ai_status: 'out_of_scope',
        created_at: new Date().toISOString(),
      });
    }
    if (question.toLowerCase().includes('fallback')) {
      return HttpResponse.json({
        id: 'qa-fb',
        result_id: String(params.result_id),
        question,
        answer: 'Standard deterministic answer about your Holland code.',
        ai_status: 'fallback',
        created_at: new Date().toISOString(),
      });
    }
    return HttpResponse.json({
      id: 'qa-ok',
      result_id: String(params.result_id),
      question,
      answer: 'Your Investigative score (92%) strongly supports analytical engineering roles.',
      ai_status: 'ready',
      created_at: new Date().toISOString(),
    });
  }),

  http.post('*/v1/assessment/results/:result_id/choose', async ({ params, request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({
      result_id: String(params.result_id),
      chosen_career_id: body?.career_id || '00000000-0000-0000-0000-000000000099',
      status: 'target_updated',
    });
  }),

  http.get('*/v1/careers', ({ request }) => {
    const url = new URL(request.url);
    const cluster = url.searchParams.get('cluster');
    const items = [
      {
        id: '00000000-0000-0000-0000-000000000099',
        code: 'SWE',
        title: 'Software Development Engineer',
        cluster: 'Information Technology',
        overview: 'Designs, implements, and maintains scalable software applications and distributed systems.',
        status: 'verified',
        compatibility_score: 94,
        salary_min_inr: 800000,
        salary_max_inr: 3500000,
        industry_demand: 'very_high',
        last_verified_at: '2026-10-15',
      },
      {
        id: '00000000-0000-0000-0000-000000000001',
        code: 'DATA_SCIENTIST',
        title: 'Data Scientist & Machine Learning Engineer',
        cluster: 'Information Technology',
        overview: 'Applies statistical modeling and machine learning algorithms to build predictive systems.',
        status: 'verified',
        compatibility_score: 89,
        salary_min_inr: 700000,
        salary_max_inr: 3200000,
        industry_demand: 'very_high',
        last_verified_at: '2026-10-15',
      },
    ];
    const filtered = cluster ? items.filter((i) => i.cluster === cluster) : items;
    return HttpResponse.json({
      items: filtered,
      total: filtered.length,
      page: 1,
      page_size: 20,
    });
  }),
];
