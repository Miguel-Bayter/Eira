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
      token: 'test-token',
      setUser: vi.fn(),
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

describe('Journal — Página', () => {
  describe('Renderizado', () => {
    it('muestra el encabezado "Mi Diario"', () => {
      renderWithProviders(<Journal />);
      expect(screen.getByRole('heading', { name: /mi diario/i })).toBeInTheDocument();
    });

    it('muestra el subtítulo del espacio seguro', () => {
      renderWithProviders(<Journal />);
      expect(screen.getByText(/un espacio seguro para expresarte/i)).toBeInTheDocument();
    });

    it('muestra el textarea del editor', () => {
      renderWithProviders(<Journal />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('muestra el label "¿Cómo te sientes hoy?"', () => {
      renderWithProviders(<Journal />);
      expect(screen.getByLabelText(/¿cómo te sientes hoy\?/i)).toBeInTheDocument();
    });

    it('muestra el contador de caracteres (0/5000)', () => {
      renderWithProviders(<Journal />);
      expect(screen.getByText('0/5000')).toBeInTheDocument();
    });

    it('muestra el texto de privacidad del diario', () => {
      renderWithProviders(<Journal />);
      expect(screen.getByText(/escribe al menos 10 caracteres para guardar/i)).toBeInTheDocument();
    });

    it('NO muestra el panel de análisis de IA cuando no hay entrada guardada', () => {
      renderWithProviders(<Journal />);
      expect(screen.queryByText(/análisis de eira/i)).not.toBeInTheDocument();
    });
  });

  describe('Estado de autosave', () => {
    it('no muestra estado de guardado inicialmente', () => {
      renderWithProviders(<Journal />);
      expect(screen.queryByText(/guardando\.\.\./i)).not.toBeInTheDocument();
      expect(screen.queryByText(/guardado ✓/i)).not.toBeInTheDocument();
    });
  });

  describe('SIN inline CSS', () => {
    it('ningún elemento tiene prop style con colores o dimensiones de layout', () => {
      const { container } = renderWithProviders(<Journal />);
      const elementsWithStyle = container.querySelectorAll('[style]');
      elementsWithStyle.forEach((el) => {
        const style = el.getAttribute('style') ?? '';
        expect(style).not.toMatch(/color:|background:|font-size:|margin:|padding:/);
      });
    });
  });
});
