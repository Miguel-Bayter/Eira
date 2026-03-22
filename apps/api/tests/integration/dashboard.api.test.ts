import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  usersFindUnique: vi.fn(),
  moodCount: vi.fn(),
  moodFindMany: vi.fn(),
  aiAnalyze: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getUser: mocks.getUser },
  }),
}));

vi.mock('@prisma/client', () => {
  const PrismaClient = vi.fn().mockImplementation(() => ({
    users: {
      findUnique: mocks.usersFindUnique,
      upsert: vi.fn().mockResolvedValue({}),
    },
    mood_entries: {
      create: vi.fn().mockResolvedValue({}),
      count: mocks.moodCount,
      findMany: mocks.moodFindMany,
    },
  }));
  return { PrismaClient };
});

vi.mock('../../src/infrastructure/ai/GeminiAiAdapter', () => ({
  GeminiAiAdapter: vi.fn().mockImplementation(() => ({
    analyze: mocks.aiAnalyze,
    chat: vi.fn(),
    moderate: vi.fn().mockResolvedValue({ isApproved: true }),
  })),
}));

vi.mock('../../src/infrastructure/ai/GroqAiAdapter', () => ({
  GroqAiAdapter: vi.fn().mockImplementation(() => ({
    analyze: mocks.aiAnalyze,
    chat: vi.fn(),
    moderate: vi.fn().mockResolvedValue({ isApproved: true }),
  })),
}));

vi.mock('../../src/infrastructure/ai/MultiProviderAiService', () => ({
  MultiProviderAiService: vi.fn().mockImplementation(() => ({
    analyze: mocks.aiAnalyze,
    chat: vi.fn(),
    moderate: vi.fn().mockResolvedValue({ isApproved: true }),
  })),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockPrismaUser = {
  id: 'user-test-id',
  supabase_id: 'supabase-test-id',
  email: 'test@example.com',
  name: 'Test User',
  wellness_score: 65,
  streak_days: 3,
  last_mood_date: null,
  created_at: new Date(),
  updated_at: new Date(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Dashboard API — Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: valid authentication
    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'supabase-test-id',
          email: 'test@example.com',
          user_metadata: { name: 'Test User' },
        },
      },
      error: null,
    });

    // Default: user found in DB
    mocks.usersFindUnique.mockResolvedValue(mockPrismaUser);

    // Default: no mood entries today
    mocks.moodCount.mockResolvedValue(0);

    // Default: empty mood history
    mocks.moodFindMany.mockResolvedValue([]);

    // Default: AI returns a plan
    mocks.aiAnalyze.mockResolvedValue('Weekly wellness plan: rest, walk, journal.');
  });

  describe('Authentication', () => {
    it('GET /api/dashboard without Authorization header → 401', async () => {
      const res = await request(app).get('/api/dashboard');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Successful response', () => {
    it('GET /api/dashboard with valid auth → 200 with correct shape', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        wellnessScore: expect.any(Number),
        streakDays: expect.any(Number),
        todayMoodCount: expect.any(Number),
        moodHeatmap: expect.any(Array),
        moodTrend: expect.any(Array),
      });
      expect('weeklyPlan' in res.body).toBe(true);
    });

    it('GET /api/dashboard → moodHeatmap array has exactly 364 items', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.moodHeatmap).toHaveLength(364);
    });

    it('GET /api/dashboard → moodHeatmap items have date and score fields', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      const firstItem = res.body.moodHeatmap[0] as { date: string; score: number | null };
      expect(firstItem).toHaveProperty('date');
      expect(firstItem).toHaveProperty('score');
    });

    it('GET /api/dashboard → weeklyPlan is null when no mood data', async () => {
      mocks.moodFindMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.weeklyPlan).toBeNull();
    });
  });
});
