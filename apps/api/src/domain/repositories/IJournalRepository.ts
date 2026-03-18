import type { JournalEntry } from '@domain/entities/JournalEntry';

export interface IJournalRepository {
  save(entry: JournalEntry): Promise<void>;
  findById(id: string): Promise<JournalEntry | null>;
  findByUserId(userId: string, limit: number): Promise<JournalEntry[]>;
  countTodayAnalysesByUser(userId: string): Promise<number>;
}
