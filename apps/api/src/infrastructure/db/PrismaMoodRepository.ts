import type { PrismaClient } from '@prisma/client';
import type { IMoodRepository } from '@domain/repositories/IMoodRepository';
import { MoodEntry } from '@domain/entities/MoodEntry';
import { MoodEntryMapper } from './mappers/MoodEntryMapper';

export class PrismaMoodRepository implements IMoodRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(entry: MoodEntry): Promise<void> {
    const data = MoodEntryMapper.toPrisma(entry);
    await this.prisma.mood_entries.create({ data });
  }

  async findByUserId(userId: string, limit = 30): Promise<MoodEntry[]> {
    const records = await this.prisma.mood_entries.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
    return records.map(MoodEntryMapper.toDomain);
  }

  async countTodayByUser(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.mood_entries.count({
      where: {
        user_id: userId,
        created_at: { gte: today, lt: tomorrow },
      },
    });
  }

  async findRecentByUserId(userId: string, days: number): Promise<MoodEntry[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const records = await this.prisma.mood_entries.findMany({
      where: { user_id: userId, created_at: { gte: since } },
      orderBy: { created_at: 'asc' },
    });
    return records.map(MoodEntryMapper.toDomain);
  }
}
