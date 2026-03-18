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
    // 1. Verificar que el usuario existe
    const user = await this.userRepo.findById(input.userId);
    if (!user) throw new UserNotFoundError(input.userId);

    // 2. Límite diario de 5 entradas
    const todayCount = await this.moodRepo.countTodayByUser(input.userId);
    if (todayCount >= 5) throw new DailyLimitExceededError('mood', 5);

    // 3. Crear la entidad (valida score y emoción internamente)
    const entry = MoodEntry.create({
      userId: input.userId,
      score: input.score,
      emotion: input.emotion,
      ...(input.note !== undefined && { note: input.note }),
    });

    // 4. Aplicar efectos en el wellness score
    if (entry.score.isHighMood()) {
      user.applyHighMoodBonus();
    } else if (entry.score.isCrisis()) {
      user.applyLowMoodPenalty();
    }

    // 5. Incrementar racha
    user.incrementStreakForToday();

    // 6. Persistir ambos
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
