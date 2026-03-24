import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createMoodSchema, type CreateMoodFormData } from '../schemas/mood.schema';
import type { EmotionValue } from '../schemas/mood.schema';
import { useCreateMood, useMoodHistory } from '../hooks/useMood';
import { MoodSlider } from '../components/mood/MoodSlider';
import { EmotionSelector } from '../components/mood/EmotionSelector';
import { CrisisModal } from '../components/mood/CrisisModal';
import { Button } from '../components/ui/Button';

const MAX_ENTRIES_PER_DAY = 5;

/** Translate a Zod validation key (e.g. "validation.mood.score.required") at display time.
 * Uses `as never` to satisfy strict i18next key types for runtime-dynamic keys. */
function useValidationT() {
  const { t } = useTranslation();
  return (key: string | undefined): string | undefined => (key ? t(key as never) : undefined);
}

export default function MoodTracker() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tv = useValidationT();
  const { mutateAsync: createMood, isPending, error } = useCreateMood();
  const { data: history } = useMoodHistory();

  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const todayCount = history?.todayCount ?? history?.total ?? 0;
  const remainingEntries = Math.max(0, MAX_ENTRIES_PER_DAY - todayCount);
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
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-sage-100 to-white px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-sage-100 shadow-sm ring-4 ring-sage-50">
            <CheckCircle2 className="h-10 w-10 text-sage-600" />
          </div>
          <h1 className="text-2xl font-bold text-sage-800">{t('mood.tracker.successTitle')}</h1>
          <p className="mt-2 text-sm text-sage-600">{t('mood.tracker.successMessage')}</p>
          <Button
            variant="primary"
            size="lg"
            className="mt-8 w-full rounded-xl"
            onClick={() => void navigate('/dashboard')}
          >
            {t('mood.tracker.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-dvh bg-gradient-to-b from-sage-100 via-sage-50 to-white">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-sage-200 bg-sage-50/90 px-6 py-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <Link
              to="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-stone-100 hover:text-slate-600"
              aria-label={t('mood.tracker.backAriaLabel')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-base font-bold text-sage-900">{t('mood.tracker.title')}</h1>
              <p className="text-xs text-sage-500 font-medium">
                {t('mood.tracker.welcomeMessage')}
              </p>
              <p className="text-xs text-slate-400">
                {canSubmit
                  ? t('mood.tracker.remainingEntries_other', { count: remainingEntries })
                  : t('mood.tracker.limitReached')}
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
              <p className="text-sm font-semibold text-amber-800">
                {t('mood.tracker.limitReached')}
              </p>
              <p className="mt-1 text-xs text-amber-600">
                {t('mood.tracker.limitMessage', { max: MAX_ENTRIES_PER_DAY })}
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
            <div className="rounded-2xl border border-sage-200 bg-sage-50 p-6 shadow-sm">
              <Controller
                name="score"
                control={control}
                render={({ field }) => (
                  <MoodSlider value={field.value ?? 5} onChange={field.onChange} />
                )}
              />
              {errors.score && (
                <p className="mt-2 text-xs text-crisis-600" role="alert">
                  {tv(errors.score.message)}
                </p>
              )}
            </div>

            {/* Emotion Selector */}
            <div className="rounded-2xl border border-sage-200 bg-sage-50 p-6 shadow-sm">
              <Controller
                name="emotion"
                control={control}
                render={({ field }) => (
                  <EmotionSelector
                    value={(field.value as EmotionValue | undefined) ?? ''}
                    onChange={field.onChange}
                    error={tv(errors.emotion?.message)}
                  />
                )}
              />
            </div>

            {/* Note */}
            <div className="rounded-2xl border border-sage-200 bg-sage-50 p-6 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <label htmlFor="mood-note" className="block text-sm font-medium text-sage-700">
                    {t('mood.tracker.noteLabel')}
                  </label>
                  <span className="text-xs text-slate-400">{noteValue.length}/500</span>
                </div>
                <textarea
                  id="mood-note"
                  rows={4}
                  placeholder={t('mood.tracker.notePlaceholder')}
                  className="w-full resize-none rounded-xl border border-stone-200 bg-[#faf9f7]/60 px-4 py-3 text-sm text-slate-700 placeholder:text-sage-400 focus:border-sage-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sage-200 focus:ring-offset-1 transition-colors duration-200"
                  {...register('note')}
                />
                {errors.note && (
                  <p className="text-xs text-crisis-600" role="alert">
                    {tv(errors.note.message)}
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
              {t('mood.tracker.submitButton')}
            </Button>
          </form>
        </main>
      </div>

      <CrisisModal isOpen={showCrisisModal} onClose={handleCrisisClose} />
    </>
  );
}
