import { Link } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Flame,
  Gamepad2,
  Leaf,
  LogOut,
  MessageCircle,
  Users,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { useLogout } from '../hooks/useAuth';
import { useDashboardStats } from '../hooks/useDashboard';
import { MoodHeatmap } from '../components/dashboard/MoodHeatmap';
import { MoodTrendChart } from '../components/dashboard/MoodTrendChart';
import { WeeklyPlanCard } from '../components/dashboard/WeeklyPlanCard';

// Static route/style data (no translatable strings here)
const NAV_ROUTES = [
  { to: '/mood',      icon: Activity,      labelKey: 'dashboard.nav.moodLabel',      descKey: 'dashboard.nav.moodDesc',      bg: 'bg-eira-100',   iconColor: 'text-eira-600'   },
  { to: '/journal',   icon: BookOpen,      labelKey: 'dashboard.nav.journalLabel',   descKey: 'dashboard.nav.journalDesc',   bg: 'bg-violet-100', iconColor: 'text-violet-600' },
  { to: '/chat',      icon: MessageCircle, labelKey: 'dashboard.nav.chatLabel',      descKey: 'dashboard.nav.chatDesc',      bg: 'bg-sky-100',    iconColor: 'text-sky-600'    },
  { to: '/community', icon: Users,         labelKey: 'dashboard.nav.communityLabel', descKey: 'dashboard.nav.communityDesc', bg: 'bg-amber-100',  iconColor: 'text-amber-600'  },
  { to: '/games',     icon: Gamepad2,      labelKey: 'dashboard.nav.gamesLabel',     descKey: 'dashboard.nav.gamesDesc',     bg: 'bg-rose-100',   iconColor: 'text-rose-600'   },
] as const;

const RING_RADIUS = 38;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Stagger animation variants for nav card container
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

// Individual card animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Dashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();
  const shouldReduce = useReducedMotion();
  const { data: dashboardStats } = useDashboardStats();

  const score = user?.wellnessScore ?? 0;
  const ringOffset = RING_CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-stone-100 bg-[#faf9f7]/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-eira-100">
              <Leaf className="h-4 w-4 text-eira-600" />
            </div>
            <span className="font-bold text-eira-800">Eira</span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user && (
              <span className="hidden text-sm font-medium text-slate-600 sm:block">
                {user.name}
              </span>
            )}
            <button
              onClick={() => logout()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label={t('dashboard.logoutAriaLabel')}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Wellness hero */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-eira-500 via-eira-600 to-eira-800 p-8 text-white">
          {/* Decorative orbs */}
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-10 left-8 h-52 w-52 rounded-full bg-eira-900/30 blur-xl" />

          <div className="relative flex items-center justify-between gap-6">
            {/* Left text */}
            <div className="flex-1">
              <p className="mb-1 text-sm font-medium text-eira-200">{t('dashboard.greeting')}</p>
              <h1 className="text-3xl font-bold">
                {user?.name ?? t('dashboard.defaultUser')}
              </h1>
              <p className="mt-2 text-eira-100/80">{t('dashboard.question')}</p>

              {user && (
                <div className="mt-5 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                    <Flame className="h-3.5 w-3.5 text-amber-300" />
                    <span className="text-xs font-semibold">
                      {t('dashboard.streakDays', { count: user.streakDays })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Wellness ring */}
            {user && (
              <div className="shrink-0">
                <div className="relative h-28 w-28">
                  <svg
                    className="h-28 w-28 -rotate-90"
                    viewBox="0 0 100 100"
                    aria-label={t('dashboard.wellnessAriaLabel', { score })}
                    role="img"
                  >
                    {/* Track */}
                    <circle
                      cx="50"
                      cy="50"
                      r={RING_RADIUS}
                      className="stroke-white/15"
                      strokeWidth="7"
                      fill="none"
                    />
                    {/* Progress — animated with Motion (replaces static style prop) */}
                    <motion.circle
                      cx="50"
                      cy="50"
                      r={RING_RADIUS}
                      className="stroke-white"
                      strokeWidth="7"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                      animate={shouldReduce ? {} : { strokeDashoffset: ringOffset }}
                      transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] as const }}
                      // EXCEPCION: strokeDashoffset must use Motion animate, not Tailwind
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <NumberFlow
                      value={score}
                      className="text-2xl font-bold text-white tabular-nums leading-none"
                      transformTiming={{ duration: 800, easing: 'ease-out' }}
                    />
                    <span className="mt-0.5 text-xs text-eira-200">{t('dashboard.wellnessLabel')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features section */}
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
          {t('dashboard.sectionTitle')}
        </h2>

        <motion.div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {NAV_ROUTES.map(({ to, icon: Icon, labelKey, descKey, bg, iconColor }) => (
            <Link key={to} to={to}>
              <motion.div
                variants={cardVariants}
                whileHover={shouldReduce ? {} : { y: -2, scale: 1.01 }}
                className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-colors hover:border-eira-200 hover:shadow-md"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}
                >
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <p className="font-semibold text-slate-800">{t(labelKey)}</p>
                <p className="mt-0.5 text-xs text-slate-500">{t(descKey)}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Daily call-to-action */}
        <Link to="/mood">
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-eira-100 bg-eira-50 px-6 py-4 transition-colors hover:bg-eira-100/50">
            <div>
              <p className="font-semibold text-eira-800">{t('dashboard.dailyTitle')}</p>
              <p className="text-sm text-eira-600/70">{t('dashboard.dailySubtitle')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-eira-500">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </div>
        </Link>

        {/* Dashboard stats section */}
        {dashboardStats && (
          <div className="mt-10 flex flex-col gap-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-warm-400">
              {t('dashboard.stats.sectionTitle')}
            </h2>
            <MoodHeatmap data={dashboardStats.moodHeatmap} />
            <MoodTrendChart data={dashboardStats.moodTrend} />
            <WeeklyPlanCard plan={dashboardStats.weeklyPlan} />
          </div>
        )}
      </main>
    </div>
  );
}
