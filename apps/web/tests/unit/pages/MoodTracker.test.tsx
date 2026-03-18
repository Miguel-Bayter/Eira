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

describe('MoodTracker — Página', () => {
  describe('Renderizado', () => {
    it('muestra el título "Mood Tracker"', () => {
      renderWithProviders(<MoodTracker />);
      expect(screen.getByRole('heading', { name: /mood tracker/i })).toBeInTheDocument();
    });

    it('muestra el valor por defecto del slider (5)', () => {
      renderWithProviders(<MoodTracker />);
      // The score is rendered as a large number alongside "/10"
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('muestra botones de emociones (al menos "Alegre")', () => {
      renderWithProviders(<MoodTracker />);
      expect(screen.getByRole('button', { name: /alegre/i })).toBeInTheDocument();
    });

    it('muestra la etiqueta "Nota (opcional)"', () => {
      renderWithProviders(<MoodTracker />);
      expect(screen.getByLabelText(/nota \(opcional\)/i)).toBeInTheDocument();
    });

    it('muestra el botón de submit', () => {
      renderWithProviders(<MoodTracker />);
      expect(screen.getByRole('button', { name: /guardar registro/i })).toBeInTheDocument();
    });
  });

  describe('Interacción', () => {
    it('selecciona "Triste" al hacer clic (aria-pressed=true)', () => {
      renderWithProviders(<MoodTracker />);
      const tristeBtn = screen.getByRole('button', { name: /triste/i });
      expect(tristeBtn).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(tristeBtn);
      expect(tristeBtn).toHaveAttribute('aria-pressed', 'true');
    });

    it('muestra error de validación al enviar sin seleccionar emoción', async () => {
      renderWithProviders(<MoodTracker />);
      const submitBtn = screen.getByRole('button', { name: /guardar registro/i });
      fireEvent.click(submitBtn);
      await waitFor(() => {
        expect(screen.getByText(/selecciona cómo te sientes/i)).toBeInTheDocument();
      });
    });
  });

  describe('SIN inline CSS', () => {
    it('ningún elemento tiene prop style con colores o dimensiones de layout', () => {
      const { container } = renderWithProviders(<MoodTracker />);
      const elementsWithStyle = container.querySelectorAll('[style]');
      elementsWithStyle.forEach((el) => {
        const style = el.getAttribute('style') ?? '';
        expect(style).not.toMatch(/color:|background:|font-size:|margin:|padding:/);
      });
    });
  });
});
