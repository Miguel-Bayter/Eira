import { useTranslation } from 'react-i18next';
import { Leaf } from 'lucide-react';
import type { CommunityPostDTO } from '@/hooks/useCommunity';

interface CommunityPostCardProps {
  post: CommunityPostDTO;
}

function formatRelativeTime(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return locale.startsWith('es') ? 'ahora mismo' : 'just now';
  if (minutes < 60) return locale.startsWith('es') ? `hace ${minutes} min` : `${minutes} min ago`;
  if (hours < 24) return locale.startsWith('es') ? `hace ${hours} h` : `${hours} h ago`;
  return locale.startsWith('es') ? `hace ${days} días` : `${days} days ago`;
}

export function CommunityPostCard({ post }: CommunityPostCardProps) {
  const { i18n } = useTranslation();

  return (
    <article className="rounded-2xl border border-sage-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-sage-300 to-sage-400" />
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sage-100">
              <Leaf className="h-3.5 w-3.5 text-sage-600" />
            </div>
            <span className="text-sm font-medium text-sage-700">{post.anonymousAlias}</span>
          </div>
          <time className="text-xs text-slate-400">
            {formatRelativeTime(post.createdAt, i18n.language)}
          </time>
        </div>
        <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{post.content}</p>
      </div>
    </article>
  );
}
