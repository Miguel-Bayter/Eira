import type { mood_entries as PrismaMoodEntry } from '@prisma/client';
import { MoodEntry } from '@domain/entities/MoodEntry';

export class MoodEntryMapper {
  static toDomain(record: PrismaMoodEntry): MoodEntry {
    return MoodEntry.reconstruct({
      id: record.id,
      userId: record.user_id,
      score: record.score,
      emotion: record.emotion,
      note: record.note,
      isCrisis: record.is_crisis,
      createdAt: record.created_at,
    });
  }

  static toPrisma(entry: MoodEntry): Omit<PrismaMoodEntry, 'id'> & { id: string } {
    return {
      id: entry.id,
      user_id: entry.userId,
      score: entry.score.value,
      emotion: entry.emotion.value,
      note: entry.note,
      is_crisis: entry.isCrisis,
      created_at: entry.createdAt,
    };
  }
}
