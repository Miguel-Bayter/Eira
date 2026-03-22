import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────
// vi.hoisted() ensures these function references are available inside vi.mock()
// factories, which are hoisted to the top of the file by Vitest.

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  usersFindUnique: vi.fn(),
  usersUpsert: vi.fn(),
  moodCount: vi.fn(),
  moodCreate: vi.fn(),
  moodFindMany: vi.fn(),
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
      upsert: mocks.usersUpsert,
    },
    mood_entries: {
      create: mocks.moodCreate,
      count: mocks.moodCount,
      findMany: mocks.moodFindMany,
    },
  }));
  return { PrismaClient };
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockPrismaUser = {
  id: 'user-test-id',
  supabase_id: 'supabase-test-id',
  email: 'test@example.com',
  name: 'Test User',
  wellness_score: 50,
  streak_days: 0,
  last_mood_date: null,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockPrismaMoodEntry = {
  id: 'mood-1',
  user_id: 'user-test-id',
  score: 5,
  emotion: 'tranquilo',
  note: null,
  is_crisis: false,
  created_at: new Date(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Mood API — Integration Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: valid authentication
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'supabase-test-id', email: 'test@example.com', user_metadata: { name: 'Test User' } } },
      error: null,
    });

    // Default: user found in DB
    mocks.usersFindUnique.mockResolvedValue(mockPrismaUser);

    // Default: no entries today
    mocks.moodCount.mockResolvedValue(0);

    // Default: mood create succeeds
    mocks.moodCreate.mockResolvedValue(mockPrismaMoodEntry);

    // Default: user upsert succeeds
    mocks.usersUpsert.mockResolvedValue({});

    // Default: empty history
    mocks.moodFindMany.mockResolvedValue([]);
  });

  // ─── Authentication ─────────────────────────────────────────────────────────

  describe('Authentication', () => {
    it('POST /api/mood without Authorization header → 401', async () => {
      const res = await request(app)
        .post('/api/mood')
        .send({ score: 5, emotion: 'tranquilo' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/mood with invalid Bearer token (Supabase returns error) → 401', async () => {
      mocks.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'invalid token' },
      });

      const res = await request(app)
        .post('/api/mood')
        .set('Authorization', 'Bearer invalid-token')
        .send({ score: 5, emotion: 'tranquilo' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/mood without Authorization header → 401', async () => {
      const res = await request(app).get('/api/mood');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // ─── Zod Validation ─────────────────────────────────────────────────────────

  describe('Zod validation (schema enforcement)', () => {
    it('POST /api/mood with score=0 (below min) → 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/mood')
        .set('Authorization', 'Bearer valid-token')
        .send({ score: 0, emotion: 'tranquilo' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/mood with emotion="feliz" (not in enum) → 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/mood')
        .set('Authorization', 'Bearer valid-token')
        .send({ score: 5, emotion: 'feliz' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ─── Successful requests ─────────────────────────────────────────────────────

  describe('Successful mood submission', () => {
    it('POST /api/mood valid request (score=5, emotion="tranquilo") → 201 with expected shape', async () => {
      const res = await request(app)
        .post('/api/mood')
        .set('Authorization', 'Bearer valid-token')
        .send({ score: 5, emotion: 'tranquilo' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        score: 5,
        emotion: 'tranquilo',
        isCrisis: false,
      });
    });

    it('POST /api/mood with crisis score (score=2, emotion="triste") → 200 with isCrisis=true', async () => {
      const res = await request(app)
        .post('/api/mood')
        .set('Authorization', 'Bearer valid-token')
        .send({ score: 2, emotion: 'triste' });

      expect(res.status).toBe(200);
      expect(res.body.isCrisis).toBe(true);
    });
  });

  // ─── Daily limit ─────────────────────────────────────────────────────────────

  describe('Daily limit enforcement', () => {
    it('POST /api/mood when daily limit reached (count=5) → 429', async () => {
      mocks.moodCount.mockResolvedValue(5);

      const res = await request(app)
        .post('/api/mood')
        .set('Authorization', 'Bearer valid-token')
        .send({ score: 5, emotion: 'neutral' });

      expect(res.status).toBe(429);
      expect(res.body.error.code).toBe('DAILY_LIMIT_EXCEEDED');
    });
  });

  // ─── History endpoint ────────────────────────────────────────────────────────

  describe('GET /api/mood — history', () => {
    it('GET /api/mood with valid auth → 200 with { entries: [], total: 0, todayCount: 0 }', async () => {
      const res = await request(app)
        .get('/api/mood')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ entries: [], total: 0, todayCount: 0 });
    });

    it('GET /api/mood returns todayCount independently from recent entries total', async () => {
      mocks.moodFindMany.mockResolvedValue(Array.from({ length: 6 }, (_, index) => ({
        ...mockPrismaMoodEntry,
        id: `mood-${index + 1}`,
        created_at: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
      })));
      mocks.moodCount.mockResolvedValue(2);

      const res = await request(app)
        .get('/api/mood')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(6);
      expect(res.body.todayCount).toBe(2);
    });
  });

  // ─── OWASP A03 — Injection ───────────────────────────────────────────────────

  describe('OWASP A03 — Injection prevention', () => {
    it('POST /api/mood with note="' + "' OR 1=1--" + '" is accepted (Zod passes strings, no SQL injection possible) → 201', async () => {
      const res = await request(app)
        .post('/api/mood')
        .set('Authorization', 'Bearer valid-token')
        .send({ score: 5, emotion: 'tranquilo', note: "' OR 1=1--" });

      // The note is a valid string under 500 chars, so Zod accepts it.
      // Prisma uses parameterized queries so SQL injection is not possible.
      expect(res.status).toBe(201);
      expect(res.body.isCrisis).toBe(false);
    });

    it("POST /api/mood with score=\"' DROP TABLE--\" (not a number) → 400 VALIDATION_ERROR", async () => {
      const res = await request(app)
        .post('/api/mood')
        .set('Authorization', 'Bearer valid-token')
        .send({ score: "' DROP TABLE--", emotion: 'tranquilo' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

});
