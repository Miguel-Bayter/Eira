import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { EmotionValue } from '@/schemas/mood.schema';

// Emotion list with value and emoji — labels come from i18n
const EMOTION_LIST: { value: EmotionValue; emoji: string }[] = [
  { value: 'alegre',       emoji: '😊' },
  { value: 'tranquilo',    emoji: '😌' },
  { value: 'agradecido',   emoji: '🙏' },
  { value: 'esperanzador', emoji: '✨' },
  { value: 'motivado',     emoji: '💪' },
  { value: 'ansioso',      emoji: '😰' },
  { value: 'triste',       emoji: '😔' },
  { value: 'enojado',      emoji: '😠' },
  { value: 'frustrado',    emoji: '😤' },
  { value: 'cansado',      emoji: '😴' },
  { value: 'confundido',   emoji: '😕' },
  { value: 'solitario',    emoji: '😞' },
  { value: 'abrumado',     emoji: '😩' },
  { value: 'asustado',     emoji: '😨' },
  { value: 'neutral',      emoji: '😐' },
];

interface EmotionSelectorProps {
  value: EmotionValue | '';
  onChange: (emotion: EmotionValue) => void;
  error?: string;
}

export function EmotionSelector({ value, onChange, error }: EmotionSelectorProps) {
  const { t } = useTranslation();
  const shouldReduce = useReducedMotion();

  return (
    <div className="space-y-3">
      <span className="block text-sm font-medium text-slate-700">
        {t('mood.emotions.question')}
      </span>

      <div
        className="grid grid-cols-5 gap-2"
        role="group"
        aria-label={t('mood.emotions.groupAriaLabel')}
      >
        {EMOTION_LIST.map(({ value: emotion, emoji }, index) => {
          const label = t(`mood.emotions.${emotion}`);
          const isSelected = value === emotion;
          return (
            <motion.button
              key={emotion}
              type="button"
              initial={shouldReduce ? {} : { opacity: 0, scale: 0.8 }}
              animate={shouldReduce ? {} : { opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              whileTap={shouldReduce ? {} : { scale: 0.92 }}
              onClick={() => onChange(emotion)}
              aria-pressed={isSelected}
              aria-label={label}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl p-2 text-xs font-medium',
                'transition-all focus:outline-none focus:ring-2 focus:ring-eira-500 focus:ring-offset-1',
                isSelected
                  ? 'bg-eira-100 text-eira-700 ring-2 ring-eira-400'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100',
              )}
            >
              <span className="text-xl leading-none" aria-hidden="true">{emoji}</span>
              <span className="text-center leading-tight">{label}</span>
            </motion.button>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-crisis-600" role="alert">{error}</p>
      )}
    </div>
  );
}
