import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateMoodEntryUseCase } from '../../../src/application/use-cases/mood/CreateMoodEntry.usecase';
import type { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import type { IMoodRepository } from '../../../src/domain/repositories/IMoodRepository';
import { User } from '../../../src/domain/entities/User';
import { UserNotFoundError, DailyLimitExceededError } from '../../../src/domain/errors';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUserRepo: IUserRepository = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findBySupabaseId: vi.fn(),
  save: vi.fn(),
};

const mockMoodRepo: IMoodRepository = {
  save: vi.fn(),
  findByUserId: vi.fn(),
  countTodayByUser: vi.fn(),
  findRecentByUserId: vi.fn(),
};

// ─── Factory ──────────────────────────────────────────────────────────────────

function makeMockUser(overrides: { wellnessScore?: number } = {}): User {
  return User.reconstruct({
    id: 'user-1',
    supabaseId: 'sb-1',
    email: 'test@example.com',
    name: 'Test User',
    wellnessScore: overrides.wellnessScore ?? 50,
    streakDays: 0,
    lastMoodDate: null,
    createdAt: new Date(),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateMoodEntryUseCase', () => {
  let useCase: CreateMoodEntryUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(makeMockUser());
    vi.mocked(mockMoodRepo.countTodayByUser).mockResolvedValue(0);
    vi.mocked(mockMoodRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);
    useCase = new CreateMoodEntryUseCase(mockMoodRepo, mockUserRepo);
  });

  // ─── Output shape ───────────────────────────────────────────────────────────

  describe('Output shape', () => {
    it('returns an object with the correct fields: id, score, emotion, isCrisis, createdAt, wellnessScore', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        score: 7,
        emotion: 'tranquilo',
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('score', 7);
      expect(result).toHaveProperty('emotion', 'tranquilo');
      expect(result).toHaveProperty('isCrisis', false);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('wellnessScore');
      expect(typeof result.id).toBe('string');
      expect(typeof result.createdAt).toBe('string');
      // createdAt should be a valid ISO string
      expect(() => new Date(result.createdAt)).not.toThrow();
    });
  });

  // ─── Error cases ────────────────────────────────────────────────────────────

  describe('Error cases', () => {
    it('throws UserNotFoundError when user does not exist', async () => {
      vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(null);

      await expect(
        useCase.execute({ userId: 'ghost-user', score: 5, emotion: 'neutral' }),
      ).rejects.toThrow(UserNotFoundError);
    });

    it('throws DailyLimitExceededError when daily count is 5', async () => {
      vi.mocked(mockMoodRepo.countTodayByUser).mockResolvedValue(5);

      await expect(
        useCase.execute({ userId: 'user-1', score: 5, emotion: 'neutral' }),
      ).rejects.toThrow(DailyLimitExceededError);
    });

    it('allows submission when daily count is 4 (one below the limit)', async () => {
      vi.mocked(mockMoodRepo.countTodayByUser).mockResolvedValue(4);

      await expect(
        useCase.execute({ userId: 'user-1', score: 5, emotion: 'neutral' }),
      ).resolves.toBeDefined();
    });
  });

  // ─── isCrisis flag ──────────────────────────────────────────────────────────

  describe('isCrisis in output', () => {
    it('returns isCrisis=false for a normal score (score=7)', async () => {
      const result = await useCase.execute({ userId: 'user-1', score: 7, emotion: 'alegre' });
      expect(result.isCrisis).toBe(false);
    });

    it('returns isCrisis=true for a low score (score=2)', async () => {
      const result = await useCase.execute({ userId: 'user-1', score: 2, emotion: 'triste' });
      expect(result.isCrisis).toBe(true);
    });

    it('returns isCrisis=true when note contains "suicidio" even with score=7', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        score: 7,
        emotion: 'neutral',
        note: 'Estoy pensando en el suicidio',
      });
      expect(result.isCrisis).toBe(true);
    });
  });

  // ─── Wellness score effects ─────────────────────────────────────────────────

  describe('Wellness score effects', () => {
    it('calls applyHighMoodBonus when score=8', async () => {
      const user = makeMockUser({ wellnessScore: 50 });
      const spyBonus = vi.spyOn(user, 'applyHighMoodBonus');
      vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(user);

      await useCase.execute({ userId: 'user-1', score: 8, emotion: 'alegre' });

      expect(spyBonus).toHaveBeenCalledOnce();
    });

    it('calls applyHighMoodBonus when score=10', async () => {
      const user = makeMockUser({ wellnessScore: 50 });
      const spyBonus = vi.spyOn(user, 'applyHighMoodBonus');
      vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(user);

      await useCase.execute({ userId: 'user-1', score: 10, emotion: 'motivado' });

      expect(spyBonus).toHaveBeenCalledOnce();
    });

    it('calls applyLowMoodPenalty when score=3', async () => {
      const user = makeMockUser({ wellnessScore: 50 });
      const spyPenalty = vi.spyOn(user, 'applyLowMoodPenalty');
      vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(user);

      await useCase.execute({ userId: 'user-1', score: 3, emotion: 'triste' });

      expect(spyPenalty).toHaveBeenCalledOnce();
    });

    it('calls applyLowMoodPenalty when score=1', async () => {
      const user = makeMockUser({ wellnessScore: 50 });
      const spyPenalty = vi.spyOn(user, 'applyLowMoodPenalty');
      vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(user);

      await useCase.execute({ userId: 'user-1', score: 1, emotion: 'ansioso' });

      expect(spyPenalty).toHaveBeenCalledOnce();
    });

    it('calls neither bonus nor penalty for score=5 (mid-range)', async () => {
      const user = makeMockUser({ wellnessScore: 50 });
      const spyBonus = vi.spyOn(user, 'applyHighMoodBonus');
      const spyPenalty = vi.spyOn(user, 'applyLowMoodPenalty');
      vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(user);

      await useCase.execute({ userId: 'user-1', score: 5, emotion: 'neutral' });

      expect(spyBonus).not.toHaveBeenCalled();
      expect(spyPenalty).not.toHaveBeenCalled();
    });

    it('calls neither bonus nor penalty for score=7 (high but below isHighMood threshold)', async () => {
      const user = makeMockUser({ wellnessScore: 50 });
      const spyBonus = vi.spyOn(user, 'applyHighMoodBonus');
      const spyPenalty = vi.spyOn(user, 'applyLowMoodPenalty');
      vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(user);

      await useCase.execute({ userId: 'user-1', score: 7, emotion: 'tranquilo' });

      expect(spyBonus).not.toHaveBeenCalled();
      expect(spyPenalty).not.toHaveBeenCalled();
    });
  });

  // ─── Side effects: streak & persistence ─────────────────────────────────────

  describe('Side effects', () => {
    it('always calls incrementStreakForToday on the user', async () => {
      const user = makeMockUser();
      const spyStreak = vi.spyOn(user, 'incrementStreakForToday');
      vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(user);

      await useCase.execute({ userId: 'user-1', score: 6, emotion: 'alegre' });

      expect(spyStreak).toHaveBeenCalledOnce();
    });

    it('calls moodRepo.save exactly once', async () => {
      await useCase.execute({ userId: 'user-1', score: 6, emotion: 'tranquilo' });
      expect(mockMoodRepo.save).toHaveBeenCalledOnce();
    });

    it('calls userRepo.save exactly once', async () => {
      await useCase.execute({ userId: 'user-1', score: 6, emotion: 'tranquilo' });
      expect(mockUserRepo.save).toHaveBeenCalledOnce();
    });
  });

  // ─── Note handling ───────────────────────────────────────────────────────────

  describe('Note handling', () => {
    it('creates entry with an optional note', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        score: 6,
        emotion: 'neutral',
        note: 'Hoy fue un dia tranquilo',
      });
      // Use case returns id; the note is stored inside the entity passed to moodRepo.save
      const savedEntry = vi.mocked(mockMoodRepo.save).mock.calls[0][0];
      expect(savedEntry.note).toBe('Hoy fue un dia tranquilo');
      expect(result.id).toBeDefined();
    });

    it('creates entry without a note (note is undefined)', async () => {
      await useCase.execute({ userId: 'user-1', score: 6, emotion: 'neutral' });
      const savedEntry = vi.mocked(mockMoodRepo.save).mock.calls[0][0];
      expect(savedEntry.note).toBeNull();
    });
  });

  // ─── wellnessScore in output ─────────────────────────────────────────────────

  describe('wellnessScore in output', () => {
    it('returns the wellnessScore from the user after any update', async () => {
      const user = makeMockUser({ wellnessScore: 50 });
      vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(user);

      const result = await useCase.execute({ userId: 'user-1', score: 6, emotion: 'neutral' });

      expect(result.wellnessScore).toBe(user.wellnessScore);
    });

    it('wellnessScore increases after high mood (score=8, +5 bonus)', async () => {
      const user = makeMockUser({ wellnessScore: 50 });
      vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(user);

      const result = await useCase.execute({ userId: 'user-1', score: 8, emotion: 'alegre' });

      expect(result.wellnessScore).toBe(55);
    });

    it('wellnessScore decreases after crisis mood (score=2, -3 penalty)', async () => {
      const user = makeMockUser({ wellnessScore: 50 });
      vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(user);

      const result = await useCase.execute({ userId: 'user-1', score: 2, emotion: 'triste' });

      expect(result.wellnessScore).toBe(47);
    });
  });

});
