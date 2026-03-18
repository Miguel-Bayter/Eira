import { useState } from 'react';
import { BookOpen, Sparkles, Clock } from 'lucide-react';
import { JournalEditor } from '@/components/journal/JournalEditor';
import { JournalAiAnalysis } from '@/components/journal/JournalAiAnalysis';
import { useAnalyzeJournalEntry, useCreateJournalEntry, useJournalHistory } from '@/hooks/useJournal';

export default function Journal() {
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);

  const { mutateAsync: createEntry, isPending: isSaving } = useCreateJournalEntry();
  const { mutateAsync: analyze, isPending: isAnalyzing, error: analyzeError } = useAnalyzeJournalEntry();
  const { data: history } = useJournalHistory();

  const handleSave = async (content: string) => {
    await createEntry({ content });
    setCurrentEntryId(null);
    setCurrentAnalysis(null);
  };

  const handleSaveAndAnalyze = async (content: string) => {
    const entry = await createEntry({ content });
    setCurrentEntryId(entry.id);
    setCurrentAnalysis(null);
    const result = await analyze({ entryId: entry.id });
    setCurrentAnalysis(result.aiAnalysis);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-eira-100">
            <BookOpen className="h-5 w-5 text-eira-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mi Diario</h1>
            <p className="text-sm text-gray-500">Un espacio seguro para expresarte</p>
          </div>
        </div>

        {/* Editor */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <JournalEditor
            onSave={handleSave}
            onSaveAndAnalyze={handleSaveAndAnalyze}
            isSaving={isSaving && !isAnalyzing}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Consejos de Eira (solo cuando se pidió análisis) */}
        <JournalAiAnalysis
          analysis={currentAnalysis}
          isLoading={isAnalyzing}
          error={analyzeError?.message ?? null}
          onAnalyze={() => { if (currentEntryId) void analyze({ entryId: currentEntryId }).then((r) => setCurrentAnalysis(r.aiAnalysis)); }}
          hasEntry={!!currentEntryId}
        />

        {/* Historial */}
        {history && history.entries.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Entradas anteriores
              </h2>
            </div>
            <ul className="space-y-3">
              {history.entries.map((entry) => (
                <li key={entry.id} className="rounded-xl bg-white p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <time className="text-xs text-gray-400">
                      {new Date(entry.createdAt).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    {entry.aiAnalysis && (
                      <span className="flex items-center gap-1 text-xs text-eira-500 font-medium">
                        <Sparkles className="h-3 w-3" />
                        Con consejos
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">{entry.content}</p>
                  {entry.aiAnalysis && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-eira-600 hover:text-eira-700 font-medium">
                        Ver consejos de Eira
                      </summary>
                      <div className="mt-2 rounded-lg bg-eira-50 p-3 text-gray-600 whitespace-pre-line">
                        {entry.aiAnalysis.replace(/\*\*/g, '')}
                      </div>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
