import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Leaf, Shield, Sparkles } from 'lucide-react';
import { useRegister } from '../hooks/useAuth';
import { registerSchema, type RegisterFormData } from '../schemas/auth.schema';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function Register() {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* ── Panel izquierdo: marca (solo escritorio) ── */}
      <div aria-hidden="true" className="relative hidden overflow-hidden bg-gradient-to-br from-eira-600 via-eira-700 to-eira-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Orbs decorativos */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-eira-400/20 blur-3xl" />
        <div className="absolute bottom-0 -left-16 h-80 w-80 rounded-full bg-eira-900/40 blur-3xl" />
        <div className="absolute top-1/2 right-8 h-48 w-48 rounded-full bg-eira-500/20 blur-2xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Leaf className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Contenido central */}
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Tu espacio seguro
            <br />
            de bienestar mental
          </h2>
          <p className="mt-4 text-lg text-eira-200/80">
            Un lugar tranquilo para conocerte mejor, registrar cómo te sientes y crecer cada día.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              { icon: Sparkles, text: 'Análisis emocional con inteligencia artificial' },
              { icon: Shield, text: 'Tu privacidad siempre protegida' },
              { icon: CheckCircle2, text: 'Totalmente gratuito, sin tarjeta de crédito' },
            ].map(({ icon: Icon, text }) => (
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
          © 2026 · Hecho con cuidado para ti
        </p>
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 lg:min-h-0">
        {/* Logo móvil */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-eira-100">
            <Leaf className="h-4 w-4 text-eira-600" />
          </div>
          <span className="text-lg font-bold text-eira-800">Eira</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Crear cuenta</h2>
            <p className="mt-1 text-sm text-slate-500">
              Empieza gratis, sin compromisos.
            </p>
          </div>

          {/* Error global */}
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
              label="Nombre"
              type="text"
              placeholder="Ana García"
              autoComplete="name"
              error={errors.name?.message}
              {...formRegister('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="ana@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...formRegister('email')}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 número"
              autoComplete="new-password"
              error={errors.password?.message}
              {...formRegister('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isPending}
              className="w-full rounded-xl"
            >
              Crear cuenta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-semibold text-eira-600 hover:text-eira-700"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
