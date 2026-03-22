import { beforeEach, describe, expect, it, vi } from 'vitest';
import request, { type Test } from 'supertest';
import { app } from '../../src/server';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  usersFindUnique: vi.fn(),
  usersUpsert: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: mocks.getUser,
      signUp: mocks.signUp,
      signInWithPassword: mocks.signInWithPassword,
    },
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
      upsert: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  }));

  return { PrismaClient };
});

const mockPrismaUser = {
  id: 'internal-user-id',
  supabase_id: 'supabase-user-id',
  email: 'ana@example.com',
  name: 'Ana',
  wellness_score: 50,
  streak_days: 2,
  last_mood_date: null,
  created_at: new Date(),
  updated_at: new Date(),
};

function withIp(req: Test, ip: string): Test {
  return req.set('X-Forwarded-For', ip);
}

describe('Auth API — Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'supabase-user-id', email: 'ana@example.com', user_metadata: { name: 'Ana' } } },
      error: null,
    });

    mocks.signUp.mockResolvedValue({
      data: {
        user: { id: 'supabase-user-id', email: 'ana@example.com', user_metadata: { name: 'Ana' } },
        session: { access_token: 'register-token' },
      },
      error: null,
    });

    mocks.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'supabase-user-id', email: 'ana@example.com', user_metadata: { name: 'Ana' } },
        session: { access_token: 'login-token' },
      },
      error: null,
    });

    mocks.usersFindUnique.mockImplementation(async ({ where }: { where: Record<string, string> }) => {
      if (where.email === mockPrismaUser.email || where.supabase_id === mockPrismaUser.supabase_id) {
        return mockPrismaUser;
      }

      return null;
    });

    mocks.usersUpsert.mockResolvedValue(undefined);
  });

  it('POST /api/auth/register creates a user and sets the auth cookie', async () => {
    mocks.usersFindUnique.mockResolvedValueOnce(null);

    const res = await withIp(
      request(app).post('/api/auth/register'),
      '203.0.113.10',
    ).send({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'Password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      id: expect.any(String),
      email: 'ana@example.com',
      name: 'Ana',
      wellnessScore: 50,
      streakDays: 0,
    });
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('eira_token=register-token')]),
    );
    expect(mocks.usersUpsert).toHaveBeenCalledTimes(1);
  });

  it('POST /api/auth/login returns the existing user on valid credentials', async () => {
    const res = await withIp(
      request(app).post('/api/auth/login'),
      '203.0.113.11',
    ).send({
      email: 'ana@example.com',
      password: 'Password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      id: 'internal-user-id',
      email: 'ana@example.com',
      name: 'Ana',
      wellnessScore: 50,
      streakDays: 2,
    });
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('eira_token=login-token')]),
    );
  });

  it('POST /api/auth/login returns a generic error on invalid credentials', async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    const res = await withIp(
      request(app).post('/api/auth/login'),
      '203.0.113.12',
    ).send({
      email: 'ana@example.com',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
    });
  });

  it('GET /api/auth/me returns the authenticated internal user dto', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      user: {
        id: 'internal-user-id',
        email: 'ana@example.com',
        name: 'Ana',
        wellnessScore: 50,
        streakDays: 2,
      },
    });
  });

  it('GET /api/auth/me rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
