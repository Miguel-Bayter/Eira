import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import type { CreateMoodFormData } from '../schemas/mood.schema';
import { notify } from '../lib/toast';
import { API_URL, createJsonHeaders } from '../lib/api';

export interface MoodEntryDTO {
  id: string;
  score: number;
  emotion: string;
  note: string | null;
  isCrisis: boolean;
  createdAt: string;
}

export interface CreateMoodResponse {
  id: string;
  score: number;
  emotion: string;
  isCrisis: boolean;
  createdAt: string;
  wellnessScore: number;
}

interface MoodHistoryResponse {
  entries: MoodEntryDTO[];
  total: number;
  todayCount?: number;
}

function handleUnauthorized(): void {
  useAuthStore.getState().logout();
  window.location.href = '/login';
}

async function postMoodEntry(data: CreateMoodFormData): Promise<CreateMoodResponse> {
  const res = await fetch(`${API_URL}/api/mood`, {
    method: 'POST',
    headers: createJsonHeaders({ includeCsrf: true }),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (res.status === 401) {
    handleUnauthorized();
    return Promise.reject(new Error('Unauthorized'));
  }
  if (!res.ok) {
    const body = (await res.json()) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? 'Error registering mood entry');
  }
  return res.json() as Promise<CreateMoodResponse>;
}

async function fetchMoodHistory(): Promise<MoodHistoryResponse> {
  const res = await fetch(`${API_URL}/api/mood?limit=30`, {
    credentials: 'include', // httpOnly cookie sent automatically
  });
  if (res.status === 401) {
    handleUnauthorized();
    return Promise.reject(new Error('Unauthorized'));
  }
  if (!res.ok) throw new Error('Error loading mood history');
  return res.json() as Promise<MoodHistoryResponse>;
}

export function useCreateMood() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: postMoodEntry,
    onSuccess: (data) => {
      if (user) {
        setUser({ ...user, wellnessScore: data.wellnessScore });
      }
      void queryClient.invalidateQueries({ queryKey: ['mood-history'] });
      notify.success('toast.moodSaved');
    },
    onError: () => {
      notify.error('toast.error');
    },
  });
}

export function useMoodHistory() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['mood-history'],
    queryFn: fetchMoodHistory,
    enabled: status !== 'bootstrapping' && isAuthenticated,
  });
}
