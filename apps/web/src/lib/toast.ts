import { toast } from 'sonner';
import i18n from '@/i18n';

function resolveMessage(message: string): string {
  return i18n.exists(message) ? i18n.t(message as never) : message;
}

export const notify = {
  success: (message: string) => toast.success(resolveMessage(message)),
  error: (message: string) => toast.error(resolveMessage(message)),
  info: (message: string) => toast.info(resolveMessage(message)),
  loading: (message: string) => toast.loading(resolveMessage(message)),
};
