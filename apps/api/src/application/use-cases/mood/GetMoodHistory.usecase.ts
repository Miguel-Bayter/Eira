import type { IMoodRepository } from '@domain/repositories/IMoodRepository';

export interface GetMoodHistoryInput {
  userId: string;
  limit?: number;
}

export interface MoodEntryDTO {
  id: string;
  score: number;
  emotion: string;
  note: string | null;
  isCrisis: boolean;
  createdAt: string;
}

export interface GetMoodHistoryOutput {
  entries: MoodEntryDTO[];
  total: number;
}

export class GetMoodHistoryUseCase {
  constructor(private readonly moodRepo: IMoodRepository) {}

  async execute(input: GetMoodHistoryInput): Promise<GetMoodHistoryOutput> {
    const limit = input.limit ?? 30;
    const entries = await this.moodRepo.findByUserId(input.userId, limit);

    return {
      entries: entries.map((e) => ({
        id: e.id,
        score: e.score.value,
        emotion: e.emotion.value,
        note: e.note,
        isCrisis: e.isCrisis,
        createdAt: e.createdAt.toISOString(),
      })),
      total: entries.length,
    };
  }
}
