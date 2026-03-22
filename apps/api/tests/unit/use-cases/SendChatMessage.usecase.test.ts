import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SendChatMessageUseCase } from '../../../src/application/use-cases/chat/SendChatMessage.usecase';
import { ChatConversation } from '../../../src/domain/entities/ChatConversation';
import { User } from '../../../src/domain/entities/User';
import type { IChatRepository } from '../../../src/domain/repositories/IChatRepository';
import type { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import type { IAiService } from '../../../src/domain/services/IAiService';
import { DailyLimitExceededError, UserNotFoundError } from '../../../src/domain/errors';

const mockChatRepo: IChatRepository = {
  save: vi.fn(),
  findLatestByUserId: vi.fn(),
  countTodayMessagesByUser: vi.fn(),
};

const mockUserRepo: IUserRepository = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findBySupabaseId: vi.fn(),
  save: vi.fn(),
};

const mockAiService: IAiService = {
  chat: vi.fn(),
  analyze: vi.fn(),
  moderate: vi.fn(),
};

function makeUser(id = 'user-db-id'): User {
  return User.reconstruct({
    id,
    supabaseId: 'supabase-user-id',
    email: 'ana@example.com',
    name: 'Ana',
    wellnessScore: 50,
    streakDays: 3,
    lastMoodDate: null,
    createdAt: new Date(),
  });
}

function makeConversation(userId = 'user-db-id'): ChatConversation {
  const conversation = ChatConversation.create(userId);
  conversation.appendExchange('I feel overwhelmed today', 'I am here with you. Let us take one slow breath together.');
  return conversation;
}

describe('SendChatMessageUseCase', () => {
  let useCase: SendChatMessageUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(makeUser());
    vi.mocked(mockChatRepo.findLatestByUserId).mockResolvedValue(makeConversation());
    vi.mocked(mockChatRepo.countTodayMessagesByUser).mockResolvedValue(1);
    vi.mocked(mockChatRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockAiService.chat).mockResolvedValue('Let us slow things down together and focus on one kind next step.');

    useCase = new SendChatMessageUseCase(mockChatRepo, mockUserRepo, mockAiService);
  });

  it('returns the updated conversation with the new exchange', async () => {
    const result = await useCase.execute({
      userId: 'supabase-user-id',
      message: 'Can you help me calm down?',
      language: 'en',
    });

    expect(result.conversationId).toEqual(expect.any(String));
    expect(result.messages).toHaveLength(4);
    expect(result.crisis.detected).toBe(false);
    expect(result.dailyCount).toBe(2);
    expect(result.remainingMessages).toBe(48);
    expect(mockAiService.chat).toHaveBeenCalledOnce();
    expect(mockChatRepo.save).toHaveBeenCalledOnce();
  });

  it('flags crisis content when the user message contains crisis keywords', async () => {
    vi.mocked(mockAiService.chat).mockResolvedValue('You deserve immediate support. Please reach out to a crisis line or someone you trust now.');

    const result = await useCase.execute({
      userId: 'supabase-user-id',
      message: 'I want to die and I do not know what to do',
      language: 'en',
    });

    expect(result.crisis.detected).toBe(true);
    expect(result.crisis.source).toBe('user_message');
  });

  it('starts a new conversation when the latest one is from a previous day', async () => {
    const previousDay = ChatConversation.reconstruct({
      id: 'old-conversation',
      userId: 'user-db-id',
      messages: [
        { id: 'm1', role: 'user', content: 'Yesterday was hard', createdAt: new Date('2026-03-20T10:00:00.000Z') },
        { id: 'm2', role: 'assistant', content: 'Thank you for sharing that.', createdAt: new Date('2026-03-20T10:00:00.000Z') },
      ],
      hasCrisis: false,
      createdAt: new Date('2026-03-20T10:00:00.000Z'),
      updatedAt: new Date('2026-03-20T10:00:00.000Z'),
    });
    vi.mocked(mockChatRepo.findLatestByUserId).mockResolvedValue(previousDay);

    const result = await useCase.execute({
      userId: 'supabase-user-id',
      message: 'Today feels different',
      language: 'en',
    });

    expect(result.messages).toHaveLength(2);
  });

  it('throws UserNotFoundError when the user does not exist', async () => {
    vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'missing-user', message: 'Hello' })).rejects.toThrow(UserNotFoundError);
  });

  it('throws DailyLimitExceededError when the daily limit is reached', async () => {
    vi.mocked(mockChatRepo.countTodayMessagesByUser).mockResolvedValue(50);

    await expect(useCase.execute({ userId: 'supabase-user-id', message: 'Hello again' })).rejects.toThrow(DailyLimitExceededError);
  });
});
