import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

const MOOD_LABELS: Record<number, string> = {
  1: 'Muy mal',
  2: 'Muy mal',
  3: 'Mal',
  4: 'Algo bajo',
  5: 'Neutro',
  6: 'Bien',
  7: 'Bastante bien',
  8: 'Muy bien',
  9: 'Excelente',
  10: 'Extraordinario',
};

interface MoodSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function MoodSlider({ value, onChange }: MoodSliderProps) {
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

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-700">¿Cómo te sientes ahora?</span>
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
        aria-label="Estado de ánimo"
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
          aria-label={`Estado de ánimo: ${value} - ${MOOD_LABELS[value] ?? ''}`}
        />
      </SliderPrimitive.Root>

      <p className={cn('text-center text-base font-semibold', scoreColor)}>
        {MOOD_LABELS[value]}
      </p>

      <div className="flex justify-between text-xs text-slate-400">
        <span>Muy mal</span>
        <span>Neutro</span>
        <span>Extraordinario</span>
      </div>
    </div>
  );
}
