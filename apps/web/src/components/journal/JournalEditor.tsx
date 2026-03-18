import { useState } from 'react';
import { Loader2, Sparkles, BookmarkCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const canSubmit = content.trim().length >= 10 && !isPending;
  const remaining = 5000 - content.length;

  const handleSave = async () => {
    await onSave(content);
    setContent('');
  };

  const handleSaveAndAnalyze = async () => {
    await onSaveAndAnalyze(content);
    setContent('');
  };

  return (
    <div className="rounded-3xl bg-white shadow-md border border-eira-100 overflow-hidden">
      {/* Paper top strip */}
      <div className="bg-gradient-to-r from-eira-400 to-eira-500 h-1.5 w-full" />

      <div className="p-6 space-y-4">
        {/* Label */}
        <label
          htmlFor="journal-content"
          className="block text-base font-semibold text-gray-700"
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
            maxLength={5000}
            rows={11}
            disabled={isPending}
            className="w-full resize-none rounded-2xl border border-gray-100 bg-eira-50/30 p-5 text-base leading-relaxed text-gray-700 placeholder-gray-300 focus:border-eira-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-eira-100 disabled:opacity-60 transition-colors duration-200"
            aria-describedby="journal-hint"
          />
          {/* Character count inside textarea area */}
          <span className="absolute bottom-3 right-4 text-xs text-gray-300 select-none">
            {remaining < 500 ? t('journal.editor.remaining', { count: remaining }) : ''}
          </span>
        </div>

        <p id="journal-hint" className="text-xs text-gray-400">
          {t('journal.editor.hint')}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
          <button
            onClick={() => void handleSave()}
            disabled={!canSubmit}
            className="flex items-center justify-center gap-2 rounded-xl border border-eira-200 bg-white px-5 py-2.5 text-sm font-medium text-eira-700 hover:bg-eira-50 disabled:opacity-40 transition-colors duration-150"
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
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-eira-500 to-eira-400 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:from-eira-600 hover:to-eira-500 disabled:opacity-40 transition-all duration-150"
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
