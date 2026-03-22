import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  usersFindUnique: vi.fn(),
  usersUpsert: vi.fn(),
  journalUpsert: vi.fn(),
  journalFindUnique: vi.fn(),
  journalFindMany: vi.fn(),
  journalCount: vi.fn(),
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
      upsert: mocks.usersUpsert,
    },
    mood_entries: {
      create: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
    },
    journal_entries: {
      upsert: mocks.journalUpsert,
      findUnique: mocks.journalFindUnique,
      findMany: mocks.journalFindMany,
      count: mocks.journalCount,
    },
  }));
  return { PrismaClient };
});

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: mocks.aiAnalyze,
      startChat: vi.fn().mockReturnValue({
        sendMessage: vi.fn().mockResolvedValue({ response: { text: () => '' } }),
      }),
    }),
  })),
}));

vi.mock('groq-sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mocks.aiAnalyze,
      },
    },
  })),
}));

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

const mockPrismaJournalEntry = {
  id: 'journal-entry-1',
  user_id: 'user-test-id',
  content: 'Hoy me sentí bien con el trabajo.',
  ai_analysis: null,
  created_at: new Date(),
  updated_at: new Date(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Journal API — Integration Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: valid authentication
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'supabase-test-id', email: 'test@example.com', user_metadata: { name: 'Test User' } } },
      error: null,
    });

    // Default: user found in DB
    mocks.usersFindUnique.mockResolvedValue(mockPrismaUser);
    mocks.usersUpsert.mockResolvedValue({});

    // Default: journal repo defaults
    mocks.journalUpsert.mockResolvedValue(mockPrismaJournalEntry);
    mocks.journalFindUnique.mockResolvedValue(mockPrismaJournalEntry);
    mocks.journalFindMany.mockResolvedValue([]);
    mocks.journalCount.mockResolvedValue(0);

    // Default: AI returns a valid analysis
    mocks.aiAnalyze.mockResolvedValue({
      choices: [{ message: { content: '**Emociones detectadas**: calma.\n**Patrones identificados**: estabilidad.\n**Sugerencia**: Continúa así.' } }],
    });
  });

  // ─── Authentication ─────────────────────────────────────────────────────────

  describe('Authentication', () => {
    it('POST /api/journal without Authorization header → 401', async () => {
      const res = await request(app)
        .post('/api/journal')
        .send({ content: 'Hoy fue un buen día.' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/journal without Authorization header → 401', async () => {
      const res = await request(app).get('/api/journal');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/journal with invalid token → 401', async () => {
      mocks.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'invalid token' },
      });

      const res = await request(app)
        .post('/api/journal')
        .set('Authorization', 'Bearer invalid-token')
        .send({ content: 'Hoy fue un buen día.' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // ─── Validation ─────────────────────────────────────────────────────────────

  describe('Validation', () => {
    it('POST /api/journal with empty content → 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/journal')
        .set('Authorization', 'Bearer valid-token')
        .send({ content: '' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/journal without content field → 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/journal')
        .set('Authorization', 'Bearer valid-token')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ─── Create journal entry ────────────────────────────────────────────────────

  describe('POST /api/journal — create entry', () => {
    it('creates a journal entry → 201 with expected shape', async () => {
      const res = await request(app)
        .post('/api/journal')
        .set('Authorization', 'Bearer valid-token')
        .send({ content: 'Hoy fue un día muy productivo y me siento bien.' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('content');
      expect(res.body).toHaveProperty('aiAnalysis', null);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });
  });

  // ─── List journal entries ────────────────────────────────────────────────────

  describe('GET /api/journal — list entries', () => {
    it('returns list with valid auth → 200 with { entries: [], total: 0 }', async () => {
      const res = await request(app)
        .get('/api/journal')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ entries: [], total: 0 });
    });

    it('returns entries when they exist', async () => {
      mocks.journalFindMany.mockResolvedValue([mockPrismaJournalEntry]);

      const res = await request(app)
        .get('/api/journal')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.entries).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });
  });

  // ─── AI Analysis ─────────────────────────────────────────────────────────────

  describe('POST /api/journal/:id/analyze', () => {
    it('analyzes a journal entry → 200 with aiAnalysis', async () => {
      const res = await request(app)
        .post('/api/journal/journal-entry-1/analyze')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 'journal-entry-1');
      expect(res.body).toHaveProperty('aiAnalysis');
      expect(res.body).toHaveProperty('updatedAt');
      expect(typeof res.body.aiAnalysis).toBe('string');
    });

    it('returns 404 when entry does not exist', async () => {
      mocks.journalFindUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/journal/nonexistent/analyze')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('JOURNAL_NOT_FOUND');
    });

    it('returns 429 when daily analysis limit (10) is reached', async () => {
      mocks.journalCount.mockResolvedValue(10);

      const res = await request(app)
        .post('/api/journal/journal-entry-1/analyze')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(429);
      expect(res.body.error.code).toBe('DAILY_LIMIT_EXCEEDED');
    });
  });

});
