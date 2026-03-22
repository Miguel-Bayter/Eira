import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { notify } from '@/lib/toast';
import { API_URL, createJsonHeaders } from '@/lib/api';
import { createJournalEntrySchema } from '@eira/shared';

export interface JournalEntry {
  id: string;
  content: string;
  aiAnalysis: string | null;
  createdAt: string;
  updatedAt: string;
}

function handleUnauthorized(): void {
  useAuthStore.getState().logout();
  window.location.href = '/login';
}

export function useJournalHistory() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const status = useAuthStore((s) => s.status);
  return useQuery<{ entries: JournalEntry[]; total: number }>({
    queryKey: ['journal-history'],
    enabled: status !== 'bootstrapping' && isAuthenticated,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/journal`, {
        credentials: 'include', // httpOnly cookie sent automatically
      });
      if (res.status === 401) {
        handleUnauthorized();
        return Promise.reject(new Error('Unauthorized'));
      }
      if (!res.ok) throw new Error('Error loading journal');
      return res.json() as Promise<{ entries: JournalEntry[]; total: number }>;
    },
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation<JournalEntry, Error, { content: string }>({
    mutationFn: async ({ content }) => {
      const payload = createJournalEntrySchema.parse({ content });
      const res = await fetch(`${API_URL}/api/journal`, {
        method: 'POST',
        headers: createJsonHeaders({ includeCsrf: true }),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return Promise.reject(new Error('Unauthorized'));
      }
      if (!res.ok) {
        const body = await res.json() as { error?: { message?: string } };
        throw new Error(body.error?.message ?? 'Error saving entry');
      }
      return res.json() as Promise<JournalEntry>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['journal-history'] });
      notify.success('toast.journalSaved');
    },
    onError: () => {
      notify.error('toast.error');
    },
  });
}

export function useAnalyzeJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; aiAnalysis: string; updatedAt: string }, Error, { entryId: string }>({
    mutationFn: async ({ entryId }) => {
      const res = await fetch(`${API_URL}/api/journal/${entryId}/analyze`, {
        method: 'POST',
        headers: createJsonHeaders({ includeCsrf: true }),
        credentials: 'include',
      });
      if (res.status === 401) {
        handleUnauthorized();
        return Promise.reject(new Error('Unauthorized'));
      }
      if (!res.ok) {
        const body = await res.json() as { error?: { message?: string } };
        throw new Error(body.error?.message ?? 'Error analyzing entry');
      }
      return res.json() as Promise<{ id: string; aiAnalysis: string; updatedAt: string }>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['journal-history'] });
      notify.success('toast.analysisDone');
    },
    onError: () => {
      notify.error('toast.error');
    },
  });
}
