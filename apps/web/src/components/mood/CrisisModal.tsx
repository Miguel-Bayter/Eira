import * as Dialog from '@radix-ui/react-dialog';
import { Phone, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  const { t } = useTranslation();
  const phone = t('mood.crisis.phone');

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-8 shadow-2xl focus:outline-none data-[state=open]:animate-fade-in"
          aria-describedby="crisis-desc"
        >
          <Dialog.Close
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100"
            aria-label={t('mood.crisis.closeAriaLabel')}
          >
            <X className="h-4 w-4" />
          </Dialog.Close>

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-crisis-100">
            <Phone className="h-7 w-7 text-crisis-600" />
          </div>

          <Dialog.Title className="mb-3 text-center text-xl font-bold text-slate-900">
            {t('mood.crisis.title')}
          </Dialog.Title>

          <p
            id="crisis-desc"
            className="mb-6 text-center text-sm leading-relaxed text-slate-500"
          >
            {t('mood.crisis.description')}
          </p>

          <div className="mb-6 rounded-2xl bg-crisis-50 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-crisis-500">
              {t('mood.crisis.lineLabel')}
            </p>
            <p className="mt-1 text-5xl font-bold text-crisis-700">{phone}</p>
            <p className="mt-1 text-xs text-crisis-400">{t('mood.crisis.lineAvailability')}</p>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-crisis-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-crisis-700 focus:outline-none focus:ring-2 focus:ring-crisis-500 focus:ring-offset-2"
            >
              <Phone className="h-4 w-4" />
              {t('mood.crisis.callButton')}
            </a>
            <Button variant="ghost" size="md" onClick={onClose} className="w-full">
              {t('mood.crisis.continueButton')}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
