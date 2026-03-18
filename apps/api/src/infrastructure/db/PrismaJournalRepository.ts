import type { PrismaClient } from '@prisma/client';
import type { IJournalRepository } from '@domain/repositories/IJournalRepository';
import { JournalEntry } from '@domain/entities/JournalEntry';
import { JournalEntryMapper } from './mappers/JournalEntryMapper';

export class PrismaJournalRepository implements IJournalRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(entry: JournalEntry): Promise<void> {
    const data = JournalEntryMapper.toPrisma(entry);
    await this.prisma.journal_entries.upsert({
      where: { id: data.id },
      update: {
        content: data.content,
        ai_analysis: data.ai_analysis,
        updated_at: data.updated_at,
      },
      create: data,
    });
  }

  async findById(id: string): Promise<JournalEntry | null> {
    const row = await this.prisma.journal_entries.findUnique({ where: { id } });
    return row ? JournalEntryMapper.toDomain(row) : null;
  }

  async findByUserId(userId: string, limit: number): Promise<JournalEntry[]> {
    const rows = await this.prisma.journal_entries.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
    return rows.map(JournalEntryMapper.toDomain);
  }

  async countTodayAnalysesByUser(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return this.prisma.journal_entries.count({
      where: {
        user_id: userId,
        ai_analysis: { not: null },
        updated_at: { gte: startOfDay },
      },
    });
  }
}
