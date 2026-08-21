import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useLocalizedMetadata } from '../../hooks/useLocalizedMetadata';
import type { ContentPageKey } from '../../content/pageTypes';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  page?: ContentPageKey;
}

export function Header({ page = 'home' }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [isDark, toggleDark] = useDarkMode();
  const language = i18n.resolvedLanguage?.split('-')[0] || i18n.language.split('-')[0];
  useLocalizedMetadata(page);

  const focusMainContent = (event: ReactMouseEvent<HTMLAnchorElement> | ReactKeyboardEvent<HTMLAnchorElement>) => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    event.preventDefault();
    mainContent.focus();
  };

  return (
    <>
      <a
        href="#main-content"
        onClick={focusMainContent}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') focusMainContent(event);
        }}
        className="fixed left-4 top-2 z-[4000] -translate-y-24 rounded-[var(--radius-sm)] bg-[var(--text-primary)] px-4 py-2 text-sm font-bold text-[var(--bg-app)] transition-transform focus-visible:translate-y-0"
      >
        {t('common.skip_to_content')}
      </a>

      <header
        aria-label={t('common.main_navigation')}
        className="app-header sticky top-0 z-50 w-full shrink-0"
      >
        <div className="mx-auto flex h-[44px] w-full max-w-[1480px] items-center justify-between gap-3 px-3 sm:h-[46px] sm:px-5 lg:px-10">
          <a href="/" className="brand-link min-w-0" aria-label={t('common.title_brand')}>
            <span className="brand-mark" aria-hidden="true" />
            <span lang={language} className="brand-wordmark truncate">{t('common.title_brand')}</span>
          </a>

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
              <HugeiconsIcon
                icon={isDark ? Sun03Icon : Moon02Icon}
                size={16}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
