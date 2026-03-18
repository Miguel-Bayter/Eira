import type { journal_entries } from '@prisma/client';
import { JournalEntry } from '@domain/entities/JournalEntry';

export class JournalEntryMapper {
  static toDomain(row: journal_entries): JournalEntry {
    return JournalEntry.reconstruct({
      id: row.id,
      userId: row.user_id,
      content: row.content,
      aiAnalysis: row.ai_analysis,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  static toPrisma(entry: JournalEntry) {
    return {
      id: entry.id,
      user_id: entry.userId,
      content: entry.content,
      ai_analysis: entry.aiAnalysis,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt,
    };
  }
}
