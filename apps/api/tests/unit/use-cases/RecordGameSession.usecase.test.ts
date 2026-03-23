import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecordGameSessionUseCase } from '@application/use-cases/games/RecordGameSession.usecase';
import { UserNotFoundError, DailyLimitExceededError } from '@domain/errors';
import { User } from '@domain/entities/User';

function freshUser() {
  return User.reconstruct({
    id: 'user-1',
    supabaseId: 'supa-1',
    email: 'test@test.com',
    name: 'Test',
    wellnessScore: 50,
    streakDays: 0,
    lastMoodDate: null,
    createdAt: new Date(),
  });
}

const mockGameRepo = {
  save: vi.fn(),
  countTodayByUser: vi.fn(),
  findByUserId: vi.fn(),
};

const mockUserRepo = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findBySupabaseId: vi.fn(),
  save: vi.fn(),
};

function makeUseCase() {
  return new RecordGameSessionUseCase(mockGameRepo, mockUserRepo);
}

describe('RecordGameSessionUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepo.findBySupabaseId.mockResolvedValue(freshUser());
    mockGameRepo.countTodayByUser.mockResolvedValue(0);
    mockGameRepo.save.mockResolvedValue(undefined);
    mockUserRepo.save.mockResolvedValue(undefined);
  });

  it('throws UserNotFoundError when user does not exist', async () => {
    mockUserRepo.findBySupabaseId.mockResolvedValue(null);
    await expect(
      makeUseCase().execute({ userId: 'x', gameType: 'breathing', durationSeconds: 60 }),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('throws DailyLimitExceededError when 10 sessions done today', async () => {
    mockGameRepo.countTodayByUser.mockResolvedValue(10);
    await expect(
      makeUseCase().execute({ userId: 'supa-1', gameType: 'breathing', durationSeconds: 60 }),
    ).rejects.toBeInstanceOf(DailyLimitExceededError);
  });

  it('saves game session and returns points for breathing (5pts)', async () => {
    const result = await makeUseCase().execute({
      userId: 'supa-1',
      gameType: 'breathing',
      durationSeconds: 60,
    });
    expect(mockGameRepo.save).toHaveBeenCalledOnce();
    expect(result.wellnessPointsEarned).toBe(5);
  });

  it('saves game session and returns points for bubble_pop (3pts)', async () => {
    const result = await makeUseCase().execute({
      userId: 'supa-1',
      gameType: 'bubble_pop',
      durationSeconds: 60,
    });
    expect(result.wellnessPointsEarned).toBe(3);
  });

  it('updates user wellness score after game', async () => {
    const result = await makeUseCase().execute({
      userId: 'supa-1',
      gameType: 'breathing',
      durationSeconds: 60,
    });
    expect(mockUserRepo.save).toHaveBeenCalledOnce();
    expect(result.newWellnessScore).toBe(55); // 50 + 5
  });

  it('returns correct output shape', async () => {
    const result = await makeUseCase().execute({
      userId: 'supa-1',
      gameType: 'zen_garden',
      durationSeconds: 120,
    });
    expect(result).toMatchObject({
      wellnessPointsEarned: expect.any(Number),
      newWellnessScore: expect.any(Number),
    });
  });
});
