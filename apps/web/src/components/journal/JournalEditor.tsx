import { useState } from 'react';
import { Loader2, Sparkles, BookmarkCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { JOURNAL_CONTENT_MAX_LENGTH } from '@eira/shared';

interface JournalEditorProps {
  onSave: (content: string) => Promise<void>;
  onSaveAndAnalyze: (content: string) => Promise<void>;
  isSaving: boolean;
  isAnalyzing: boolean;
}

export function JournalEditor({ onSave, onSaveAndAnalyze, isSaving, isAnalyzing }: JournalEditorProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const isPending = isSaving || isAnalyzing;
  const canSubmit = content.trim().length >= 1 && !isPending;
  const remaining = JOURNAL_CONTENT_MAX_LENGTH - content.length;

  const handleSave = async () => {
    await onSave(content);
    setContent('');
  };

  const handleSaveAndAnalyze = async () => {
    await onSaveAndAnalyze(content);
    setContent('');
  };

  return (
    <div className="rounded-3xl bg-warm-50 shadow-md border border-warm-200 overflow-hidden">
      {/* Paper top strip */}
      <div className="bg-gradient-to-r from-warm-400 to-warm-500 h-1.5 w-full" />

      <div className="p-6 space-y-4">
        {/* Label */}
        <label
          htmlFor="journal-content"
          className="block text-base font-semibold text-warm-700"
        >
          {t('journal.editor.label')}
        </label>

        {/* Textarea */}
        <div className="relative">
          <textarea
            id="journal-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('journal.editor.placeholder')}
            maxLength={JOURNAL_CONTENT_MAX_LENGTH}
            rows={11}
            disabled={isPending}
            className="w-full resize-none rounded-2xl border border-warm-200 bg-white p-5 text-base leading-relaxed text-warm-800 placeholder:text-warm-300 focus:border-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-100 disabled:opacity-60 transition-colors duration-200"
            aria-describedby="journal-hint"
          />
          {/* Character count inside textarea area */}
          <span className="absolute bottom-3 right-4 text-xs text-gray-300 select-none">
            {remaining < 500 ? t('journal.editor.remaining', { count: remaining }) : ''}
          </span>
        </div>

        <p id="journal-hint" className="text-xs text-warm-500">
          {t('journal.editor.hint')}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
          <button
            onClick={() => void handleSave()}
            disabled={!canSubmit}
            className="flex items-center justify-center gap-2 rounded-xl border border-warm-200 bg-white px-5 py-2.5 text-sm font-medium text-warm-700 hover:bg-warm-50 disabled:opacity-40 transition-colors duration-150"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('journal.editor.saving')}
              </>
            ) : (
              <>
                <BookmarkCheck className="h-4 w-4" />
                {t('journal.editor.saveButton')}
              </>
            )}
          </button>

          <button
            onClick={() => void handleSaveAndAnalyze()}
            disabled={!canSubmit}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-warm-500 to-warm-400 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:from-warm-600 hover:to-warm-500 disabled:opacity-40 transition-all duration-150"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('journal.editor.analyzing')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t('journal.editor.saveAndAnalyzeButton')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
