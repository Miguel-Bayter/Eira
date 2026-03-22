import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyzeJournalEntryUseCase } from '../../../src/application/use-cases/journal/AnalyzeJournalEntry.usecase';
import type { IJournalRepository } from '../../../src/domain/repositories/IJournalRepository';
import type { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import type { IAiService } from '../../../src/domain/services/IAiService';
import { JournalEntry } from '../../../src/domain/entities/JournalEntry';
import { User } from '../../../src/domain/entities/User';
import { UserNotFoundError, JournalNotFoundError, DailyLimitExceededError } from '../../../src/domain/errors';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUserRepo: IUserRepository = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findBySupabaseId: vi.fn(),
  save: vi.fn(),
};

const mockJournalRepo: IJournalRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  countTodayAnalysesByUser: vi.fn(),
};

const mockAiService: IAiService = {
  chat: vi.fn(),
  analyze: vi.fn(),
  moderate: vi.fn(),
};

// ─── Factories ────────────────────────────────────────────────────────────────

function makeMockUser(id = 'user-db-id'): User {
  return User.reconstruct({
    id,
    supabaseId: 'supabase-uuid',
    email: 'test@example.com',
    name: 'Test User',
    wellnessScore: 50,
    streakDays: 0,
    lastMoodDate: null,
    createdAt: new Date(),
  });
}

function makeMockEntry(userId = 'user-db-id'): JournalEntry {
  return JournalEntry.reconstruct({
    id: 'entry-id-1',
    userId,
    content: 'Hoy me sentí abrumado con el trabajo.',
    aiAnalysis: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AnalyzeJournalEntryUseCase', () => {
  let useCase: AnalyzeJournalEntryUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(makeMockUser());
    vi.mocked(mockJournalRepo.findById).mockResolvedValue(makeMockEntry());
    vi.mocked(mockJournalRepo.countTodayAnalysesByUser).mockResolvedValue(0);
    vi.mocked(mockJournalRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockAiService.analyze).mockResolvedValue(
      '**Emociones detectadas**: Ansiedad, agotamiento.\n**Patrones identificados**: Sobrecarga laboral.\n**Sugerencia**: Tómate un descanso breve.',
    );
    useCase = new AnalyzeJournalEntryUseCase(mockJournalRepo, mockUserRepo, mockAiService);
  });

  describe('Successful analysis', () => {
    it('returns analysis output with expected shape', async () => {
      const result = await useCase.execute({
        userId: 'supabase-uuid',
        entryId: 'entry-id-1',
      });

      expect(result).toHaveProperty('id', 'entry-id-1');
      expect(result).toHaveProperty('aiAnalysis');
      expect(result).toHaveProperty('updatedAt');
      expect(typeof result.aiAnalysis).toBe('string');
      expect(result.aiAnalysis.length).toBeGreaterThan(0);
    });

    it('calls aiService.analyze exactly once', async () => {
      await useCase.execute({ userId: 'supabase-uuid', entryId: 'entry-id-1' });
      expect(mockAiService.analyze).toHaveBeenCalledOnce();
    });

    it('calls journalRepo.save after analysis', async () => {
      await useCase.execute({ userId: 'supabase-uuid', entryId: 'entry-id-1' });
      expect(mockJournalRepo.save).toHaveBeenCalledOnce();
    });
  });

  describe('Error cases', () => {
    it('throws UserNotFoundError when user does not exist', async () => {
      vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(null);

      await expect(
        useCase.execute({ userId: 'ghost-user', entryId: 'entry-id-1' }),
      ).rejects.toThrow(UserNotFoundError);
    });

    it('throws JournalNotFoundError when entry does not exist', async () => {
      vi.mocked(mockJournalRepo.findById).mockResolvedValue(null);

      await expect(
        useCase.execute({ userId: 'supabase-uuid', entryId: 'nonexistent-entry' }),
      ).rejects.toThrow(JournalNotFoundError);
    });

    it('throws JournalNotFoundError when entry belongs to a different user (ownership check)', async () => {
      // Entry belongs to 'other-user', not 'user-db-id'
      vi.mocked(mockJournalRepo.findById).mockResolvedValue(makeMockEntry('other-user-id'));

      await expect(
        useCase.execute({ userId: 'supabase-uuid', entryId: 'entry-id-1' }),
      ).rejects.toThrow(JournalNotFoundError);
    });

    it('throws DailyLimitExceededError when count reaches 10', async () => {
      vi.mocked(mockJournalRepo.countTodayAnalysesByUser).mockResolvedValue(10);

      await expect(
        useCase.execute({ userId: 'supabase-uuid', entryId: 'entry-id-1' }),
      ).rejects.toThrow(DailyLimitExceededError);
    });

    it('allows analysis when count is 9 (one below the limit)', async () => {
      vi.mocked(mockJournalRepo.countTodayAnalysesByUser).mockResolvedValue(9);

      await expect(
        useCase.execute({ userId: 'supabase-uuid', entryId: 'entry-id-1' }),
      ).resolves.toBeDefined();
    });
  });
});
