import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { notify } from '../lib/toast';
import { API_URL, createJsonHeaders } from '../lib/api';

export interface CommunityPostDTO {
  id: string;
  anonymousAlias: string;
  content: string;
  createdAt: string;
}

interface CommunityFeedPage {
  posts: CommunityPostDTO[];
  nextCursor: string | null;
}

function handleUnauthorized(): void {
  useAuthStore.getState().logout();
  window.location.href = '/login';
}

async function fetchFeedPage({
  pageParam,
}: {
  pageParam: string | null;
}): Promise<CommunityFeedPage> {
  const params = new URLSearchParams({ limit: '20' });
  if (pageParam) params.set('cursor', pageParam);
  const res = await fetch(`${API_URL}/api/community?${params.toString()}`, {
    credentials: 'include',
  });
  if (res.status === 401) {
    handleUnauthorized();
    return Promise.reject(new Error('Unauthorized'));
  }
  if (!res.ok) throw new Error('community.errors.loadFailed');
  return res.json() as Promise<CommunityFeedPage>;
}

async function postCommunityEntry(data: { content: string }): Promise<CommunityPostDTO> {
  const res = await fetch(`${API_URL}/api/community`, {
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
    const body = (await res.json()) as { error?: { message?: string; code?: string } };
    if (body.error?.code === 'DAILY_LIMIT_EXCEEDED') {
      throw new Error('community.errors.limitReached');
    }
    throw new Error(body.error?.message ?? 'community.errors.postFailed');
  }
  return res.json() as Promise<CommunityPostDTO>;
}

export function useCommunityFeed() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const status = useAuthStore((s) => s.status);

  return useInfiniteQuery({
    queryKey: ['community-feed'],
    queryFn: fetchFeedPage,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: status !== 'bootstrapping' && isAuthenticated,
  });
}

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postCommunityEntry,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      notify.success('community.toast.posted');
    },
    onError: (err: Error) => {
      notify.error(err.message ?? 'toast.error');
    },
  });
}
