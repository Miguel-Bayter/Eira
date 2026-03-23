import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL, createJsonHeaders } from '@/lib/api';
import { notify } from '@/lib/toast';
import { useTranslation } from 'react-i18next';

export type GameType = 'breathing' | 'bubble_pop' | 'zen_garden' | 'coloring';

interface RecordSessionInput {
  gameType: GameType;
  durationSeconds: number;
}

interface RecordSessionResult {
  wellnessPointsEarned: number;
  newWellnessScore: number;
}

async function recordSession(input: RecordSessionInput): Promise<RecordSessionResult> {
  const res = await fetch(`${API_URL}/api/games/complete`, {
    method: 'POST',
    headers: createJsonHeaders({ includeCsrf: true }),
    credentials: 'include',
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('session_failed');
  return res.json() as Promise<RecordSessionResult>;
}

export function useRecordGameSession() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordSession,
    onSuccess: (data) => {
      notify.success(t('games.sessionSaved', { points: data.wellnessPointsEarned }));
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => {
      notify.error(t('games.sessionError'));
    },
  });
}
