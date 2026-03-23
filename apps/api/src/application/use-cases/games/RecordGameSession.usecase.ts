import type { IGameRepository } from '@domain/repositories/IGameRepository';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import { GameSession, type GameType } from '@domain/entities/GameSession';
import { UserNotFoundError, DailyLimitExceededError } from '@domain/errors';

const DAILY_GAME_LIMIT = 10;

export interface RecordGameSessionInput {
  userId: string;
  gameType: GameType;
  durationSeconds: number;
}

export interface RecordGameSessionOutput {
  wellnessPointsEarned: number;
  newWellnessScore: number;
}

export class RecordGameSessionUseCase {
  constructor(
    private readonly gameRepo: IGameRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: RecordGameSessionInput): Promise<RecordGameSessionOutput> {
    const user = await this.userRepo.findBySupabaseId(input.userId);
    if (!user) throw new UserNotFoundError(input.userId);

    const todayCount = await this.gameRepo.countTodayByUser(user.id);
    if (todayCount >= DAILY_GAME_LIMIT) {
      throw new DailyLimitExceededError('DAILY_GAME_LIMIT_EXCEEDED', DAILY_GAME_LIMIT);
    }

    const session = GameSession.create({
      userId: user.id,
      gameType: input.gameType,
      durationSeconds: input.durationSeconds,
    });

    await this.gameRepo.save(session);

    user.applyGameBonus(session.wellnessPointsEarned);
    await this.userRepo.save(user);

    return {
      wellnessPointsEarned: session.wellnessPointsEarned,
      newWellnessScore: user.wellnessScore,
    };
  }
}
