import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useCommunityFeed, useCreateCommunityPost } from '@/hooks/useCommunity';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import { CommunityComposer } from '@/components/community/CommunityComposer';
import { BackToDashboardLink } from '@/components/ui/BackToDashboardLink';

export default function Community() {
  const { t } = useTranslation();
  const { mutateAsync: createPost, isPending: isPosting } = useCreateCommunityPost();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCommunityFeed();

  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 });
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (data && !initialLoadDone.current) {
      initialLoadDone.current = true;
    }
  }, [data]);

  const allPosts = data?.pages.flatMap((p) => p.posts) ?? [];

  const handlePost = async (content: string) => {
    await createPost({ content });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sage-100 via-sage-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
        <div className="flex justify-start">
          <BackToDashboardLink />
        </div>

        {/* Header */}
        <header className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-100 shadow-sm">
              <Users className="h-7 w-7 text-sage-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-sage-800">{t('community.title')}</h1>
          <p className="text-sm text-sage-600 font-medium">{t('community.subtitle')}</p>
        </header>

        {/* Composer */}
        <CommunityComposer onSubmit={handlePost} isSubmitting={isPosting} />

        {/* Feed */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sage-500 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">{t('community.feed.loading')}</span>
          </div>
        ) : isError ? (
          <p className="text-center text-sm text-red-400 bg-red-50 rounded-xl px-4 py-3">
            {t('community.errors.loadFailed')}
          </p>
        ) : allPosts.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-3xl">🌿</p>
            <p className="text-sm text-sage-500">{t('community.feed.empty')}</p>
          </div>
        ) : (
          <section className="space-y-4">
            {allPosts.map((post) => (
              <CommunityPostCard key={post.id} post={post} />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-1" />

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-sage-400" />
              </div>
            )}

            {!hasNextPage && allPosts.length > 0 && (
              <p className="text-center text-xs text-slate-300 py-2">· · ·</p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
