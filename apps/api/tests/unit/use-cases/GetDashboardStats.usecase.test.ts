import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetDashboardStatsUseCase } from '../../../src/application/use-cases/dashboard/GetDashboardStats.usecase';
import type { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import type { IMoodRepository } from '../../../src/domain/repositories/IMoodRepository';
import type { IAiService } from '../../../src/domain/services/IAiService';
import { User } from '../../../src/domain/entities/User';
import { UserNotFoundError } from '../../../src/domain/errors';

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
  findHeatmapByUserId: vi.fn(),
  findTrendByUserId: vi.fn(),
};

const mockAiService: IAiService = {
  chat: vi.fn(),
  analyze: vi.fn(),
  moderate: vi.fn(),
};

// ─── Factory ──────────────────────────────────────────────────────────────────

function makeMockUser(): User {
  return User.reconstruct({
    id: 'user-1',
    supabaseId: 'sb-1',
    email: 'test@example.com',
    name: 'Test User',
    wellnessScore: 72,
    streakDays: 5,
    lastMoodDate: null,
    createdAt: new Date(),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GetDashboardStatsUseCase', () => {
  let useCase: GetDashboardStatsUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(makeMockUser());
    vi.mocked(mockMoodRepo.countTodayByUser).mockResolvedValue(2);
    vi.mocked(mockMoodRepo.findHeatmapByUserId).mockResolvedValue([]);
    vi.mocked(mockMoodRepo.findTrendByUserId).mockResolvedValue([]);
    vi.mocked(mockAiService.analyze).mockResolvedValue('Your weekly plan suggestion.');
    useCase = new GetDashboardStatsUseCase(mockUserRepo, mockMoodRepo, mockAiService);
  });

  // ─── Output shape ────────────────────────────────────────────────────────────

  describe('Output shape', () => {
    it('returns the correct fields: wellnessScore, streakDays, todayMoodCount, moodHeatmap, moodTrend, weeklyPlan', async () => {
      const result = await useCase.execute('sb-1');

      expect(result).toHaveProperty('wellnessScore', 72);
      expect(result).toHaveProperty('streakDays', 5);
      expect(result).toHaveProperty('todayMoodCount', 2);
      expect(result).toHaveProperty('moodHeatmap');
      expect(result).toHaveProperty('moodTrend');
      expect(result).toHaveProperty('weeklyPlan');
      expect(Array.isArray(result.moodHeatmap)).toBe(true);
      expect(Array.isArray(result.moodTrend)).toBe(true);
    });
  });

  // ─── Parallel queries ────────────────────────────────────────────────────────

  describe('Parallel DB queries', () => {
    it('calls countTodayByUser, findHeatmapByUserId, and findTrendByUserId in parallel', async () => {
      await useCase.execute('sb-1');

      expect(mockMoodRepo.countTodayByUser).toHaveBeenCalledOnce();
      expect(mockMoodRepo.findHeatmapByUserId).toHaveBeenCalledOnce();
      expect(mockMoodRepo.findTrendByUserId).toHaveBeenCalledOnce();
    });
  });

  // ─── Heatmap generation ──────────────────────────────────────────────────────

  describe('Heatmap generation', () => {
    it('returns exactly 364 items in moodHeatmap (52 weeks)', async () => {
      const result = await useCase.execute('sb-1');
      expect(result.moodHeatmap).toHaveLength(364);
    });

    it('fills days with no data as score: null', async () => {
      const result = await useCase.execute('sb-1');
      const nullEntries = result.moodHeatmap.filter((e) => e.score === null);
      expect(nullEntries.length).toBe(364); // no aggregate data, all null
    });

    it('maps aggregate data correctly for days that have data', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateKey = today.toISOString().slice(0, 10);

      vi.mocked(mockMoodRepo.findHeatmapByUserId).mockResolvedValue([
        { date: dateKey, avgScore: 7.5 },
      ]);

      const result = await useCase.execute('sb-1');
      const entry = result.moodHeatmap.find((e) => e.date === dateKey);
      expect(entry).toBeDefined();
      expect(entry?.score).toBeCloseTo(7.5);
    });
  });

  // ─── Trend calculation ───────────────────────────────────────────────────────

  describe('Trend calculation', () => {
    it('passes trend data through unchanged', async () => {
      const trendData = [
        { date: '2026-03-15', avgScore: 6.5 },
        { date: '2026-03-16', avgScore: 7.0 },
      ];
      vi.mocked(mockMoodRepo.findTrendByUserId).mockResolvedValue(trendData);

      const result = await useCase.execute('sb-1');
      expect(result.moodTrend).toEqual(trendData);
    });
  });

  // ─── AI weekly plan ──────────────────────────────────────────────────────────

  describe('AI weekly plan', () => {
    it('calls aiService.analyze when trend data exists', async () => {
      vi.mocked(mockMoodRepo.findTrendByUserId).mockResolvedValue([
        { date: '2026-03-15', avgScore: 6.0 },
      ]);

      const result = await useCase.execute('sb-1');

      expect(mockAiService.analyze).toHaveBeenCalledOnce();
      expect(result.weeklyPlan).toBe('Your weekly plan suggestion.');
    });

    it('returns weeklyPlan: null when no trend data', async () => {
      vi.mocked(mockMoodRepo.findTrendByUserId).mockResolvedValue([]);

      const result = await useCase.execute('sb-1');

      expect(mockAiService.analyze).not.toHaveBeenCalled();
      expect(result.weeklyPlan).toBeNull();
    });

    it('returns weeklyPlan: null when AI call throws (graceful fallback)', async () => {
      vi.mocked(mockMoodRepo.findTrendByUserId).mockResolvedValue([
        { date: '2026-03-15', avgScore: 6.0 },
      ]);
      vi.mocked(mockAiService.analyze).mockRejectedValue(new Error('AI provider unavailable'));

      const result = await useCase.execute('sb-1');

      expect(result.weeklyPlan).toBeNull();
    });
  });

  // ─── Error cases ─────────────────────────────────────────────────────────────

  describe('Error cases', () => {
    it('throws UserNotFoundError when user does not exist', async () => {
      vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(null);

      await expect(useCase.execute('ghost-user')).rejects.toThrow(UserNotFoundError);
    });
  });
});
