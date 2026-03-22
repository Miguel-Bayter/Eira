import * as SliderPrimitive from '@radix-ui/react-slider';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// Mapping from numeric score to translation key — all keys exist in en.json
const MOOD_LABEL_KEYS = {
  1: 'mood.slider.labels.1',
  2: 'mood.slider.labels.2',
  3: 'mood.slider.labels.3',
  4: 'mood.slider.labels.4',
  5: 'mood.slider.labels.5',
  6: 'mood.slider.labels.6',
  7: 'mood.slider.labels.7',
  8: 'mood.slider.labels.8',
  9: 'mood.slider.labels.9',
  10: 'mood.slider.labels.10',
} as const;

type MoodLabelKey = typeof MOOD_LABEL_KEYS[keyof typeof MOOD_LABEL_KEYS];

interface MoodSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function MoodSlider({ value, onChange }: MoodSliderProps) {
  const { t } = useTranslation();

  const isCrisis = value <= 3;
  const isLow = value >= 4 && value <= 5;
  const isHigh = value >= 8;

  const scoreColor = isCrisis
    ? 'text-crisis-600'
    : isLow
      ? 'text-amber-500'
      : isHigh
        ? 'text-eira-700'
        : 'text-eira-600';

  const trackColor = isCrisis
    ? 'bg-crisis-400'
    : isLow
      ? 'bg-amber-400'
      : 'bg-eira-500';

  const thumbColor = isCrisis
    ? 'bg-crisis-500 border-crisis-300'
    : isLow
      ? 'bg-amber-500 border-amber-300'
      : 'bg-eira-500 border-eira-300';

  const labelKey: MoodLabelKey = (MOOD_LABEL_KEYS as Record<number, MoodLabelKey>)[value] ?? 'mood.slider.labels.5';
  const currentLabel = t(labelKey);

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-700">{t('mood.slider.question')}</span>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-3xl font-bold tabular-nums', scoreColor)}>{value}</span>
          <span className="text-sm text-slate-400">/10</span>
        </div>
      </div>

      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center py-2"
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={(vals) => {
          if (vals[0] !== undefined) onChange(vals[0]);
        }}
        aria-label={t('mood.slider.ariaLabel')}
      >
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-slate-100">
          <SliderPrimitive.Range className={cn('absolute h-full transition-all duration-200', trackColor)} />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block h-6 w-6 rounded-full border-2 shadow-md',
            'focus:outline-none focus:ring-2 focus:ring-eira-400 focus:ring-offset-2',
            'transition-transform hover:scale-110 active:scale-95',
            thumbColor,
          )}
          aria-label={t('mood.slider.thumbAriaLabel', { value, label: currentLabel })}
        />
      </SliderPrimitive.Root>

      <p className={cn('text-center text-base font-semibold', scoreColor)}>
        {currentLabel}
      </p>

      <div className="flex justify-between text-xs text-slate-400">
        <span>{t('mood.slider.scaleMin')}</span>
        <span>{t('mood.slider.scaleMid')}</span>
        <span>{t('mood.slider.scaleMax')}</span>
      </div>
    </div>
  );
}
