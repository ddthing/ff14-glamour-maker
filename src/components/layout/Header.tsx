import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useLocalizedMetadata } from '../../hooks/useLocalizedMetadata';
import { LanguageSelector } from './LanguageSelector';

export function Header() {
  const { t } = useTranslation();
  const [isDark, toggleDark] = useDarkMode();
  useLocalizedMetadata();

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-2 z-[4000] -translate-y-24 rounded-[var(--radius-sm)] bg-[var(--text-primary)] px-4 py-2 text-sm font-bold text-[var(--bg-app)] shadow-lg transition-transform focus-visible:translate-y-0"
      >
        {t('common.skip_to_content')}
      </a>

      <header
        aria-label={t('common.main_navigation')}
        className="app-header sticky top-0 z-50 w-full shrink-0"
      >
        <div className="mx-auto flex h-[52px] w-full max-w-[1480px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-10">
          <div className="flex min-w-0 items-center">
            <span className="brand-wordmark whitespace-nowrap">{t('common.title_brand')}</span>
          </div>

          <div className="header-control-rail shrink-0">
            <LanguageSelector />
            <span aria-hidden="true" className="header-control-divider" />
            <button
              id="dark-mode-toggle"
              type="button"
              onClick={toggleDark}
              aria-label={isDark ? t('common.to_light') : t('common.to_dark')}
              aria-pressed={isDark}
              className="header-control-cell"
            >
              {isDark
                ? <Sun size={15} aria-hidden="true" />
                : <Moon size={15} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
