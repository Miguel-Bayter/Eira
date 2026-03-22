import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SendHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { sendChatMessageSchema, type SendChatMessageFormData } from '@/schemas/chat.schema';

interface ChatComposerProps {
  isPending: boolean;
  disabled?: boolean;
  remainingMessages: number;
  onSubmit: (data: SendChatMessageFormData) => Promise<void>;
}

export function ChatComposer({ isPending, disabled = false, remainingMessages, onSubmit }: ChatComposerProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SendChatMessageFormData>({
    resolver: zodResolver(sendChatMessageSchema),
    defaultValues: { message: '' },
  });

  const messageValue = watch('message') ?? '';

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values);
    reset();
  });

  return (
    <form onSubmit={submitHandler} className="border-t border-eira-100/80 bg-white/96 px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label htmlFor="chat-message" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-eira-600">
            {t('chat.composer.label')}
          </label>
          <textarea
            id="chat-message"
            rows={3}
            placeholder={t('chat.composer.placeholder')}
            disabled={disabled || isPending}
            className="w-full resize-none rounded-[24px] border border-eira-100 bg-eira-50/55 px-4 py-3 text-sm leading-7 text-slate-700 placeholder:text-slate-400 shadow-inner shadow-eira-100/40 transition-colors focus:border-eira-300 focus:outline-none focus:ring-2 focus:ring-eira-200 disabled:cursor-not-allowed disabled:opacity-60"
            {...register('message')}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isPending}
          disabled={disabled}
          className="h-12 shrink-0 rounded-full px-5 sm:min-w-[136px]"
          aria-label={t('chat.composer.sendAriaLabel')}
        >
          <SendHorizontal className="h-5 w-5" />
          <span>{t('chat.composer.sendButton')}</span>
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span>{t('chat.composer.remainingMessages', { count: remainingMessages })}</span>
        <span className="tabular-nums">{messageValue.length}/2000</span>
      </div>

      {errors.message && (
        <p className="mt-2 text-xs text-crisis-600" role="alert">
          {t(errors.message.message as never)}
        </p>
      )}
    </form>
  );
}
