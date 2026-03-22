import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { notify } from '@/lib/toast';
import type { SendChatMessageFormData } from '@/schemas/chat.schema';
import { API_URL, createJsonHeaders } from '@/lib/api';
const CHAT_QUERY_KEY = ['chat-conversation'] as const;

export interface ChatMessageDto {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatConversationDto {
  conversationId: string | null;
  messages: ChatMessageDto[];
  crisis: {
    detected: boolean;
    source: 'none' | 'user_message' | 'assistant_message' | 'both' | 'history';
  };
  dailyCount: number;
  remainingMessages: number;
}

interface ApiErrorResponse {
  error?: {
    code?: string;
  };
}

const API_ERROR_KEY_BY_CODE: Record<string, string> = {
  AI_SERVICE_UNAVAILABLE: 'chat.errors.providerUnavailable',
  DAILY_LIMIT_EXCEEDED: 'chat.errors.dailyLimit',
  RATE_LIMIT_EXCEEDED: 'chat.errors.rateLimited',
  USER_NOT_FOUND: 'chat.errors.userNotFound',
  VALIDATION_ERROR: 'chat.errors.validation',
  UNAUTHORIZED: 'chat.errors.unauthorized',
};

function handleUnauthorized(): void {
  useAuthStore.getState().logout();
  window.location.href = '/login';
}

function mapApiErrorCodeToKey(code: string | undefined, fallbackKey: string): string {
  return code ? (API_ERROR_KEY_BY_CODE[code] ?? fallbackKey) : fallbackKey;
}

async function parseApiError(response: Response, fallbackKey: string): Promise<never> {
  let body: ApiErrorResponse | null = null;
  try {
    body = await response.json() as ApiErrorResponse;
  } catch {
    body = null;
  }

  throw new Error(mapApiErrorCodeToKey(body?.error?.code, fallbackKey));
}

async function fetchConversation(): Promise<ChatConversationDto> {
  const response = await fetch(`${API_URL}/api/chat`, {
    credentials: 'include',
  });

  if (response.status === 401) {
    handleUnauthorized();
    return Promise.reject(new Error('chat.errors.unauthorized'));
  }

  if (!response.ok) {
    await parseApiError(response, 'chat.errors.loadFailed');
  }

  return response.json() as Promise<ChatConversationDto>;
}

async function postMessage(payload: SendChatMessageFormData): Promise<ChatConversationDto> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: createJsonHeaders({ includeCsrf: true }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    handleUnauthorized();
    return Promise.reject(new Error('chat.errors.unauthorized'));
  }

  if (!response.ok) {
    await parseApiError(response, 'chat.errors.sendFailed');
  }

  return response.json() as Promise<ChatConversationDto>;
}

export function useChatConversation() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const status = useAuthStore((state) => state.status);

  return useQuery({
    queryKey: CHAT_QUERY_KEY,
    queryFn: fetchConversation,
    enabled: status !== 'bootstrapping' && isAuthenticated,
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postMessage,
    onSuccess: (data) => {
      queryClient.setQueryData(CHAT_QUERY_KEY, data);
      if (data.crisis.detected) {
        notify.info('toast.chatCrisisSupport');
        return;
      }

      notify.success('toast.chatReplyReady');
    },
    onError: (error: Error) => {
      notify.error(error.message);
    },
  });
}
