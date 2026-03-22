import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export function TypingIndicator() {
  const { t } = useTranslation();
  const shouldReduce = useReducedMotion();

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-eira-200 bg-eira-100 text-eira-700 shadow-sm">
        <span className="text-sm font-semibold">AI</span>
      </div>

      <div className="rounded-[24px] border border-eira-100 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2" aria-label={t('chat.typing.ariaLabel')}>
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="h-2.5 w-2.5 rounded-full bg-eira-300"
              animate={shouldReduce ? undefined : { opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: index * 0.14 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
