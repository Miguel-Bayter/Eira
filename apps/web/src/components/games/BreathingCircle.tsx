import { useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface BreathingPhase {
  readonly labelKey: string;
  readonly duration: number;
  readonly scale: number;
}

const BREATHING_PHASES: readonly BreathingPhase[] = [
  { labelKey: 'games.breathing.inhale', duration: 4, scale: 1.5 },
  { labelKey: 'games.breathing.hold',   duration: 7, scale: 1.5 },
  { labelKey: 'games.breathing.exhale', duration: 8, scale: 1.0 },
] as const;

interface BreathingCircleProps {
  className?: string;
  onCycleComplete?: () => void;
}

export function BreathingCircle({ className, onCycleComplete }: BreathingCircleProps) {
  const { t } = useTranslation();
  const shouldReduce = useReducedMotion();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(BREATHING_PHASES[0].duration);

  const currentPhase = BREATHING_PHASES[phaseIndex];

  const advancePhase = useCallback(() => {
    setPhaseIndex((prev) => {
      const next = (prev + 1) % BREATHING_PHASES.length;
      if (next === 0) onCycleComplete?.();
      return next;
    });
    setCountdown(BREATHING_PHASES[(phaseIndex + 1) % BREATHING_PHASES.length].duration);
  }, [phaseIndex, onCycleComplete]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          advancePhase();
          return currentPhase.duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, advancePhase, currentPhase.duration]);

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      <div className="relative flex items-center justify-center w-48 h-48">
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-eira-200 to-purple-200 opacity-40"
          animate={shouldReduce ? {} : { scale: isRunning ? currentPhase.scale * 0.9 : 1 }}
          transition={{ duration: currentPhase.duration, ease: 'easeInOut' }}
        />
        {/* Main breathing circle */}
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-eira-400 to-eira-600 shadow-lg"
          animate={shouldReduce ? {} : { scale: isRunning ? currentPhase.scale : 1 }}
          transition={{ duration: currentPhase.duration, ease: 'easeInOut' }}
        />
        {/* Center content */}
        <div className="relative z-10 text-center text-white">
          <p className="text-2xl font-bold tabular-nums">{isRunning ? countdown : ''}</p>
          <p className="text-xs font-medium tracking-wide uppercase mt-1">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {isRunning ? t(currentPhase.labelKey as never) : t('games.breathing.ready')}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIsRunning((r) => !r)}
        className={cn(
          'px-6 py-2 rounded-full text-sm font-medium transition-colors',
          isRunning
            ? 'bg-crisis-100 text-crisis-700 hover:bg-crisis-200'
            : 'bg-eira-500 text-white hover:bg-eira-600',
        )}
      >
        {isRunning ? t('games.breathing.stop') : t('games.breathing.start')}
      </button>
    </div>
  );
}
