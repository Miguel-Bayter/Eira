import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axe from 'axe-core';
import Register from '../../src/pages/Register';
import Login from '../../src/pages/Login';
import MoodTracker from '../../src/pages/MoodTracker';

vi.mock('../../src/hooks/useAuth', () => ({
  useRegister: () => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    error: null,
  }),
  useLogin: () => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    error: null,
  }),
}));

vi.mock('../../src/hooks/useMood', () => ({
  useCreateMood: () => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    error: null,
  }),
  useMoodHistory: () => ({
    data: { entries: [], total: 0, todayCount: 0 },
    isLoading: false,
  }),
}));

vi.mock('../../src/store/authStore', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({
      user: { id: '1', name: 'Test User', email: 'test@example.com', wellnessScore: 50, streakDays: 3 },
      isAuthenticated: true,
      status: 'authenticated',
      setUser: vi.fn(),
      setAnonymous: vi.fn(),
      logout: vi.fn(),
    }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function expectNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  });

  expect(results.violations).toEqual([]);
}

describe('Accessibility — critical pages', () => {
  it('Register page has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<Register />);

    await expectNoViolations(container);
  });

  it('Login page has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<Login />);

    await expectNoViolations(container);
  });

  it('MoodTracker page has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<MoodTracker />);

    await expectNoViolations(container);
  });
});
