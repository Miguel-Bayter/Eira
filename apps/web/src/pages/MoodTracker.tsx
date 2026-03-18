import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createMoodSchema, type CreateMoodFormData } from '../schemas/mood.schema';
import type { EmotionValue } from '../schemas/mood.schema';
import { useCreateMood, useMoodHistory } from '../hooks/useMood';
import { MoodSlider } from '../components/mood/MoodSlider';
import { EmotionSelector } from '../components/mood/EmotionSelector';
import { CrisisModal } from '../components/mood/CrisisModal';
import { Button } from '../components/ui/Button';

const MAX_ENTRIES_PER_DAY = 5;

export default function MoodTracker() {
  const navigate = useNavigate();
  const { mutateAsync: createMood, isPending, error } = useCreateMood();
  const { data: history } = useMoodHistory();

  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const remainingEntries = MAX_ENTRIES_PER_DAY - (history?.total ?? 0);
  const canSubmit = remainingEntries > 0;

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateMoodFormData>({
    resolver: zodResolver(createMoodSchema),
    defaultValues: {
      score: 5,
      note: '',
    },
  });

  const noteValue = watch('note') ?? '';

  const onSubmit = async (data: CreateMoodFormData) => {
    const result = await createMood(data);
    if (result.isCrisis) {
      setShowCrisisModal(true);
    } else {
      setSubmitted(true);
    }
  };

  const handleCrisisClose = () => {
    setShowCrisisModal(false);
    void navigate('/dashboard');
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-eira-100">
            <CheckCircle2 className="h-10 w-10 text-eira-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">¡Registrado!</h1>
          <p className="mt-2 text-sm text-slate-500">Tu estado de ánimo fue guardado</p>
          <Button
            variant="primary"
            size="lg"
            className="mt-8 w-full rounded-xl"
            onClick={() => void navigate('/dashboard')}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 px-6 py-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <Link
              to="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-base font-bold text-slate-900">Mood Tracker</h1>
              <p className="text-xs text-slate-400">
                {canSubmit
                  ? `${remainingEntries} registro${remainingEntries === 1 ? '' : 's'} restante${remainingEntries === 1 ? '' : 's'} hoy`
                  : 'Límite diario alcanzado'}
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-xl px-6 py-8">
          {/* Daily limit reached */}
          {!canSubmit && (
            <div
              className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4"
              role="alert"
            >
              <p className="text-sm font-semibold text-amber-800">Límite diario alcanzado</p>
              <p className="mt-1 text-xs text-amber-600">
                Ya registraste {MAX_ENTRIES_PER_DAY} estados de ánimo hoy. Vuelve mañana.
              </p>
            </div>
          )}

          {/* Global error */}
          {error && (
            <div
              className="mb-6 rounded-xl border border-crisis-100 bg-crisis-50 px-4 py-3"
              role="alert"
            >
              <p className="text-sm text-crisis-700">{error.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            {/* Mood Slider */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <Controller
                name="score"
                control={control}
                render={({ field }) => (
                  <MoodSlider
                    value={field.value ?? 5}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.score && (
                <p className="mt-2 text-xs text-crisis-600" role="alert">
                  {errors.score.message}
                </p>
              )}
            </div>

            {/* Emotion Selector */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <Controller
                name="emotion"
                control={control}
                render={({ field }) => (
                  <EmotionSelector
                    value={(field.value as EmotionValue | undefined) ?? ''}
                    onChange={field.onChange}
                    error={errors.emotion?.message}
                  />
                )}
              />
            </div>

            {/* Note */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <label
                    htmlFor="mood-note"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Nota (opcional)
                  </label>
                  <span className="text-xs text-slate-400">
                    {noteValue.length}/500
                  </span>
                </div>
                <textarea
                  id="mood-note"
                  rows={4}
                  placeholder="¿Qué está pasando hoy? ¿Hay algo que quieras recordar?"
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-eira-500 focus:outline-none focus:ring-2 focus:ring-eira-500 focus:ring-offset-1"
                  {...register('note')}
                />
                {errors.note && (
                  <p className="text-xs text-crisis-600" role="alert">
                    {errors.note.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isPending}
              disabled={!canSubmit}
              className="w-full rounded-xl"
            >
              Guardar registro
            </Button>
          </form>
        </main>
      </div>

      <CrisisModal isOpen={showCrisisModal} onClose={handleCrisisClose} />
    </>
  );
}
