import { useState, lazy, Suspense, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import { BackToDashboardLink } from '@/components/ui/BackToDashboardLink';
import { BreathingGame } from '@/components/games/BreathingGame';
import { useRecordGameSession, type GameType } from '@/hooks/useGames';

const BubblePopGame = lazy(() =>
  import('@/components/games/BubblePopGame').then((m) => ({ default: m.BubblePopGame })),
);
const ZenGardenGame = lazy(() =>
  import('@/components/games/ZenGardenGame').then((m) => ({ default: m.ZenGardenGame })),
);
const ColoringGame = lazy(() =>
  import('@/components/games/ColoringGame').then((m) => ({ default: m.ColoringGame })),
);

interface GameCard {
  type: GameType;
  emoji: string;
  titleKey: string;
  benefitKey: string;
  points: number;
  gradient: string;
  bg: string;
  topBorder: string;
  hoverBg: string;
}

const GAMES: GameCard[] = [
  {
    type: 'breathing',
    emoji: '🌬️',
    titleKey: 'games.breathing.title',
    benefitKey: 'games.breathing.benefit',
    points: 5,
    gradient: 'from-teal-400 to-cyan-500',
    bg: 'bg-teal-50',
    topBorder: 'border-t-teal-500',
    hoverBg: 'hover:bg-teal-100/50',
  },
  {
    type: 'bubble_pop',
    emoji: '🫧',
    titleKey: 'games.bubblePop.title',
    benefitKey: 'games.bubblePop.benefit',
    points: 3,
    gradient: 'from-sky-400 to-blue-500',
    bg: 'bg-sky-50',
    topBorder: 'border-t-sky-500',
    hoverBg: 'hover:bg-sky-100/50',
  },
  {
    type: 'zen_garden',
    emoji: '🪴',
    titleKey: 'games.zenGarden.title',
    benefitKey: 'games.zenGarden.benefit',
    points: 4,
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    topBorder: 'border-t-amber-500',
    hoverBg: 'hover:bg-amber-100/50',
  },
  {
    type: 'coloring',
    emoji: '🎨',
    titleKey: 'games.coloring.title',
    benefitKey: 'games.coloring.benefit',
    points: 4,
    gradient: 'from-purple-400 to-violet-500',
    bg: 'bg-purple-50',
    topBorder: 'border-t-purple-500',
    hoverBg: 'hover:bg-purple-100/50',
  },
];

function fireConfetti() {
  void confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#0d9488', '#14b8a6', '#5eead4', '#99f6e4', '#ffffff'],
  });
}

export default function Games() {
  const { t } = useTranslation();
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [lastResult, setLastResult] = useState<{ points: number; score: number } | null>(null);
  const recordSession = useRecordGameSession();

  const handleComplete = useCallback(
    (gameType: GameType) => async (durationSeconds: number) => {
      try {
        const result = await recordSession.mutateAsync({ gameType, durationSeconds });
        setLastResult({ points: result.wellnessPointsEarned, score: result.newWellnessScore });
        fireConfetti();
      } finally {
        setActiveGame(null);
      }
    },
    [recordSession],
  );

  const activeCard = GAMES.find((g) => g.type === activeGame);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <BackToDashboardLink />

        <div className="mt-6 mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800">{t('games.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('games.subtitle')}</p>
        </div>

        {/* Points earned banner */}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4 text-center text-white shadow-lg shadow-teal-200"
            >
              <p className="text-xl font-bold">
                🎉 +{lastResult.points} {t('games.pointsEarned')}
              </p>
              <p className="mt-0.5 text-sm text-teal-100">
                {t('games.newScore', { score: lastResult.score })}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {GAMES.map((game, i) => (
            <Dialog.Root
              key={game.type}
              open={activeGame === game.type}
              onOpenChange={(open) => {
                if (open) {
                  setLastResult(null);
                  setActiveGame(game.type);
                } else {
                  setActiveGame(null);
                }
              }}
            >
              <Dialog.Trigger asChild>
                <motion.button
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group rounded-3xl border border-t-4 ${game.topBorder} border-slate-100 ${game.bg} ${game.hoverBg} p-5 text-left shadow-sm transition-all duration-200 hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{game.emoji}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-sm">
                      +{game.points} pts
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-800">
                    {(t as (k: string) => string)(game.titleKey)}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {(t as (k: string) => string)(game.benefitKey)}
                  </p>

                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-400 group-hover:text-teal-600 transition-colors">
                    <span>{t('games.tapToPlay')}</span>
                    <span>→</span>
                  </div>
                </motion.button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                {/* overflow-hidden clips the gradient strip cleanly to the rounded corners */}
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-0 shadow-2xl outline-none overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 max-h-[90vh]">
                  {/* Gradient strip — no rounded-t needed, parent overflow-hidden handles it */}
                  <div
                    className={`h-1.5 w-full bg-gradient-to-r ${activeCard?.gradient ?? 'from-teal-400 to-cyan-500'}`}
                  />

                  {/* Inner scrollable area */}
                  <div className="overflow-y-auto max-h-[calc(90vh-6px)]">
                    <div className="flex items-center justify-between px-6 pt-5 pb-2">
                      <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                        <span>{activeCard?.emoji}</span>
                        <span>
                          {activeCard ? (t as (k: string) => string)(activeCard.titleKey) : ''}
                        </span>
                      </Dialog.Title>
                      <Dialog.Close className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </Dialog.Close>
                    </div>

                    <div className="px-6 pb-6">
                      <Suspense
                        fallback={
                          <div className="flex h-40 items-center justify-center text-teal-600">
                            <span className="animate-pulse">{t('common.loading')}</span>
                          </div>
                        }
                      >
                        {activeGame === 'breathing' && (
                          <BreathingGame onComplete={handleComplete('breathing')} />
                        )}
                        {activeGame === 'bubble_pop' && (
                          <BubblePopGame onComplete={handleComplete('bubble_pop')} />
                        )}
                        {activeGame === 'zen_garden' && (
                          <ZenGardenGame onComplete={handleComplete('zen_garden')} />
                        )}
                        {activeGame === 'coloring' && (
                          <ColoringGame onComplete={handleComplete('coloring')} />
                        )}
                      </Suspense>
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          ))}
        </div>
      </div>
    </div>
  );
}
