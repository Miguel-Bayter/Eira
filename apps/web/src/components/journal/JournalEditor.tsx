import { useState } from 'react';
import { Loader2, Sparkles, Save } from 'lucide-react';

interface JournalEditorProps {
  onSave: (content: string) => Promise<void>;
  onSaveAndAnalyze: (content: string) => Promise<void>;
  isSaving: boolean;
  isAnalyzing: boolean;
}

export function JournalEditor({ onSave, onSaveAndAnalyze, isSaving, isAnalyzing }: JournalEditorProps) {
  const [content, setContent] = useState('');
  const isPending = isSaving || isAnalyzing;
  const canSubmit = content.trim().length >= 10 && !isPending;

  const handleSave = async () => {
    await onSave(content);
    setContent('');
  };

  const handleSaveAndAnalyze = async () => {
    await onSaveAndAnalyze(content);
    setContent('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="journal-content" className="text-sm font-medium text-gray-700">
          ¿Cómo te sientes hoy?
        </label>
        <span className="text-xs text-gray-400">{content.length}/5000</span>
      </div>

      <textarea
        id="journal-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe tus pensamientos, sentimientos, o lo que necesites expresar hoy..."
        maxLength={5000}
        rows={10}
        disabled={isPending}
        className="w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-gray-800 placeholder-gray-400 focus:border-eira-400 focus:outline-none focus:ring-2 focus:ring-eira-200 disabled:opacity-60"
        aria-describedby="journal-hint"
      />

      <p id="journal-hint" className="text-xs text-gray-400">
        Escribe al menos 10 caracteres para guardar.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          onClick={() => void handleSave()}
          disabled={!canSubmit}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar entrada
            </>
          )}
        </button>

        <button
          onClick={() => void handleSaveAndAnalyze()}
          disabled={!canSubmit}
          className="flex items-center justify-center gap-2 rounded-lg bg-eira-500 px-4 py-2 text-sm font-medium text-white hover:bg-eira-600 disabled:opacity-40"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Guardar y recibir consejos
            </>
          )}
        </button>
      </div>
    </div>
  );
}
