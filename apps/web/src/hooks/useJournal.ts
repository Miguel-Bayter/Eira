import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function authHeaders(): HeadersInit {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface JournalEntry {
  id: string;
  content: string;
  aiAnalysis: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useJournalHistory() {
  const token = useAuthStore((s) => s.token);
  return useQuery<{ entries: JournalEntry[]; total: number }>({
    queryKey: ['journal-history'],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/journal`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Error al cargar el diario');
      return res.json() as Promise<{ entries: JournalEntry[]; total: number }>;
    },
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation<JournalEntry, Error, { content: string }>({
    mutationFn: async ({ content }) => {
      const res = await fetch(`${API_URL}/api/journal`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: { message?: string } };
        throw new Error(body.error?.message ?? 'Error al guardar');
      }
      return res.json() as Promise<JournalEntry>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['journal-history'] });
    },
  });
}

export function useAnalyzeJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; aiAnalysis: string; updatedAt: string }, Error, { entryId: string }>({
    mutationFn: async ({ entryId }) => {
      const res = await fetch(`${API_URL}/api/journal/${entryId}/analyze`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: { message?: string } };
        throw new Error(body.error?.message ?? 'Error al analizar');
      }
      return res.json() as Promise<{ id: string; aiAnalysis: string; updatedAt: string }>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['journal-history'] });
    },
  });
}
