import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MoodTracker from '../../../src/pages/MoodTracker';

vi.mock('../../../src/hooks/useMood', () => ({
  useCreateMood: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useMoodHistory: () => ({
    data: { entries: [], total: 0 },
    isLoading: false,
  }),
}));

vi.mock('../../../src/store/authStore', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) =>
    selector({
      user: { id: '1', name: 'Test', email: 'test@test.com', wellnessScore: 50, streakDays: 3 },
      token: 'test-token',
      setUser: vi.fn(),
      logout: vi.fn(),
    }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

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

describe('MoodTracker — Page', () => {
  describe('Rendering', () => {
    it('shows the "Mood Tracker" title via i18n key', () => {
      renderWithProviders(<MoodTracker />);
      // The heading renders the i18n key 'mood.tracker.title' via the mock
      expect(screen.getByRole('heading', { name: 'mood.tracker.title' })).toBeInTheDocument();
    });

    it('shows the default slider value (5)', () => {
      renderWithProviders(<MoodTracker />);
      // The score is rendered as a large number alongside "/10"
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('shows emotion buttons (at least "Alegre" via i18n key)', () => {
      renderWithProviders(<MoodTracker />);
      // The mock returns the key, so aria-label="mood.emotions.alegre"
      expect(screen.getByRole('button', { name: 'mood.emotions.alegre' })).toBeInTheDocument();
    });

    it('shows the "Note (optional)" label via i18n key', () => {
      renderWithProviders(<MoodTracker />);
      expect(screen.getByLabelText('mood.tracker.noteLabel')).toBeInTheDocument();
    });

    it('shows the submit button via i18n key', () => {
      renderWithProviders(<MoodTracker />);
      expect(screen.getByRole('button', { name: 'mood.tracker.submitButton' })).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('selects "triste" on click (aria-pressed=true)', () => {
      renderWithProviders(<MoodTracker />);
      const tristeBtn = screen.getByRole('button', { name: 'mood.emotions.triste' });
      expect(tristeBtn).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(tristeBtn);
      expect(tristeBtn).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows validation error when submitting without selecting an emotion', async () => {
      renderWithProviders(<MoodTracker />);
      const submitBtn = screen.getByRole('button', { name: 'mood.tracker.submitButton' });
      fireEvent.click(submitBtn);
      await waitFor(() => {
        expect(screen.getByText(/selecciona cómo te sientes/i)).toBeInTheDocument();
      });
    });
  });

  describe('No inline CSS', () => {
    it('no element has a style prop with colors or layout dimensions', () => {
      const { container } = renderWithProviders(<MoodTracker />);
      const elementsWithStyle = container.querySelectorAll('[style]');
      elementsWithStyle.forEach((el) => {
        const style = el.getAttribute('style') ?? '';
        expect(style).not.toMatch(/color:|background:|font-size:|margin:|padding:/);
      });
    });
  });
});
