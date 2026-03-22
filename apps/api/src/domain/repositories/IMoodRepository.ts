import type { MoodEntry } from '../entities/MoodEntry';

export interface MoodDayAggregate {
  date: string;
  avgScore: number;
}

export interface IMoodRepository {
  save(entry: MoodEntry): Promise<void>;
  findByUserId(userId: string, limit?: number): Promise<MoodEntry[]>;
  countTodayByUser(userId: string): Promise<number>;
  findRecentByUserId(userId: string, days: number): Promise<MoodEntry[]>;
  findHeatmapByUserId(userId: string, days: number): Promise<MoodDayAggregate[]>;
  findTrendByUserId(userId: string, days: number): Promise<MoodDayAggregate[]>;
}
