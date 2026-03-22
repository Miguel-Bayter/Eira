import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Journal from '../../../src/pages/Journal';

vi.mock('../../../src/hooks/useJournal', () => ({
  useCreateJournalEntry: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useAnalyzeJournalEntry: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
  useJournalHistory: () => ({
    data: { entries: [], total: 0 },
    isLoading: false,
  }),
}));

vi.mock('../../../src/store/authStore', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) =>
    selector({
      user: { id: '1', name: 'Test', email: 'test@test.com', wellnessScore: 50, streakDays: 3 },
      isAuthenticated: true,
      status: 'authenticated',
      setUser: vi.fn(),
      setAnonymous: vi.fn(),
      logout: vi.fn(),
    }),
}));

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

describe('Journal — Page', () => {
  describe('Rendering', () => {
    it('shows the header greeting', () => {
      renderWithProviders(<Journal />);
      // getDayGreeting returns a translation key (mock returns key), inside an h1
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('shows the safe space subtitle text', () => {
      renderWithProviders(<Journal />);
      // mock t() returns the key
      expect(screen.getByText('journal.subtitle')).toBeInTheDocument();
    });

    it('shows the editor textarea', () => {
      renderWithProviders(<Journal />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('shows the editor label', () => {
      renderWithProviders(<Journal />);
      // The label renders the i18n key via mock
      expect(screen.getByLabelText('journal.editor.label')).toBeInTheDocument();
    });

    it('shows the editor hint text', () => {
      renderWithProviders(<Journal />);
      expect(screen.getByText('journal.editor.hint')).toBeInTheDocument();
    });

    it('does NOT show the Eira panel when no entry is saved', () => {
      renderWithProviders(<Journal />);
      expect(screen.queryByText('journal.analysis.header')).not.toBeInTheDocument();
    });
  });

  describe('Buttons', () => {
    it('shows the save-only button', () => {
      renderWithProviders(<Journal />);
      expect(screen.getByRole('button', { name: 'journal.editor.saveButton' })).toBeInTheDocument();
    });

    it('shows the save-and-analyze button', () => {
      renderWithProviders(<Journal />);
      expect(screen.getByRole('button', { name: 'journal.editor.saveAndAnalyzeButton' })).toBeInTheDocument();
    });
  });

  describe('No inline CSS', () => {
    it('no element has a style prop with colors or layout dimensions', () => {
      const { container } = renderWithProviders(<Journal />);
      const elementsWithStyle = container.querySelectorAll('[style]');
      elementsWithStyle.forEach((el) => {
        const style = el.getAttribute('style') ?? '';
        expect(style).not.toMatch(/color:|background:|font-size:|margin:|padding:/);
      });
    });
  });
});
