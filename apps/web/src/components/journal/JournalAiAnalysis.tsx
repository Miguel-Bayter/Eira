import { Sparkles, Loader2 } from 'lucide-react';

interface JournalAiAnalysisProps {
  analysis: string | null;
  isLoading: boolean;
  error: string | null;
  onAnalyze: () => void;
  hasEntry: boolean;
}

export function JournalAiAnalysis({ analysis, isLoading, error, onAnalyze, hasEntry }: JournalAiAnalysisProps) {
  if (!hasEntry) return null;

  return (
    <div className="rounded-xl border border-eira-100 bg-eira-50/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-eira-500" />
          <h3 className="text-sm font-semibold text-eira-700">Análisis de Eira</h3>
        </div>
        {!analysis && (
          <button
            onClick={onAnalyze}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-eira-500 px-4 py-2 text-sm font-medium text-white hover:bg-eira-600 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Leyendo tu entrada...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Reflexionar con Eira
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {isLoading && (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-eira-100 rounded w-3/4" />
          <div className="h-3 bg-eira-100 rounded w-full" />
          <div className="h-3 bg-eira-100 rounded w-5/6" />
        </div>
      )}

      {analysis && !isLoading && (
        <div className="prose prose-sm max-w-none text-gray-700">
          {analysis.split('\n').map((line, i) => (
            <p key={i} className={line.startsWith('**') ? 'font-semibold text-eira-700' : ''}>
              {line.replace(/\*\*/g, '')}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
