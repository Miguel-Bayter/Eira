import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Register from '../../../src/pages/Register';

// Mock useRegister hook
vi.mock('../../../src/hooks/useAuth', () => ({
  useRegister: () => ({
    mutateAsync: vi
      .fn()
      .mockResolvedValue({
        user: { id: '1', email: 'a@b.com', name: 'Test', wellnessScore: 50 },
        token: 'token',
      }),
    isPending: false,
    error: null,
  }),
}));

// Mock react-router-dom navigate
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

describe('Register — Page', () => {
  describe('Rendering', () => {
    it('shows the registration form', () => {
      renderWithProviders(<Register />);
      // The mock returns the i18n key as text
      expect(screen.getByRole('heading', { name: 'auth.register.formTitle' })).toBeInTheDocument();
      expect(screen.getByLabelText('auth.register.nameLabel')).toBeInTheDocument();
      expect(screen.getByLabelText('auth.register.emailLabel')).toBeInTheDocument();
      expect(screen.getByLabelText('auth.register.passwordLabel')).toBeInTheDocument();
    });

    it('shows the Eira logo', () => {
      renderWithProviders(<Register />);
      // The logo appears in both the desktop panel and the mobile header
      expect(screen.getAllByText(/eira/i).length).toBeGreaterThan(0);
    });
  });

  describe('Validation', () => {
    it('shows errors when submitting an empty form', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      const submitBtn = screen.getByRole('button', { name: 'auth.register.submitButton' });
      await user.click(submitBtn);

      await waitFor(() => {
        // i18n mock returns the key — the translated key is 'validation.name.minLength'
        expect(screen.getByText('validation.name.minLength')).toBeInTheDocument();
      });
    });

    it('shows error for invalid email', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      await user.type(screen.getByLabelText('auth.register.emailLabel'), 'notanemail');
      await user.click(screen.getByRole('button', { name: 'auth.register.submitButton' }));

      await waitFor(() => {
        // i18n mock returns the key — the translated key is 'validation.email.invalid'
        expect(screen.getByText('validation.email.invalid')).toBeInTheDocument();
      });
    });
  });

  describe('No inline CSS', () => {
    it('no element has a style prop with colors or padding', () => {
      const { container } = renderWithProviders(<Register />);
      const elementsWithStyle = container.querySelectorAll('[style]');
      elementsWithStyle.forEach((el) => {
        const style = el.getAttribute('style') ?? '';
        expect(style).not.toMatch(/color:|background:|font-size:|margin:|padding:/);
      });
    });
  });
});
