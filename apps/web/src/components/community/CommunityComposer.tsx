import { useState } from 'react';
import { Loader2, Send, X, PenLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COMMUNITY_CONTENT_MAX_LENGTH, COMMUNITY_CONTENT_MIN_LENGTH } from '@eira/shared';

interface CommunityComposerProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
}

export function CommunityComposer({ onSubmit, isSubmitting }: CommunityComposerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');

  const remaining = COMMUNITY_CONTENT_MAX_LENGTH - content.length;
  const canSubmit = content.trim().length >= COMMUNITY_CONTENT_MIN_LENGTH && !isSubmitting;

  const handleSubmit = async () => {
    await onSubmit(content);
    setContent('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-sage-200 bg-sage-50 px-5 py-4 text-sm font-medium text-sage-700 shadow-sm hover:bg-sage-100 transition-colors duration-150"
      >
        <PenLine className="h-4 w-4" />
        {t('community.composer.openButton')}
      </button>
    );
  }

  return (
    <div className="rounded-3xl border border-sage-200 bg-white shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-sage-400 to-sage-500 h-1.5 w-full" />
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="community-content" className="block text-sm font-semibold text-sage-700">
            {t('community.composer.label')}
          </label>
          <button
            onClick={() => {
              setContent('');
              setOpen(false);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label={t('community.composer.cancelButton')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          <textarea
            id="community-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('community.composer.placeholder')}
            maxLength={COMMUNITY_CONTENT_MAX_LENGTH}
            rows={5}
            disabled={isSubmitting}
            className="w-full resize-none rounded-2xl border border-sage-200 bg-sage-50 p-4 text-sm leading-relaxed text-sage-800 placeholder:text-sage-300 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-100 disabled:opacity-60 transition-colors duration-200"
          />
          <span className="absolute bottom-3 right-4 text-xs text-gray-300 select-none">
            {remaining < 200 ? `${remaining}` : ''}
          </span>
        </div>

        <p className="text-xs text-sage-500">{t('community.composer.hint')}</p>

        <div className="flex justify-end">
          <button
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sage-500 to-sage-400 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:from-sage-600 hover:to-sage-500 disabled:opacity-40 transition-all duration-150"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('community.composer.publishing')}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {t('community.composer.submitButton')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
