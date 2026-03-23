import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface BreathingGameProps {
  onComplete: (durationSeconds: number) => void;
}

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'done';

const CYCLE_SEQUENCE: { phase: Exclude<Phase, 'idle' | 'done'>; durationMs: number }[] = [
  { phase: 'inhale', durationMs: 4000 },
  { phase: 'hold', durationMs: 7000 },
  { phase: 'exhale', durationMs: 8000 },
];

const TOTAL_CYCLES = 5;

export function BreathingGame({ onComplete }: BreathingGameProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('idle');
  const [cycle, setCycle] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seqIndexRef = useRef(0);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const runPhase = useCallback(
    (seqIndex: number, currentCycle: number) => {
      if (seqIndex >= CYCLE_SEQUENCE.length) {
        const nextCycle = currentCycle + 1;
        if (nextCycle >= TOTAL_CYCLES) {
          setPhase('done');
          const elapsed = startTimeRef.current
            ? Math.round((Date.now() - startTimeRef.current) / 1000)
            : 0;
          onComplete(elapsed);
          return;
        }
        setCycle(nextCycle);
        seqIndexRef.current = 0;
        runPhase(0, nextCycle);
        return;
      }
      const { phase: p, durationMs } = CYCLE_SEQUENCE[seqIndex];
      setPhase(p);
      setCountdown(Math.round(durationMs / 1000));

      const tick = (remaining: number) => {
        if (remaining <= 0) {
          seqIndexRef.current = seqIndex + 1;
          runPhase(seqIndex + 1, currentCycle);
          return;
        }
        timerRef.current = setTimeout(() => {
          setCountdown(remaining - 1);
          tick(remaining - 1);
        }, 1000);
      };
      tick(Math.round(durationMs / 1000));
    },
    [onComplete],
  );

  const start = () => {
    startTimeRef.current = Date.now();
    setCycle(0);
    seqIndexRef.current = 0;
    setIsPaused(false);
    runPhase(0, 0);
  };

  const pause = () => {
    clearTimer();
    setIsPaused(true);
  };

  const resume = () => {
    setIsPaused(false);
    runPhase(seqIndexRef.current, cycle);
  };

  useEffect(() => () => clearTimer(), []);

  const circleScale =
    phase === 'inhale' ? 1.6 : phase === 'hold' ? 1.6 : phase === 'exhale' ? 1 : 1;
  const phaseLabel =
    phase === 'idle'
      ? t('games.breathing.ready')
      : phase === 'inhale'
        ? t('games.breathing.inhale')
        : phase === 'hold'
          ? t('games.breathing.hold')
          : phase === 'exhale'
            ? t('games.breathing.exhale')
            : t('games.breathing.done');

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <p className="text-sm font-medium text-teal-600 uppercase tracking-widest">
          {t('games.breathing.cycle', { current: cycle + 1, total: TOTAL_CYCLES })}
        </p>
      </div>

      <div className="relative flex items-center justify-center">
        <motion.div
          className="h-40 w-40 rounded-full bg-teal-100"
          animate={{ scale: circleScale }}
          transition={{
            duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 8 : 0.3,
            ease: 'easeInOut',
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="text-3xl font-bold text-teal-700">
            {phase !== 'idle' && phase !== 'done' ? countdown : ''}
          </span>
          <span className="text-sm font-medium text-teal-600">{phaseLabel}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'done' ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-teal-700 font-medium"
          >
            {t('games.breathing.completed')}
          </motion.p>
        ) : (
          <motion.div key="controls" className="flex gap-3">
            {phase === 'idle' ? (
              <button
                className="rounded-2xl bg-teal-600 px-8 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
                onClick={start}
              >
                {t('games.start')}
              </button>
            ) : isPaused ? (
              <button
                className="rounded-2xl bg-teal-600 px-8 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
                onClick={resume}
              >
                {t('games.resume')}
              </button>
            ) : (
              <button
                className="rounded-2xl border border-teal-300 px-8 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-colors"
                onClick={pause}
              >
                {t('games.pause')}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
