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
import { useAuthStore } from '../store/authStore';

const NAV_CARDS = [
  {
    to: '/mood',
    icon: Activity,
    label: 'Mood Tracker',
    desc: 'Registra cómo te sientes',
    bg: 'bg-eira-100',
    iconColor: 'text-eira-600',
  },
  {
    to: '/journal',
    icon: BookOpen,
    label: 'Diario',
    desc: 'Escribe y analiza con IA',
    bg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    to: '/chat',
    icon: MessageCircle,
    label: 'Chat IA',
    desc: 'Habla con Eira',
    bg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  {
    to: '/community',
    icon: Users,
    label: 'Comunidad',
    desc: 'Apoyo anónimo',
    bg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    to: '/games',
    icon: Gamepad2,
    label: 'Juegos',
    desc: 'Ejercicios terapéuticos',
    bg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
] as const;

const RING_RADIUS = 38;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const score = user?.wellnessScore ?? 0;
  const ringOffset = RING_CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top nav ── */}
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-eira-100">
              <Leaf className="h-4 w-4 text-eira-600" />
            </div>
            <span className="font-bold text-eira-800">Eira</span>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden text-sm font-medium text-slate-600 sm:block">
                {user.name}
              </span>
            )}
            <button
              onClick={logout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* ── Hero de bienestar ── */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-eira-500 via-eira-600 to-eira-800 p-8 text-white">
          {/* Orbs decorativos */}
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-10 left-8 h-52 w-52 rounded-full bg-eira-900/30 blur-xl" />

          <div className="relative flex items-center justify-between gap-6">
            {/* Texto izquierda */}
            <div className="flex-1">
              <p className="mb-1 text-sm font-medium text-eira-200">Buenos días</p>
              <h1 className="text-3xl font-bold">
                {user?.name ?? 'Usuario'}
              </h1>
              <p className="mt-2 text-eira-100/80">¿Cómo te encuentras hoy?</p>

              {user && (
                <div className="mt-5 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                    <Flame className="h-3.5 w-3.5 text-amber-300" />
                    <span className="text-xs font-semibold">
                      {user.streakDays} días de racha
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Anillo de bienestar */}
            {user && (
              <div className="shrink-0">
                <div className="relative h-28 w-28">
                  <svg
                    className="h-28 w-28 -rotate-90"
                    viewBox="0 0 100 100"
                    aria-label={`Puntuación de bienestar: ${score} de 100`}
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
                    {/* Progress */}
                    <circle
                      cx="50"
                      cy="50"
                      r={RING_RADIUS}
                      className="stroke-white transition-all duration-700"
                      strokeWidth="7"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      style={{ strokeDashoffset: ringOffset }} // EXCEPCION: valor continuo dinámico
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold leading-none">{score}</span>
                    <span className="mt-0.5 text-xs text-eira-200">bienestar</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Sección de funciones ── */}
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Tu espacio
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {NAV_CARDS.map(({ to, icon: Icon, label, desc, bg, iconColor }) => (
            <Link key={to} to={to}>
              <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-eira-200 hover:shadow-md">
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}
                >
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <p className="font-semibold text-slate-800">{label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Llamada a la acción diaria ── */}
        <Link to="/mood">
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-eira-100 bg-eira-50 px-6 py-4 transition-colors hover:bg-eira-100/50">
            <div>
              <p className="font-semibold text-eira-800">Registro de hoy</p>
              <p className="text-sm text-eira-600/70">¿Ya registraste tu estado de ánimo?</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-eira-500">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}
