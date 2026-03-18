import type { IMoodRepository } from '@domain/repositories/IMoodRepository';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import { MoodEntry } from '@domain/entities/MoodEntry';
import { UserNotFoundError, DailyLimitExceededError } from '@domain/errors';

export interface CreateMoodEntryInput {
  userId: string;
  score: number;
  emotion: string;
  note?: string;
}

export interface CreateMoodEntryOutput {
  id: string;
  score: number;
  emotion: string;
  isCrisis: boolean;
  createdAt: string;
  wellnessScore: number;
}

export class CreateMoodEntryUseCase {
  constructor(
    private readonly moodRepo: IMoodRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: CreateMoodEntryInput): Promise<CreateMoodEntryOutput> {
    // 1. Look up user by supabase_id (req.userId contains the Supabase Auth UUID)
    const user = await this.userRepo.findBySupabaseId(input.userId);
    if (!user) throw new UserNotFoundError(input.userId);

    // 2. Daily limit: max 5 entries (use the internal DB ID)
    const todayCount = await this.moodRepo.countTodayByUser(user.id);
    if (todayCount >= 5) throw new DailyLimitExceededError('mood', 5);

    // 3. Create the entity (validates score and emotion internally)
    const entry = MoodEntry.create({
      userId: user.id, // internal ID, not the Supabase one
      score: input.score,
      emotion: input.emotion,
      ...(input.note !== undefined && { note: input.note }),
    });

    // 4. Apply wellness score effects
    if (entry.score.isHighMood()) {
      user.applyHighMoodBonus();
    } else if (entry.score.isCrisis()) {
      user.applyLowMoodPenalty();
    }

    // 5. Increment streak
    user.incrementStreakForToday();

    // 6. Persist both
    await this.moodRepo.save(entry);
    await this.userRepo.save(user);

    return {
      id: entry.id,
      score: entry.score.value,
      emotion: entry.emotion.value,
      isCrisis: entry.isCrisis,
      createdAt: entry.createdAt.toISOString(),
      wellnessScore: user.wellnessScore,
    };
  }
}
