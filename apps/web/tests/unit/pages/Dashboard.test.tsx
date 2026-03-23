import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../../../src/pages/Dashboard';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts ? `${key}(${JSON.stringify(opts)})` : key,
    i18n: { language: 'es' },
  }),
}));

vi.mock('../../../src/store/authStore', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) =>
    selector({
      user: { id: '1', name: 'Ana', email: 'ana@test.com', wellnessScore: 72, streakDays: 5 },
      isAuthenticated: true,
      status: 'authenticated',
      setUser: vi.fn(),
      setAnonymous: vi.fn(),
      logout: vi.fn(),
    }),
}));

vi.mock('../../../src/hooks/useAuth', () => ({
  useLogout: () => ({ mutate: vi.fn() }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

// Mock recharts to avoid canvas issues in test env
vi.mock('recharts', () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => null,
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

function buildHeatmapData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 364 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (363 - i));
    return { date: d.toISOString().slice(0, 10), score: null as number | null };
  });
}

const mockDashboardStats = {
  wellnessScore: 72,
  streakDays: 5,
  todayMoodCount: 1,
  moodHeatmap: buildHeatmapData(),
  moodTrend: [{ date: '2026-03-15', avgScore: 6.5 }],
  weeklyPlan: 'Rest, walk, journal.',
};

vi.mock('../../../src/hooks/useDashboard', () => ({
  useDashboardStats: () => ({
    data: mockDashboardStats,
    isLoading: false,
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Dashboard — Page', () => {
  it('renders heatmap section when dashboard stats are available', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('dashboard.heatmap.title')).toBeInTheDocument();
  });

  it('renders trend section when dashboard stats are available', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('dashboard.trend.title')).toBeInTheDocument();
  });

  it('renders weekly plan when plan text is provided', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('Rest, walk, journal.')).toBeInTheDocument();
  });

  it('renders weekly plan card title', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('dashboard.weeklyPlan.title')).toBeInTheDocument();
  });
});
