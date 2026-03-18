import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Register from '../../../src/pages/Register';

// Mock del hook useRegister
vi.mock('../../../src/hooks/useAuth', () => ({
  useRegister: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ user: { id: '1', email: 'a@b.com', name: 'Test', wellnessScore: 50 }, token: 'token' }),
    isPending: false,
    error: null,
  }),
}));

// Mock de react-router-dom navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Register — Página', () => {
  describe('Renderizado', () => {
    it('muestra el formulario de registro', () => {
      renderWithProviders(<Register />);
      expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    });

    it('muestra el logo de Eira', () => {
      renderWithProviders(<Register />);
      expect(screen.getByText(/eira/i)).toBeInTheDocument();
    });
  });

  describe('Validación', () => {
    it('muestra errores si se envía el formulario vacío', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      const submitBtn = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/al menos 2 caracteres/i)).toBeInTheDocument();
      });
    });

    it('muestra error para email inválido', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      await user.type(screen.getByLabelText(/email/i), 'notanemail');
      await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });
  });

  describe('SIN inline CSS', () => {
    it('ningún elemento tiene prop style con colores o padding', () => {
      const { container } = renderWithProviders(<Register />);
      const elementsWithStyle = container.querySelectorAll('[style]');
      elementsWithStyle.forEach((el) => {
        const style = el.getAttribute('style') ?? '';
        expect(style).not.toMatch(/color:|background:|font-size:|margin:|padding:/);
      });
    });
  });
});
