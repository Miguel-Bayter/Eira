import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../hooks/useAuth';
import { loginSchema, type LoginFormData } from '../schemas/auth.schema';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

/** Translate a Zod validation key (e.g. "validation.email.invalid") at display time.
 * Uses `as never` to satisfy strict i18next key types for runtime-dynamic keys. */
function useValidationT() {
  const { t } = useTranslation();
  return (key: string | undefined): string | undefined => (key ? t(key as never) : undefined);
}

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tv = useValidationT();
  const { mutateAsync: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
    void navigate('/dashboard');
  };

  // Motivation stats shown on the left panel
  const motivationStats = [
    { icon: Heart, label: t('auth.login.stat1Label'), desc: t('auth.login.stat1Desc') },
    { icon: Star, label: t('auth.login.stat2Label'), desc: t('auth.login.stat2Desc') },
    { icon: ArrowRight, label: t('auth.login.stat3Label'), desc: t('auth.login.stat3Desc') },
  ];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      {/* Left panel: branding (desktop only) */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-eira-600 via-eira-700 to-eira-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Decorative orbs */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-eira-400/20 blur-3xl" />
        <div className="absolute bottom-0 -left-16 h-80 w-80 rounded-full bg-eira-900/40 blur-3xl" />
        <div className="absolute top-1/2 right-8 h-48 w-48 rounded-full bg-eira-500/20 blur-2xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-1">
          <img
            src="/icon.png"
            alt="Eira"
            className="h-16 w-16 rounded-2xl drop-shadow-lg -translate-y-1"
          />
          <span className="brand-name-hero text-white">Eira</span>
        </div>

        {/* Central content */}
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight text-white whitespace-pre-line">
            {t('auth.login.panelHeading')}
          </h2>
          <p className="mt-4 text-lg text-eira-200/80">{t('auth.login.panelSubtitle')}</p>

          {/* Motivation cards */}
          <div className="mt-10 space-y-4">
            {motivationStats.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-eira-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-eira-300/80">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-eira-400/70">{t('auth.login.footer')}</p>
      </div>

      {/* Right panel: form */}
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#faf9f7] px-6 py-12 lg:min-h-0">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <img src="/icon.png" alt="Eira" className="h-10 w-10 rounded-lg" />
          <span className="brand-name">Eira</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">{t('auth.login.formTitle')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('auth.login.formSubtitle')}</p>
          </div>

          {error && (
            <div
              className="mb-6 rounded-xl border border-crisis-100 bg-crisis-50 px-4 py-3"
              role="alert"
            >
              <p className="text-sm text-crisis-700">{error.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label={t('auth.login.emailLabel')}
              type="email"
              placeholder="ana@example.com"
              autoComplete="email"
              error={tv(errors.email?.message)}
              {...register('email')}
            />

            <Input
              label={t('auth.login.passwordLabel')}
              type="password"
              placeholder={t('auth.login.passwordPlaceholder')}
              autoComplete="current-password"
              error={tv(errors.password?.message)}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isPending}
              className="w-full rounded-xl"
            >
              {t('auth.login.submitButton')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="font-semibold text-eira-600 hover:text-eira-700">
              {t('auth.login.registerLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
