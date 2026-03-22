import type { IMoodRepository } from '@domain/repositories/IMoodRepository';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { IAiService } from '@domain/services/IAiService';
import { UserNotFoundError } from '@domain/errors';

export interface DashboardStats {
  wellnessScore: number;
  streakDays: number;
  todayMoodCount: number;
  moodHeatmap: Array<{ date: string; score: number | null }>;
  moodTrend: Array<{ date: string; avgScore: number }>;
  weeklyPlan: string | null;
}

const HEATMAP_DAYS = 364; // 52 weeks × 7 days
const TREND_DAYS = 7;

const WEEKLY_PLAN_PROMPT =
  "You are Eira, a warm mental wellness companion. Based on the user's mood data from the last 7 days, create a brief, encouraging weekly wellness plan with 3 concrete suggestions. Be warm and specific. Keep it under 150 words. Respond in the same language as the app (Spanish by default).";

function buildHeatmap(
  aggregates: Array<{ date: string; avgScore: number }>,
  days: number,
): Array<{ date: string; score: number | null }> {
  const scoreMap = new Map<string, number>();
  for (const agg of aggregates) {
    scoreMap.set(agg.date, agg.avgScore);
  }

  const result: Array<{ date: string; score: number | null }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10);
    const score = scoreMap.get(dateKey);
    result.push({ date: dateKey, score: score !== undefined ? score : null });
  }

  return result;
}

export class GetDashboardStatsUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly moodRepo: IMoodRepository,
    private readonly aiService: IAiService,
  ) {}

  async execute(supabaseUserId: string): Promise<DashboardStats> {
    const user = await this.userRepo.findBySupabaseId(supabaseUserId);
    if (!user) throw new UserNotFoundError(supabaseUserId);

    const [todayMoodCount, heatmapAggregates, trendAggregates] = await Promise.all([
      this.moodRepo.countTodayByUser(user.id),
      this.moodRepo.findHeatmapByUserId(user.id, HEATMAP_DAYS),
      this.moodRepo.findTrendByUserId(user.id, TREND_DAYS),
    ]);

    const moodHeatmap = buildHeatmap(heatmapAggregates, HEATMAP_DAYS);
    const moodTrend = trendAggregates;

    let weeklyPlan: string | null = null;

    if (trendAggregates.length > 0) {
      const moodSummary = trendAggregates
        .map((t) => `${t.date}: avg score ${t.avgScore.toFixed(1)}`)
        .join(', ');

      try {
        weeklyPlan = await this.aiService.analyze(moodSummary, WEEKLY_PLAN_PROMPT);
      } catch {
        weeklyPlan = null;
      }
    }

    return {
      wellnessScore: user.wellnessScore,
      streakDays: user.streakDays,
      todayMoodCount,
      moodHeatmap,
      moodTrend,
      weeklyPlan,
    };
  }
}
