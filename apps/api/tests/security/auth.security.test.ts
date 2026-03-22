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

function withIp(req: Test, ip: string): Test {
  return req.set('X-Forwarded-For', ip);
}

describe('Auth Security — High-Value Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'supabase-user-id', email: 'ana@example.com', user_metadata: { name: 'Ana' } } },
      error: null,
    });

    mocks.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    });

    mocks.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    mocks.usersFindUnique.mockResolvedValue(null);
    mocks.usersUpsert.mockResolvedValue(undefined);
  });

  it('returns the same generic registration failure message for Supabase errors', async () => {
    const res = await withIp(
      request(app).post('/api/auth/register'),
      '203.0.113.20',
    ).send({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'Password123',
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: {
        code: 'REGISTRATION_ERROR',
        message: 'Could not complete registration. Please try again.',
      },
    });
  });

  it('blocks unauthenticated access to protected routes', async () => {
    const responses = await Promise.all([
      request(app).get('/api/auth/me'),
      request(app).get('/api/mood'),
      request(app).get('/api/journal'),
    ]);

    for (const res of responses) {
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    }
  });

  it('rate limits repeated login attempts on auth routes', async () => {
    const ip = '203.0.113.21';
    let lastResponse = await withIp(request(app).post('/api/auth/login'), ip).send({
      email: 'ana@example.com',
      password: 'Password123',
    });

    for (let attempt = 1; attempt < 11; attempt += 1) {
      lastResponse = await withIp(request(app).post('/api/auth/login'), ip).send({
        email: 'ana@example.com',
        password: 'Password123',
      });
    }

    expect(lastResponse.status).toBe(429);
    expect(lastResponse.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('rejects cookie-authenticated logout requests without the CSRF header', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Origin', 'http://localhost:5173')
      .set('Cookie', 'eira_token=valid-token');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_VALIDATION_FAILED');
  });
});
