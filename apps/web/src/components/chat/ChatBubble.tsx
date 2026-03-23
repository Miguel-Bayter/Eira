import { motion, useReducedMotion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChatMessageDto } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  message: ChatMessageDto;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const { t, i18n } = useTranslation();
  const shouldReduce = useReducedMotion();
  const isAssistant = message.role === 'assistant';
  const timestamp = new Date(message.createdAt).toLocaleTimeString(i18n.language, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.article
      initial={shouldReduce ? undefined : { opacity: 0, y: 12 }}
      animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex gap-3', isAssistant ? 'justify-start' : 'justify-end')}
    >
      {isAssistant && (
        <img
          src="/logo.png"
          alt="Eira"
          className="h-10 w-10 shrink-0 rounded-2xl object-cover shadow-sm"
        />
      )}

      <div className={cn('max-w-[88%] space-y-2 sm:max-w-[70%]', !isAssistant && 'items-end')}>
        <div
          className={cn(
            'rounded-[26px] border px-4 py-3.5 shadow-sm',
            isAssistant
              ? 'border-eira-100 bg-white/96 text-slate-700'
              : 'border-eira-600 bg-gradient-to-br from-eira-500 via-eira-600 to-eira-700 text-white',
          )}
        >
          <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
        </div>

        <div
          className={cn(
            'flex items-center gap-2 px-1 text-[11px] font-medium uppercase tracking-[0.22em]',
            isAssistant ? 'text-slate-400' : 'justify-end text-eira-500',
          )}
        >
          {isAssistant && <Sparkles className="h-3 w-3" />}
          <span>
            {isAssistant ? t('chat.conversation.eiraLabel') : t('chat.conversation.youLabel')}
          </span>
          <span className="text-slate-300">•</span>
          <time className="tracking-[0.16em] text-slate-400">{timestamp}</time>
        </div>
      </div>
    </motion.article>
  );
}
