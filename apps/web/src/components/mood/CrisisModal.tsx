import * as Dialog from '@radix-ui/react-dialog';
import { Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
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
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </Dialog.Close>

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-crisis-100">
            <Phone className="h-7 w-7 text-crisis-600" />
          </div>

          <Dialog.Title className="mb-3 text-center text-xl font-bold text-slate-900">
            Estamos aquí para ti
          </Dialog.Title>

          <p
            id="crisis-desc"
            className="mb-6 text-center text-sm leading-relaxed text-slate-500"
          >
            Notamos que puedes estar pasando un momento difícil. Hablar con alguien puede ayudar mucho.
          </p>

          <div className="mb-6 rounded-2xl bg-crisis-50 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-crisis-500">
              Línea de atención gratuita · Colombia
            </p>
            <p className="mt-1 text-5xl font-bold text-crisis-700">106</p>
            <p className="mt-1 text-xs text-crisis-400">Disponible 24/7 · Confidencial</p>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="tel:106"
              className="flex items-center justify-center gap-2 rounded-xl bg-crisis-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-crisis-700 focus:outline-none focus:ring-2 focus:ring-crisis-500 focus:ring-offset-2"
            >
              <Phone className="h-4 w-4" />
              Llamar al 106 ahora
            </a>
            <Button variant="ghost" size="md" onClick={onClose} className="w-full">
              Continuar en Eira
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
