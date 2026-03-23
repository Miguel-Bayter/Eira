import type { GameSession } from '../entities/GameSession';

export interface IGameRepository {
  save(session: GameSession): Promise<void>;
  countTodayByUser(userId: string): Promise<number>;
}
