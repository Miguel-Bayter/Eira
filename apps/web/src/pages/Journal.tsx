import { useState } from 'react';
import { Sparkles, Clock, PenLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { JournalEditor } from '@/components/journal/JournalEditor';
import { JournalAiAnalysis } from '@/components/journal/JournalAiAnalysis';
import { JournalFormattedAnalysis } from '@/components/journal/JournalFormattedAnalysis';
import { useAnalyzeJournalEntry, useCreateJournalEntry, useJournalHistory } from '@/hooks/useJournal';
import { BackToDashboardLink } from '@/components/ui/BackToDashboardLink';

type TranslateFn = TFunction<'translation', undefined>;

function getDayGreeting(t: TranslateFn): string {
  const hour = new Date().getHours();
  if (hour < 12) return t('journal.greeting.morning');
  if (hour < 18) return t('journal.greeting.afternoon');
  return t('journal.greeting.evening');
}

function formatEntryDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Journal() {
  const { t, i18n } = useTranslation();
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

  const today = new Date().toLocaleDateString(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-warm-100 via-warm-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
        <div className="flex justify-start">
          <BackToDashboardLink />
        </div>

        <header className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100 shadow-sm">
              <PenLine className="h-7 w-7 text-warm-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-warm-800">{getDayGreeting(t)} ✨</h1>
          <p className="text-sm text-gray-400 capitalize">{today}</p>
          <p className="text-sm text-warm-600 font-medium">
            {t('journal.subtitle')}
          </p>
        </header>

        {/* Editor */}
        <JournalEditor
          onSave={handleSave}
          onSaveAndAnalyze={handleSaveAndAnalyze}
          isSaving={isSaving && !isAnalyzing}
          isAnalyzing={isAnalyzing}
        />

        {/* AI analysis panel */}
        <JournalAiAnalysis
          analysis={currentAnalysis}
          isLoading={isAnalyzing}
          error={analyzeError?.message ?? null}
          hasEntry={!!currentEntryId}
        />

        {/* History */}
        {history && history.entries.length > 0 && (
          <section className="space-y-4">
            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-warm-200" />
              <div className="flex items-center gap-1.5 text-xs font-medium text-warm-500 uppercase tracking-widest">
                <Clock className="h-3 w-3" />
                {t('journal.previousEntries')}
              </div>
              <div className="h-px flex-1 bg-warm-200" />
            </div>

            <ul className="space-y-4">
              {history.entries.map((entry) => (
                <li
                  key={entry.id}
                  className="group rounded-2xl bg-white border border-warm-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* Accent bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-warm-300 to-warm-400" />

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <time className="text-xs text-slate-400 capitalize">
                        {formatEntryDate(entry.createdAt, i18n.language)}
                      </time>
                      {entry.aiAnalysis && (
                        <span className="flex items-center gap-1 rounded-full bg-warm-100 px-2.5 py-0.5 text-xs text-warm-700 font-medium border border-warm-200">
                          <Sparkles className="h-3 w-3" />
                          {t('journal.withTips')}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 italic">
                      "{entry.content}"
                    </p>

                    {entry.aiAnalysis && (
                      <details className="text-sm">
                        <summary className="cursor-pointer select-none text-warm-600 hover:text-warm-700 font-medium text-xs">
                          {t('journal.viewTips')}
                        </summary>
                        <div className="mt-3 rounded-xl bg-gradient-to-br from-warm-50 to-white border border-warm-200 p-4 text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                          <JournalFormattedAnalysis content={entry.aiAnalysis} />
                        </div>
                      </details>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
