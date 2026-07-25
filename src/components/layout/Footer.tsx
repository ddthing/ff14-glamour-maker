import { useTranslation } from 'react-i18next';

const FOOTER_LINKS = [
  { href: '/guide', key: 'common.footer_guide' },
  { href: '/about', key: 'common.footer_about' },
  { href: '/terms', key: 'common.footer_terms' },
  { href: '/privacy', key: 'common.footer_privacy' },
] as const;

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full shrink-0 border-t border-[var(--border)] bg-[var(--header-bg)]">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5 lg:px-10">
        <div className="flex min-w-0 items-center gap-2 text-[0.62rem] text-[var(--text-muted)]">
          <span className="shrink-0 font-bold tracking-[0.08em]">{t('common.title_brand')}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">© SQUARE ENIX. {t('common.footer_fan_project')}</span>
        </div>

        <nav aria-label={t('common.footer_navigation')} className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {FOOTER_LINKS.map(({ href, key }) => (
            <a
              key={href}
              href={href}
              className="text-[0.68rem] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              {t(key)}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
