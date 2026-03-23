import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
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
  colorClass: string;
}

const GAMES: GameCard[] = [
  {
    type: 'breathing',
    emoji: '🌬️',
    titleKey: 'games.breathing.title',
    benefitKey: 'games.breathing.benefit',
    colorClass: 'from-teal-50 to-cyan-50 border-teal-200',
  },
  {
    type: 'bubble_pop',
    emoji: '🫧',
    titleKey: 'games.bubblePop.title',
    benefitKey: 'games.bubblePop.benefit',
    colorClass: 'from-sky-50 to-blue-50 border-sky-200',
  },
  {
    type: 'zen_garden',
    emoji: '🪴',
    titleKey: 'games.zenGarden.title',
    benefitKey: 'games.zenGarden.benefit',
    colorClass: 'from-amber-50 to-yellow-50 border-amber-200',
  },
  {
    type: 'coloring',
    emoji: '🎨',
    titleKey: 'games.coloring.title',
    benefitKey: 'games.coloring.benefit',
    colorClass: 'from-purple-50 to-violet-50 border-purple-200',
  },
];

export default function Games() {
  const { t } = useTranslation();
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [lastResult, setLastResult] = useState<{ points: number; score: number } | null>(null);
  const recordSession = useRecordGameSession();

  const handleComplete = (gameType: GameType) => async (durationSeconds: number) => {
    const result = await recordSession.mutateAsync({ gameType, durationSeconds });
    setLastResult({ points: result.wellnessPointsEarned, score: result.newWellnessScore });
    setActiveGame(null);
  };

  const activeCard = GAMES.find((g) => g.type === activeGame);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <BackToDashboardLink />

        <div className="mt-6 mb-8 text-center">
          <h1 className="text-2xl font-bold text-teal-800">{t('games.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('games.subtitle')}</p>
        </div>

        {/* Points earned banner */}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mb-6 rounded-2xl bg-teal-600 px-6 py-4 text-center text-white"
            >
              <p className="text-lg font-semibold">
                +{lastResult.points} {t('games.pointsEarned')}
              </p>
              <p className="text-sm text-teal-100">
                {t('games.newScore', { score: lastResult.score })}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active game modal */}
        <AnimatePresence>
          {activeGame && activeCard && (
            <motion.div
              key={activeGame}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="mb-8 rounded-3xl bg-white p-6 shadow-lg border border-slate-100"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-teal-800">
                  {activeCard.emoji} {t(activeCard.titleKey)}
                </h2>
                <button
                  onClick={() => setActiveGame(null)}
                  className="rounded-xl px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  {t('games.exit')}
                </button>
              </div>

              <Suspense
                fallback={
                  <div className="flex h-40 items-center justify-center text-teal-600">
                    {t('common.loading')}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {GAMES.map((game, i) => (
            <motion.button
              key={game.type}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -2 }}
              onClick={() => {
                setLastResult(null);
                setActiveGame(game.type);
              }}
              disabled={activeGame !== null}
              className={`rounded-3xl border bg-gradient-to-br ${game.colorClass} p-6 text-left transition-shadow hover:shadow-md disabled:opacity-50`}
            >
              <span className="text-3xl">{game.emoji}</span>
              <h3 className="mt-3 font-semibold text-slate-800">{t(game.titleKey)}</h3>
              <p className="mt-1 text-sm text-slate-500">{t(game.benefitKey)}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
