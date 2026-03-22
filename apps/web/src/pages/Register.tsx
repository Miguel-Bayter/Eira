import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Leaf, Shield, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRegister } from '../hooks/useAuth';
import { registerSchema, type RegisterFormData } from '../schemas/auth.schema';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

/** Translate a Zod validation key (e.g. "validation.name.minLength") at display time.
 * Uses `as never` to satisfy strict i18next key types for runtime-dynamic keys. */
function useValidationT() {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (key: string | undefined): string | undefined =>
    key ? t(key as never) : undefined;
}

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tv = useValidationT();
  const { mutateAsync: register, isPending, error } = useRegister();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    await register(data);
    void navigate('/dashboard');
  };

  // Feature list shown on the left panel
  const features = [
    { icon: Sparkles, text: t('auth.register.feature1') },
    { icon: Shield, text: t('auth.register.feature2') },
    { icon: CheckCircle2, text: t('auth.register.feature3') },
  ];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left panel: branding (desktop only) */}
      <div aria-hidden="true" className="relative hidden overflow-hidden bg-gradient-to-br from-eira-600 via-eira-700 to-eira-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Decorative orbs */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-eira-400/20 blur-3xl" />
        <div className="absolute bottom-0 -left-16 h-80 w-80 rounded-full bg-eira-900/40 blur-3xl" />
        <div className="absolute top-1/2 right-8 h-48 w-48 rounded-full bg-eira-500/20 blur-2xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Leaf className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Central content */}
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight text-white whitespace-pre-line">
            {t('auth.register.panelHeading')}
          </h2>
          <p className="mt-4 text-lg text-eira-200/80">
            {t('auth.register.panelSubtitle')}
          </p>

          <ul className="mt-10 space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-eira-200" />
                </div>
                <span className="text-sm text-eira-100/90">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-eira-400/70">
          {t('auth.register.footer')}
        </p>
      </div>

      {/* Right panel: form */}
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 lg:min-h-0">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-eira-100">
            <Leaf className="h-4 w-4 text-eira-600" />
          </div>
          <span className="text-lg font-bold text-eira-800">Eira</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">{t('auth.register.formTitle')}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t('auth.register.formSubtitle')}
            </p>
          </div>

          {/* Global error */}
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
              label={t('auth.register.nameLabel')}
              type="text"
              placeholder={t('auth.register.namePlaceholder')}
              autoComplete="name"
              error={tv(errors.name?.message)}
              {...formRegister('name')}
            />

            <Input
              label={t('auth.register.emailLabel')}
              type="email"
              placeholder="ana@example.com"
              autoComplete="email"
              error={tv(errors.email?.message)}
              {...formRegister('email')}
            />

            <Input
              label={t('auth.register.passwordLabel')}
              type="password"
              placeholder={t('auth.register.passwordPlaceholder')}
              autoComplete="new-password"
              error={tv(errors.password?.message)}
              {...formRegister('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isPending}
              className="w-full rounded-xl"
            >
              {t('auth.register.submitButton')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {t('auth.register.hasAccount')}{' '}
            <Link
              to="/login"
              className="font-semibold text-eira-600 hover:text-eira-700"
            >
              {t('auth.register.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
