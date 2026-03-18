import { Heart, Loader2 } from 'lucide-react';

interface JournalAiAnalysisProps {
  analysis: string | null;
  isLoading: boolean;
  error: string | null;
  hasEntry: boolean;
}

export function JournalAiAnalysis({ analysis, isLoading, error, hasEntry }: JournalAiAnalysisProps) {
  if (!hasEntry && !isLoading) return null;

  return (
    <div className="rounded-3xl border border-eira-100 bg-gradient-to-br from-eira-50 via-white to-eira-50/60 shadow-sm overflow-hidden">
      {/* Decorative top */}
      <div className="bg-gradient-to-r from-eira-300 via-eira-400 to-eira-300 h-1 w-full" />

      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-eira-100">
            <Heart className="h-4 w-4 text-eira-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-eira-700">Eira te escribe</p>
            <p className="text-xs text-gray-400">Consejos para ti, con cariño</p>
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-eira-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Eira está leyendo lo que escribiste...</span>
            </div>
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-eira-100 rounded-full w-5/6" />
              <div className="h-3 bg-eira-100 rounded-full w-full" />
              <div className="h-3 bg-eira-100 rounded-full w-4/6" />
              <div className="h-3 bg-eira-100 rounded-full w-5/6" />
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
            <p className="text-5xl leading-none text-eira-200 font-serif select-none">"</p>
            <div className="text-sm leading-relaxed text-gray-600 whitespace-pre-line -mt-4 px-1">
              {analysis.replace(/\*\*/g, '')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
