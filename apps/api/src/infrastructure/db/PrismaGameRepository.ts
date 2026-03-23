import type { PrismaClient } from '@prisma/client';
import type { IGameRepository } from '@domain/repositories/IGameRepository';
import { GameSession, type GameType } from '@domain/entities/GameSession';

export class PrismaGameRepository implements IGameRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(session: GameSession): Promise<void> {
    await this.prisma.game_sessions.create({
      data: {
        id: session.id,
        user_id: session.userId,
        game_type: session.gameType,
        duration_seconds: session.durationSeconds,
        wellness_points_earned: session.wellnessPointsEarned,
        completed_at: session.completedAt,
      },
    });
  }

  async countTodayByUser(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return this.prisma.game_sessions.count({
      where: { user_id: userId, completed_at: { gte: startOfDay } },
    });
  }

  async findByUserId(userId: string): Promise<GameSession[]> {
    const records = await this.prisma.game_sessions.findMany({
      where: { user_id: userId },
      orderBy: { completed_at: 'desc' },
    });
    return records.map((r) =>
      GameSession.reconstruct({
        id: r.id,
        userId: r.user_id,
        gameType: r.game_type as GameType,
        durationSeconds: r.duration_seconds,
        wellnessPointsEarned: r.wellness_points_earned,
        completedAt: r.completed_at,
      }),
    );
  }
}
