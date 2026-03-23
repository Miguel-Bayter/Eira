import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  usersFindUnique: vi.fn(),
  usersUpsert: vi.fn(),
  communityCreate: vi.fn(),
  communityCount: vi.fn(),
  communityFindMany: vi.fn(),
  aiModerate: vi.fn(),
  // Unused stubs required so PrismaClient mock doesn't throw on instantiation
  moodCreate: vi.fn(),
  moodCount: vi.fn(),
  moodFindMany: vi.fn(),
}));

vi.mock('groq-sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mocks.aiModerate,
      },
    },
  })),
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: mocks.aiModerate,
      startChat: vi.fn().mockReturnValue({ sendMessage: mocks.aiModerate }),
    }),
  })),
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
    community_posts: {
      create: mocks.communityCreate,
      count: mocks.communityCount,
      findMany: mocks.communityFindMany,
    },
  }));
  return { PrismaClient };
});

// ─── Fixtures ──────────────────────────────────────────────────────────────

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

const mockCommunityPost = {
  id: 'post-1',
  user_id: 'user-test-id',
  anonymous_alias: 'Mariposa esperanzadora',
  content: 'Un día difícil pero lleno de aprendizajes.',
  is_approved: true,
  rejection_reason: null,
  created_at: new Date(),
};

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('POST /api/community', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    mocks.usersFindUnique.mockResolvedValue(mockPrismaUser);
    mocks.usersUpsert.mockResolvedValue({});
    mocks.communityCount.mockResolvedValue(0);
    mocks.communityCreate.mockResolvedValue(mockCommunityPost);
    mocks.aiModerate.mockResolvedValue({
      choices: [{ message: { content: '{"isApproved": true}' } }],
    });
  });

  it('creates a community post and returns 201', async () => {
    const res = await request(app)
      .post('/api/community')
      .set('Authorization', 'Bearer valid-token')
      .send({ content: 'Un día difícil pero lleno de aprendizajes.' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      anonymousAlias: expect.any(String),
      content: 'Un día difícil pero lleno de aprendizajes.',
      createdAt: expect.any(String),
    });
  });

  it('returns 400 when content is too short', async () => {
    const res = await request(app)
      .post('/api/community')
      .set('Authorization', 'Bearer valid-token')
      .send({ content: 'corto' });

    expect(res.status).toBe(400);
  });

  it('returns 429 when daily limit is reached', async () => {
    mocks.communityCount.mockResolvedValue(3);

    const res = await request(app)
      .post('/api/community')
      .set('Authorization', 'Bearer valid-token')
      .send({ content: 'Quinto mensaje del día de hoy para la prueba.' });

    expect(res.status).toBe(429);
  });

  it('returns 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/community')
      .send({ content: 'Sin autenticación aquí.' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/community', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    mocks.usersFindUnique.mockResolvedValue(mockPrismaUser);
    mocks.communityFindMany.mockResolvedValue([mockCommunityPost]);
  });

  it('returns the approved community feed', async () => {
    const res = await request(app).get('/api/community').set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('posts');
    expect(res.body).toHaveProperty('nextCursor');
    expect(Array.isArray(res.body.posts)).toBe(true);
  });

  it('returns 401 without authentication', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await request(app).get('/api/community');
    expect(res.status).toBe(401);
  });
});
