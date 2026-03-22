import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  usersFindUnique: vi.fn(),
  usersUpsert: vi.fn(),
  chatFindFirst: vi.fn(),
  chatFindMany: vi.fn(),
  chatUpsert: vi.fn(),
  aiChat: vi.fn(),
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
      upsert: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    chat_conversations: {
      findFirst: mocks.chatFindFirst,
      findMany: mocks.chatFindMany,
      upsert: mocks.chatUpsert,
    },
  }));

  return { PrismaClient };
});

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: mocks.aiAnalyze,
      startChat: vi.fn().mockReturnValue({
        sendMessage: mocks.aiChat,
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

const mockPrismaUser = {
  id: 'user-db-id',
  supabase_id: 'supabase-user-id',
  email: 'ana@example.com',
  name: 'Ana',
  wellness_score: 50,
  streak_days: 3,
  last_mood_date: null,
  created_at: new Date('2026-03-21T10:00:00.000Z'),
  updated_at: new Date('2026-03-21T10:00:00.000Z'),
};

const mockChatConversation = {
  id: 'chat-1',
  user_id: 'user-db-id',
  messages: [
    {
      id: 'message-1',
      role: 'user',
      content: 'I had a rough morning',
      createdAt: new Date('2026-03-21T09:00:00.000Z').toISOString(),
    },
    {
      id: 'message-2',
      role: 'assistant',
      content: 'Thank you for telling me. What felt heaviest about it?',
      createdAt: new Date('2026-03-21T09:00:00.000Z').toISOString(),
    },
  ],
  has_crisis: false,
  created_at: new Date('2026-03-21T09:00:00.000Z'),
  updated_at: new Date('2026-03-21T09:00:00.000Z'),
};

function buildPersistedMessages(userMessageCount: number) {
  return Array.from({ length: userMessageCount }, (_, index) => ({
    id: `message-${index + 1}`,
    role: 'user' as const,
    content: `Message ${index + 1}`,
    createdAt: new Date('2026-03-21T09:00:00.000Z').toISOString(),
  }));
}

describe('Chat API — Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'supabase-user-id',
          email: 'ana@example.com',
          user_metadata: { name: 'Ana' },
        },
      },
      error: null,
    });
    mocks.usersFindUnique.mockResolvedValue(mockPrismaUser);
    mocks.usersUpsert.mockResolvedValue({});
    mocks.chatFindFirst.mockResolvedValue(mockChatConversation);
    mocks.chatFindMany.mockResolvedValue([{ messages: buildPersistedMessages(1) }]);
    mocks.chatUpsert.mockResolvedValue(mockChatConversation);
    mocks.aiChat.mockResolvedValue({ response: { text: () => 'Let us take this one breath at a time.' } });
    mocks.aiAnalyze.mockResolvedValue({ choices: [{ message: { content: 'Let us take this one breath at a time.' } }] });
  });

  it('GET /api/chat without authentication returns 401', async () => {
    const response = await request(app).get('/api/chat');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/chat returns the latest conversation for the authenticated user', async () => {
    const response = await request(app)
      .get('/api/chat')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      conversationId: 'chat-1',
      dailyCount: 1,
      remainingMessages: 49,
    });
    expect(response.body.messages).toHaveLength(2);
  });

  it('GET /api/chat bootstraps the local user when the auth session exists but the local record is missing', async () => {
    mocks.usersFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValue(mockPrismaUser);

    const response = await request(app)
      .get('/api/chat')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(mocks.usersUpsert).toHaveBeenCalledOnce();
  });

  it('POST /api/chat sends a message and returns the updated conversation', async () => {
    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: 'Can you help me settle down?' });

    expect(response.status).toBe(200);
    expect(response.body.dailyCount).toBe(2);
    expect(response.body.remainingMessages).toBe(48);
    expect(response.body.messages).toHaveLength(4);
  });

  it('POST /api/chat returns 503 when both AI providers fail temporarily', async () => {
    mocks.aiAnalyze.mockRejectedValueOnce(new Error('groq unavailable'));
    mocks.aiChat.mockRejectedValueOnce(new Error('gemini unavailable'));

    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: 'Can you help me settle down?' });

    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('AI_SERVICE_UNAVAILABLE');
  });

  it('POST /api/chat returns 400 for an empty message', async () => {
    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: '' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/chat returns 429 when the daily limit has been reached', async () => {
    mocks.chatFindMany.mockResolvedValue([{ messages: buildPersistedMessages(50) }]);

    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: 'One more message' });

    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe('DAILY_LIMIT_EXCEEDED');
  });

  it('POST /api/chat returns a crisis flag when the message contains crisis language', async () => {
    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: 'I want to die' });

    expect(response.status).toBe(200);
    expect(response.body.crisis.detected).toBe(true);
    expect(response.body.crisis.source).toBe('user_message');
  });
});
