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

// Full Tailwind class strings so JIT includes them
const PHASE_STYLES: Record<
  Phase,
  { circle: string; ambient: string; ring: string; countText: string; labelText: string }
> = {
  idle: {
    circle: 'from-teal-300/60 to-cyan-200/50',
    ambient: 'bg-teal-200/25',
    ring: 'border-teal-300/30',
    countText: 'text-teal-700',
    labelText: 'text-teal-500',
  },
  inhale: {
    circle: 'from-teal-500 to-emerald-400',
    ambient: 'bg-teal-300/30',
    ring: 'border-teal-400/40',
    countText: 'text-white',
    labelText: 'text-teal-100',
  },
  hold: {
    circle: 'from-violet-400 to-teal-400',
    ambient: 'bg-violet-300/25',
    ring: 'border-violet-400/35',
    countText: 'text-white',
    labelText: 'text-violet-100',
  },
  exhale: {
    circle: 'from-sky-400 to-teal-300',
    ambient: 'bg-sky-300/25',
    ring: 'border-sky-300/35',
    countText: 'text-white',
    labelText: 'text-sky-100',
  },
  done: {
    circle: 'from-emerald-400 to-teal-300',
    ambient: 'bg-emerald-200/30',
    ring: 'border-emerald-300/40',
    countText: 'text-white',
    labelText: 'text-emerald-100',
  },
};

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

  const circleScale = phase === 'inhale' ? 1.55 : phase === 'hold' ? 1.55 : 1;
  const phaseDuration = phase === 'inhale' ? 4 : phase === 'exhale' ? 8 : 0.4;
  const styles = PHASE_STYLES[phase];

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
    <div className="flex flex-col items-center gap-7 py-6">
      {/* Cycle progress dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === cycle && phase !== 'idle' && phase !== 'done' ? 20 : 8,
              opacity: i < cycle ? 1 : i === cycle && phase !== 'idle' ? 1 : 0.35,
            }}
            transition={{ duration: 0.3 }}
            className={`h-2 rounded-full ${i < cycle ? 'bg-teal-400' : 'bg-teal-500'}`}
          />
        ))}
      </div>

      {/* Breathing circle */}
      <div className="relative flex items-center justify-center w-56 h-56">
        {/* Ambient blur glow — largest layer */}
        <motion.div
          className={`absolute inset-0 rounded-full ${styles.ambient} blur-2xl`}
          animate={{ scale: circleScale * 1.25 }}
          transition={{ duration: phaseDuration, ease: 'easeInOut' }}
        />

        {/* Ripple border ring */}
        <motion.div
          className={`absolute inset-3 rounded-full border-2 ${styles.ring}`}
          animate={{ scale: circleScale * 1.07, opacity: phase !== 'idle' ? 0.7 : 0.3 }}
          transition={{ duration: phaseDuration, ease: 'easeInOut' }}
        />

        {/* Main gradient circle */}
        <motion.div
          className={`absolute inset-8 rounded-full bg-gradient-to-br ${styles.circle} shadow-2xl`}
          animate={{ scale: circleScale }}
          transition={{ duration: phaseDuration, ease: 'easeInOut' }}
        />

        {/* Center text */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
          <AnimatePresence mode="wait">
            <motion.span
              key={countdown}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.25 }}
              className={`text-5xl font-bold tabular-nums leading-none ${styles.countText}`}
            >
              {phase !== 'idle' && phase !== 'done' ? countdown : ''}
            </motion.span>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.span
              key={phaseLabel}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25 }}
              className={`text-sm font-semibold tracking-wider uppercase ${styles.labelText}`}
            >
              {phaseLabel}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <AnimatePresence mode="wait">
        {phase === 'done' ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-teal-700 font-semibold"
          >
            {t('games.breathing.completed')}
          </motion.p>
        ) : (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {phase === 'idle' ? (
              <button
                className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-10 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-300/40 hover:shadow-teal-400/50 hover:scale-[1.04] active:scale-[0.97] transition-all duration-200"
                onClick={start}
              >
                {t('games.start')}
              </button>
            ) : isPaused ? (
              <button
                className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-10 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-300/40 hover:shadow-teal-400/50 hover:scale-[1.04] active:scale-[0.97] transition-all duration-200"
                onClick={resume}
              >
                {t('games.resume')}
              </button>
            ) : (
              <button
                className="rounded-full border-2 border-teal-200 bg-white/90 px-10 py-3 text-sm font-semibold text-teal-600 hover:bg-teal-50 hover:border-teal-300 active:scale-[0.97] transition-all duration-200 shadow-sm"
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
