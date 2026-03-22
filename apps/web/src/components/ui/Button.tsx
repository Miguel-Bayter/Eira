import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef } from 'react';

// Use motion.button's own prop type to avoid conflicts with React's DragEventHandler
type MotionButtonProps = ComponentPropsWithoutRef<typeof motion.button>;

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionButtonProps>,
    MotionButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const { t } = useTranslation();
  const shouldReduce = useReducedMotion();

  const variants = {
    primary:   'bg-eira-500 text-white hover:bg-eira-600 focus:ring-eira-500',
    secondary: 'bg-white text-eira-700 border border-eira-200 hover:bg-eira-50 focus:ring-eira-500',
    ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
    danger:    'bg-crisis-500 text-white hover:bg-crisis-600 focus:ring-crisis-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileTap={shouldReduce ? {} : { scale: 0.97 }}
      whileHover={shouldReduce ? {} : { scale: 1.01 }}
      transition={{ duration: 0.1 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled ?? isLoading}
      aria-disabled={disabled ?? isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>{t('common.loading')}</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
