import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../lib/api';

export interface DashboardStats {
  wellnessScore: number;
  streakDays: number;
  todayMoodCount: number;
  moodHeatmap: Array<{ date: string; score: number | null }>;
  moodTrend: Array<{ date: string; avgScore: number }>;
  weeklyPlan: string | null;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_URL}/api/dashboard`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to load dashboard stats');
  }
  return res.json() as Promise<DashboardStats>;
}

export function useDashboardStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const status = useAuthStore((s) => s.status);

  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    enabled: status !== 'bootstrapping' && isAuthenticated,
    queryFn: fetchDashboardStats,
  });
}
