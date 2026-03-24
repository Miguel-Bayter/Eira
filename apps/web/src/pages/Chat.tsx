import { useEffect, useRef, useState } from 'react';
import { HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { CrisisModal } from '@/components/mood/CrisisModal';
import { useChatConversation, useSendChatMessage } from '@/hooks/useChat';
import type { SendChatMessageFormData } from '@/schemas/chat.schema';
import { Button } from '@/components/ui/Button';
import { BackToDashboardLink } from '@/components/ui/BackToDashboardLink';

export default function Chat() {
  const { t } = useTranslation();
  const shouldReduce = useReducedMotion();
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, error } = useChatConversation();
  const { mutateAsync: sendMessage, isPending } = useSendChatMessage();

  const messages = data?.messages ?? [];
  const hasCrisis = data?.crisis.detected ?? false;
  const remainingMessages = data?.remainingMessages ?? 50;
  const isComposerDisabled = remainingMessages === 0;

  useEffect(() => {
    if (typeof bottomRef.current?.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({
        behavior: shouldReduce ? 'auto' : 'smooth',
        block: 'end',
      });
    }
  }, [messages.length, isPending, shouldReduce]);

  const handleSubmit = async (payload: SendChatMessageFormData) => {
    const response = await sendMessage(payload);
    if (response.crisis.detected) {
      setShowCrisisModal(true);
    }
  };

  return (
    <>
      <main className="min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.14),_transparent_30%),linear-gradient(180deg,_#f6fffc_0%,_#fbfffe_34%,_#edf8f4_100%)]">
        <div className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-6 pt-5 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-x-10 top-12 h-40 rounded-full bg-eira-200/20 blur-3xl" />

          <header className="relative z-10">
            <div className="flex flex-col gap-4 rounded-[32px] border border-white/75 bg-white/82 px-5 py-4 shadow-[0_24px_80px_-50px_rgba(15,118,110,0.45)] backdrop-blur-xl sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <BackToDashboardLink />
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-eira-100 bg-eira-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-eira-600">
                      <Sparkles className="h-3.5 w-3.5" />
                      {t('chat.header.badge')}
                    </div>
                    <div>
                      <h1 className="text-[1.75rem] font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
                        {t('chat.header.title')}
                      </h1>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                        {t('chat.header.subtitle')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 rounded-[24px] border border-eira-100/70 bg-eira-50/70 px-4 py-3 text-sm text-slate-600 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-eira-700 shadow-sm">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-eira-700">
                      {t('chat.header.confidentialTitle')}
                    </p>
                    <p className="mt-1 leading-6 text-slate-500">
                      {t('chat.header.confidentialBody')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-eira-700 shadow-sm">
                    <HeartHandshake className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-eira-700">
                      {t('chat.header.limitTitle')}
                    </p>
                    <p className="mt-1 leading-6 text-slate-500">
                      {t('chat.header.limitBody', { count: remainingMessages })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="relative z-10 mt-5 flex min-h-0 flex-1 flex-col rounded-[34px] border border-white/75 bg-white/78 shadow-[0_32px_120px_-60px_rgba(15,118,110,0.4)] backdrop-blur-xl">
            {hasCrisis && (
              <motion.div
                initial={shouldReduce ? undefined : { opacity: 0, y: -8 }}
                animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
                className="mx-4 mt-4 flex flex-col gap-4 rounded-[24px] border border-crisis-200/80 bg-crisis-50/85 px-5 py-4 sm:mx-5 sm:flex-row sm:items-center sm:justify-between"
                role="alert"
              >
                <div>
                  <p className="text-sm font-semibold text-crisis-700">
                    {t('chat.crisis.bannerTitle')}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-crisis-600">
                    {t('chat.crisis.bannerBody')}
                  </p>
                </div>
                <Button variant="danger" size="md" onClick={() => setShowCrisisModal(true)}>
                  {t('chat.crisis.bannerButton')}
                </Button>
              </motion.div>
            )}

            <div className="flex min-h-0 flex-1 flex-col rounded-[30px] bg-[linear-gradient(180deg,_rgba(255,255,255,0.92)_0%,_rgba(241,251,247,0.98)_100%)]">
              {messages.length === 0 && !isLoading ? (
                <div className="mx-auto flex h-full min-h-[380px] max-w-2xl flex-col items-center justify-center px-6 py-10 text-center sm:px-10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-eira-100 bg-eira-50 text-eira-600 shadow-sm">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
                    {t('chat.empty.title')}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
                    {t('chat.empty.body')}
                  </p>
                  <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
                    {['promptOne', 'promptTwo', 'promptThree'].map((key) => (
                      <div
                        key={key}
                        className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-4 text-left shadow-sm"
                      >
                        <p className="text-sm leading-6 text-slate-600">
                          {t(`chat.empty.${key}` as never)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                  <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-end space-y-4">
                    {messages.map((message) => (
                      <ChatBubble key={message.id} message={message} />
                    ))}
                    {isPending && <TypingIndicator />}
                    <div ref={bottomRef} />
                  </div>
                </div>
              )}

              {error && (
                <div
                  className="mx-4 mb-4 rounded-[20px] border border-crisis-100 bg-crisis-50 px-4 py-3 text-sm text-crisis-700 sm:mx-6"
                  role="alert"
                >
                  {t(error.message as never)}
                </div>
              )}

              <ChatComposer
                isPending={isPending}
                disabled={isComposerDisabled}
                remainingMessages={remainingMessages}
                onSubmit={handleSubmit}
              />

              {isComposerDisabled && (
                <p className="border-t border-eira-100/80 px-4 pb-4 text-center text-xs font-medium uppercase tracking-[0.24em] text-amber-600 sm:px-6">
                  {t('chat.composer.limitReached')}
                </p>
              )}
            </div>
          </section>
        </div>
      </main>

      <CrisisModal isOpen={showCrisisModal} onClose={() => setShowCrisisModal(false)} />
    </>
  );
}
