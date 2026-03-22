import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WeeklyPlanCardProps {
  plan: string | null;
}

export function WeeklyPlanCard({ plan }: WeeklyPlanCardProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-2xl border border-sage-100 bg-sage-50 p-5 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-100">
          <Sparkles className="h-4 w-4 text-sage-600" />
        </div>
        <h3 className="text-sm font-semibold text-sage-800">
          {t('dashboard.weeklyPlan.title')}
        </h3>
      </div>

      {plan ? (
        <p className="text-sm leading-loose text-sage-700 whitespace-pre-line">{plan}</p>
      ) : (
        <p className="text-sm text-sage-500/80 italic">
          {t('dashboard.weeklyPlan.noData')}
        </p>
      )}
    </section>
  );
}
