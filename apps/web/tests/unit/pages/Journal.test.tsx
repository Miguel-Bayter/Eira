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
    it('muestra el saludo del encabezado', () => {
      renderWithProviders(<Journal />);
      // getDayGreeting returns "Buenos días/tardes/noches ✨" inside an h1
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('muestra el texto del espacio seguro', () => {
      renderWithProviders(<Journal />);
      expect(screen.getByText(/este es tu espacio/i)).toBeInTheDocument();
    });

    it('muestra el textarea del editor', () => {
      renderWithProviders(<Journal />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('muestra el label del editor', () => {
      renderWithProviders(<Journal />);
      expect(screen.getByLabelText(/¿qué llevas en el corazón hoy\?/i)).toBeInTheDocument();
    });

    it('muestra el texto de ayuda del editor', () => {
      renderWithProviders(<Journal />);
      expect(screen.getByText(/escribe al menos 10 caracteres para guardar/i)).toBeInTheDocument();
    });

    it('NO muestra el panel de Eira cuando no hay entrada guardada', () => {
      renderWithProviders(<Journal />);
      expect(screen.queryByText(/eira te escribe/i)).not.toBeInTheDocument();
    });
  });

  describe('Botones', () => {
    it('muestra el botón "Solo guardar"', () => {
      renderWithProviders(<Journal />);
      expect(screen.getByRole('button', { name: /solo guardar/i })).toBeInTheDocument();
    });

    it('muestra el botón "Guardar y recibir consejos"', () => {
      renderWithProviders(<Journal />);
      expect(screen.getByRole('button', { name: /guardar y recibir consejos/i })).toBeInTheDocument();
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
