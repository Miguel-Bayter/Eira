import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Chat from '../../../src/pages/Chat';

const mocks = vi.hoisted(() => ({
  useChatConversation: vi.fn(),
  useSendChatMessage: vi.fn(),
}));

vi.mock('../../../src/hooks/useChat', () => ({
  useChatConversation: mocks.useChatConversation,
  useSendChatMessage: mocks.useSendChatMessage,
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

describe('Chat — Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useChatConversation.mockReturnValue({
      data: {
        conversationId: null,
        messages: [],
        crisis: { detected: false, source: 'none' },
        dailyCount: 0,
        remainingMessages: 50,
      },
      isLoading: false,
      error: null,
    });
    mocks.useSendChatMessage.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  it('shows the chat heading', () => {
    renderWithProviders(<Chat />);
    expect(screen.getByRole('heading', { name: 'chat.header.title' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'common.backToDashboard' })).toBeInTheDocument();
  });

  it('shows the composer label and send button', () => {
    renderWithProviders(<Chat />);
    expect(screen.getByLabelText('chat.composer.label')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'chat.composer.sendAriaLabel' })).toBeInTheDocument();
  });

  it('renders the crisis banner when the backend flags a crisis conversation', () => {
    mocks.useChatConversation.mockReturnValue({
      data: {
        conversationId: 'chat-1',
        messages: [
          { id: 'm1', role: 'user', content: 'chat.empty.promptOne', createdAt: new Date().toISOString() },
        ],
        crisis: { detected: true, source: 'history' },
        dailyCount: 1,
        remainingMessages: 49,
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<Chat />);
    expect(screen.getByText('chat.crisis.bannerTitle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'chat.crisis.bannerButton' })).toBeInTheDocument();
  });

  it('shows controlled backend errors when the conversation cannot be loaded', () => {
    mocks.useChatConversation.mockReturnValue({
      data: {
        conversationId: null,
        messages: [],
        crisis: { detected: false, source: 'none' },
        dailyCount: 0,
        remainingMessages: 50,
      },
      isLoading: false,
      error: new Error('chat.errors.providerUnavailable'),
    });

    renderWithProviders(<Chat />);
    expect(screen.getByRole('alert')).toHaveTextContent('chat.errors.providerUnavailable');
  });

  it('keeps layout free of inline color and spacing styles', () => {
    const { container } = renderWithProviders(<Chat />);
    const styledElements = container.querySelectorAll('[style]');

    styledElements.forEach((element) => {
      const style = element.getAttribute('style') ?? '';
      expect(style).not.toMatch(/color:|background:|font-size:|margin:|padding:/);
    });
  });
});
