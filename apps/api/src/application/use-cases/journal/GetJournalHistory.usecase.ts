import type { IJournalRepository } from '@domain/repositories/IJournalRepository';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import { UserNotFoundError } from '@domain/errors';

export interface GetJournalHistoryInput {
  userId: string;
  limit?: number;
}

export interface JournalEntryDTO {
  id: string;
  content: string;
  aiAnalysis: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetJournalHistoryOutput {
  entries: JournalEntryDTO[];
  total: number;
}

export class GetJournalHistoryUseCase {
  constructor(
    private readonly journalRepo: IJournalRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: GetJournalHistoryInput): Promise<GetJournalHistoryOutput> {
    const user = await this.userRepo.findBySupabaseId(input.userId);
    if (!user) throw new UserNotFoundError(input.userId);

    const limit = input.limit ?? 30;
    const entries = await this.journalRepo.findByUserId(user.id, limit);

    return {
      entries: entries.map((e) => ({
        id: e.id,
        content: e.content,
        aiAnalysis: e.aiAnalysis,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      })),
      total: entries.length,
    };
  }
}
