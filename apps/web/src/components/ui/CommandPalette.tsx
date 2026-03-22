import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  labelKey: string;
  path: string;
  iconEmoji: string;
}

const NAVIGATION_ITEMS: readonly CommandItem[] = [
  { id: 'mood',      labelKey: 'nav.mood',      path: '/mood',      iconEmoji: '🌊' },
  { id: 'journal',   labelKey: 'nav.journal',   path: '/journal',   iconEmoji: '📓' },
  { id: 'chat',      labelKey: 'nav.chat',      path: '/chat',      iconEmoji: '💬' },
  { id: 'dashboard', labelKey: 'nav.dashboard', path: '/dashboard', iconEmoji: '✨' },
] as const;

export function CommandPalette() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (path: string) => {
    void navigate(path);
    setOpen(false);
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.96, y: -8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const } },
    exit:    { opacity: 0, scale: 0.96, y: -8, transition: { duration: 0.12 } },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            variants={shouldReduce ? undefined : overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            key="dialog"
            variants={shouldReduce ? undefined : dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed left-1/2 top-1/4 z-50 w-full max-w-md -translate-x-1/2 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden"
          >
            <Command className="[&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:border-slate-100">
              <Command.Input
                placeholder={t('command.placeholder')}
                className="w-full px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                autoFocus
              />
              <Command.List className="max-h-64 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-slate-400">
                  {t('command.noResults')}
                </Command.Empty>
                <Command.Group
                  heading={t('command.navigate')}
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-slate-400"
                >
                  {NAVIGATION_ITEMS.map((item) => (
                    <Command.Item
                      key={item.id}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      value={t(item.labelKey as never)}
                      onSelect={() => handleSelect(item.path)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 cursor-pointer',
                        'data-[selected=true]:bg-eira-50 data-[selected=true]:text-eira-700',
                        'transition-colors',
                      )}
                    >
                      <span className="text-base">{item.iconEmoji}</span>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <span>{t(item.labelKey as never)}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
