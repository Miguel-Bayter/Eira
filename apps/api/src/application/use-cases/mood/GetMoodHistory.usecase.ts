import type { IMoodRepository } from '@domain/repositories/IMoodRepository';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import { UserNotFoundError } from '@domain/errors';

export interface GetMoodHistoryInput {
  userId: string; // Supabase Auth UUID (from req.userId)
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
  constructor(
    private readonly moodRepo: IMoodRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: GetMoodHistoryInput): Promise<GetMoodHistoryOutput> {
    // Resolve internal ID from supabase_id
    const user = await this.userRepo.findBySupabaseId(input.userId);
    if (!user) throw new UserNotFoundError(input.userId);

    const limit = input.limit ?? 30;
    const entries = await this.moodRepo.findByUserId(user.id, limit);

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
