import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCommunityPostUseCase } from '../../../src/application/use-cases/community/CreateCommunityPost.usecase';
import type { ICommunityRepository } from '../../../src/domain/repositories/ICommunityRepository';
import type { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import type { IAiService } from '../../../src/domain/services/IAiService';
import { User } from '../../../src/domain/entities/User';
import { UserNotFoundError, DailyLimitExceededError } from '../../../src/domain/errors';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUserRepo: IUserRepository = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findBySupabaseId: vi.fn(),
  save: vi.fn(),
};

const mockCommunityRepo: ICommunityRepository = {
  save: vi.fn(),
  findApprovedFeed: vi.fn(),
  countTodayByUser: vi.fn(),
};

const mockAiService: IAiService = {
  chat: vi.fn(),
  analyze: vi.fn(),
  moderate: vi.fn(),
};

// ─── Factory ──────────────────────────────────────────────────────────────────

function makeMockUser(): User {
  return User.reconstruct({
    id: 'user-db-id',
    supabaseId: 'supabase-user-id',
    email: 'ana@example.com',
    name: 'Ana',
    wellnessScore: 50,
    streakDays: 0,
    lastMoodDate: null,
    createdAt: new Date(),
  });
}

const VALID_CONTENT = 'Hoy fue un día difícil pero lo superé con calma.';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateCommunityPostUseCase', () => {
  let useCase: CreateCommunityPostUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(makeMockUser());
    vi.mocked(mockCommunityRepo.countTodayByUser).mockResolvedValue(0);
    vi.mocked(mockCommunityRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockAiService.moderate).mockResolvedValue({ isApproved: true });
    useCase = new CreateCommunityPostUseCase(mockCommunityRepo, mockUserRepo, mockAiService);
  });

  it('throws UserNotFoundError when user does not exist', async () => {
    vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'unknown-id', content: VALID_CONTENT })).rejects.toThrow(
      UserNotFoundError,
    );
  });

  it('throws DailyLimitExceededError when 3 posts already made today', async () => {
    vi.mocked(mockCommunityRepo.countTodayByUser).mockResolvedValue(3);

    await expect(
      useCase.execute({ userId: 'supabase-user-id', content: VALID_CONTENT }),
    ).rejects.toThrow(DailyLimitExceededError);
  });

  it('creates and saves an approved post when AI approves', async () => {
    vi.mocked(mockAiService.moderate).mockResolvedValue({ isApproved: true });

    const result = await useCase.execute({ userId: 'supabase-user-id', content: VALID_CONTENT });

    expect(mockCommunityRepo.save).toHaveBeenCalledOnce();
    expect(result.isApproved).toBe(true);
    expect(result.content).toBe(VALID_CONTENT);
    expect(result.id).toBeDefined();
    expect(result.anonymousAlias).toBeTruthy();
    expect(result.createdAt).toBeDefined();
  });

  it('saves post with isApproved=false when AI rejects content', async () => {
    vi.mocked(mockAiService.moderate).mockResolvedValue({
      isApproved: false,
      reason: 'Contains inappropriate content',
    });

    const result = await useCase.execute({ userId: 'supabase-user-id', content: VALID_CONTENT });

    expect(mockCommunityRepo.save).toHaveBeenCalledOnce();
    expect(result.isApproved).toBe(false);
  });

  it('auto-approves post when AI service throws (fallback)', async () => {
    vi.mocked(mockAiService.moderate).mockRejectedValue(new Error('AI unavailable'));

    const result = await useCase.execute({ userId: 'supabase-user-id', content: VALID_CONTENT });

    expect(mockCommunityRepo.save).toHaveBeenCalledOnce();
    expect(result.isApproved).toBe(true);
  });

  it('works without AI service injected (no moderation — auto-approve)', async () => {
    const useCaseWithoutAi = new CreateCommunityPostUseCase(mockCommunityRepo, mockUserRepo);

    const result = await useCaseWithoutAi.execute({
      userId: 'supabase-user-id',
      content: VALID_CONTENT,
    });

    expect(mockCommunityRepo.save).toHaveBeenCalledOnce();
    expect(result.isApproved).toBe(true);
    expect(mockAiService.moderate).not.toHaveBeenCalled();
  });

  it('returns correct output shape', async () => {
    const result = await useCase.execute({ userId: 'supabase-user-id', content: VALID_CONTENT });

    expect(result).toMatchObject({
      id: expect.any(String),
      anonymousAlias: expect.any(String),
      content: VALID_CONTENT,
      isApproved: true,
      createdAt: expect.any(String),
    });
  });
});
