import type { PrismaClient } from '@prisma/client';
import type { IMoodRepository, MoodDayAggregate } from '@domain/repositories/IMoodRepository';
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

  async findHeatmapByUserId(userId: string, days: number): Promise<MoodDayAggregate[]> {
    const since = new Date();
    since.setDate(since.getDate() - days + 1);
    since.setHours(0, 0, 0, 0);

    const records = await this.prisma.mood_entries.findMany({
      where: { user_id: userId, created_at: { gte: since } },
      orderBy: { created_at: 'asc' },
    });

    // Group by date string (YYYY-MM-DD)
    const grouped = new Map<string, number[]>();
    for (const record of records) {
      const dateKey = record.created_at.toISOString().slice(0, 10);
      const existing = grouped.get(dateKey);
      if (existing) {
        existing.push(record.score);
      } else {
        grouped.set(dateKey, [record.score]);
      }
    }

    return Array.from(grouped.entries()).map(([date, scores]) => ({
      date,
      avgScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
    }));
  }

  async findTrendByUserId(userId: string, days: number): Promise<MoodDayAggregate[]> {
    const since = new Date();
    since.setDate(since.getDate() - days + 1);
    since.setHours(0, 0, 0, 0);

    const records = await this.prisma.mood_entries.findMany({
      where: { user_id: userId, created_at: { gte: since } },
      orderBy: { created_at: 'asc' },
    });

    const grouped = new Map<string, number[]>();
    for (const record of records) {
      const dateKey = record.created_at.toISOString().slice(0, 10);
      const existing = grouped.get(dateKey);
      if (existing) {
        existing.push(record.score);
      } else {
        grouped.set(dateKey, [record.score]);
      }
    }

    return Array.from(grouped.entries()).map(([date, scores]) => ({
      date,
      avgScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
    }));
  }
}
