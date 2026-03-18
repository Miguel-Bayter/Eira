import type { IJournalRepository } from '@domain/repositories/IJournalRepository';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import { JournalEntry } from '@domain/entities/JournalEntry';
import { UserNotFoundError } from '@domain/errors';

export interface CreateJournalEntryInput {
  userId: string; // Supabase Auth UUID
  content: string;
}

export interface CreateJournalEntryOutput {
  id: string;
  content: string;
  aiAnalysis: string | null;
  createdAt: string;
  updatedAt: string;
}

export class CreateJournalEntryUseCase {
  constructor(
    private readonly journalRepo: IJournalRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: CreateJournalEntryInput): Promise<CreateJournalEntryOutput> {
    const user = await this.userRepo.findBySupabaseId(input.userId);
    if (!user) throw new UserNotFoundError(input.userId);

    const entry = JournalEntry.create({
      userId: user.id,
      content: input.content,
    });

    await this.journalRepo.save(entry);

    return {
      id: entry.id,
      content: entry.content,
      aiAnalysis: entry.aiAnalysis,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }
}
