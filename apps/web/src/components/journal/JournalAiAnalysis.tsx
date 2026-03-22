import { Heart, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { JournalFormattedAnalysis } from './JournalFormattedAnalysis';

interface JournalAiAnalysisProps {
  analysis: string | null;
  isLoading: boolean;
  error: string | null;
  hasEntry: boolean;
}

export function JournalAiAnalysis({ analysis, isLoading, error, hasEntry }: JournalAiAnalysisProps) {
  const { t } = useTranslation();

  if (!hasEntry && !isLoading) return null;

  return (
    <div className="rounded-3xl border border-warm-200 bg-gradient-to-br from-warm-50 via-white to-warm-50 shadow-sm overflow-hidden">
      {/* Decorative top */}
      <div className="bg-gradient-to-r from-warm-300 via-warm-400 to-warm-300 h-1 w-full" />

      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warm-100">
            <Heart className="h-4 w-4 text-warm-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-warm-700">{t('journal.analysis.header')}</p>
            <p className="text-xs text-gray-400">{t('journal.analysis.subheader')}</p>
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-warm-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('journal.analysis.loading')}</span>
            </div>
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-warm-100 rounded-full w-5/6" />
              <div className="h-3 bg-warm-100 rounded-full w-full" />
              <div className="h-3 bg-warm-100 rounded-full w-4/6" />
              <div className="h-3 bg-warm-100 rounded-full w-5/6" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <p className="text-sm text-red-400 bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}

        {/* Analysis result */}
        {analysis && !isLoading && (
          <div className="space-y-1">
            {/* Decorative quote mark */}
            <p className="text-5xl leading-none text-warm-300 font-serif select-none">"</p>
            <div className="text-sm leading-relaxed text-gray-600 whitespace-pre-line -mt-4 px-1">
              <JournalFormattedAnalysis content={analysis} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
