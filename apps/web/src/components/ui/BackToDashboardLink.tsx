import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface BackToDashboardLinkProps {
  className?: string;
}

export function BackToDashboardLink({ className }: BackToDashboardLinkProps) {
  const { t } = useTranslation();

  return (
    <Link
      to="/dashboard"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-eira-200/80 bg-white/90 px-3 py-1.5 text-sm font-medium text-eira-700 shadow-sm transition-colors hover:border-eira-300 hover:bg-eira-50 focus:outline-none focus:ring-2 focus:ring-eira-300 focus:ring-offset-2',
        className,
      )}
      aria-label={t('common.backToDashboard')}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{t('common.backToDashboard')}</span>
    </Link>
  );
}
