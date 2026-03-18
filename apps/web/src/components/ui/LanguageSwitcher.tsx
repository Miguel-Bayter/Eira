import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith('en') ? 'en' : 'es';

  const toggle = () => {
    void i18n.changeLanguage(current === 'es' ? 'en' : 'es');
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
      aria-label="Change language"
    >
      <span className={current === 'es' ? 'text-eira-600' : 'text-gray-400'}>ES</span>
      <span className="text-gray-300">|</span>
      <span className={current === 'en' ? 'text-eira-600' : 'text-gray-400'}>EN</span>
    </button>
  );
}
