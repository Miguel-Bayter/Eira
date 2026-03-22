import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateJournalEntryUseCase } from '../../../src/application/use-cases/journal/CreateJournalEntry.usecase';
import type { IJournalRepository } from '../../../src/domain/repositories/IJournalRepository';
import type { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { User } from '../../../src/domain/entities/User';
import { UserNotFoundError } from '../../../src/domain/errors';

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

// ─── Factory ──────────────────────────────────────────────────────────────────

function makeMockUser(): User {
  return User.reconstruct({
    id: 'user-db-id',
    supabaseId: 'supabase-uuid',
    email: 'test@example.com',
    name: 'Test User',
    wellnessScore: 50,
    streakDays: 0,
    lastMoodDate: null,
    createdAt: new Date(),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateJournalEntryUseCase', () => {
  let useCase: CreateJournalEntryUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(makeMockUser());
    vi.mocked(mockJournalRepo.save).mockResolvedValue(undefined);
    useCase = new CreateJournalEntryUseCase(mockJournalRepo, mockUserRepo);
  });

  describe('Successful creation', () => {
    it('returns a journal entry output with expected shape', async () => {
      const result = await useCase.execute({
        userId: 'supabase-uuid',
        content: 'Hoy me sentí muy bien con el trabajo.',
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('content', 'Hoy me sentí muy bien con el trabajo.');
      expect(result).toHaveProperty('aiAnalysis', null);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(typeof result.id).toBe('string');
      expect(() => new Date(result.createdAt)).not.toThrow();
    });

    it('calls journalRepo.save exactly once', async () => {
      await useCase.execute({ userId: 'supabase-uuid', content: 'Algún contenido válido' });
      expect(mockJournalRepo.save).toHaveBeenCalledOnce();
    });

    it('trims whitespace from content', async () => {
      const result = await useCase.execute({
        userId: 'supabase-uuid',
        content: '  Contenido con espacios  ',
      });
      expect(result.content).toBe('Contenido con espacios');
    });
  });

  describe('Error cases', () => {
    it('throws UserNotFoundError when user does not exist', async () => {
      vi.mocked(mockUserRepo.findBySupabaseId).mockResolvedValue(null);

      await expect(
        useCase.execute({ userId: 'ghost-user', content: 'Texto válido aquí' }),
      ).rejects.toThrow(UserNotFoundError);
    });

    it('throws Error when content is empty', async () => {
      await expect(
        useCase.execute({ userId: 'supabase-uuid', content: '' }),
      ).rejects.toThrow('Journal content cannot be empty');
    });

    it('throws Error when content is only whitespace', async () => {
      await expect(
        useCase.execute({ userId: 'supabase-uuid', content: '   ' }),
      ).rejects.toThrow('Journal content cannot be empty');
    });
  });
});
