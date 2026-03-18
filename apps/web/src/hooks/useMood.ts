import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import type { CreateMoodFormData } from '../schemas/mood.schema';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

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
}

function authHeaders(): HeadersInit {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function postMoodEntry(data: CreateMoodFormData): Promise<CreateMoodResponse> {
  const res = await fetch(`${API_URL}/api/mood`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? 'Error al registrar el estado de ánimo');
  }
  return res.json() as Promise<CreateMoodResponse>;
}

async function fetchMoodHistory(): Promise<MoodHistoryResponse> {
  const res = await fetch(`${API_URL}/api/mood?limit=30`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Error al cargar el historial');
  return res.json() as Promise<MoodHistoryResponse>;
}

export function useCreateMood() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: postMoodEntry,
    onSuccess: (data) => {
      if (user && token) {
        setUser({ ...user, wellnessScore: data.wellnessScore }, token);
      }
      void queryClient.invalidateQueries({ queryKey: ['mood-history'] });
    },
  });
}

export function useMoodHistory() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['mood-history'],
    queryFn: fetchMoodHistory,
    enabled: !!token,
  });
}
