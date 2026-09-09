import { useTranslation } from 'react-i18next';

const FOOTER_LINKS = [
  { href: '/guide', key: 'common.footer_guide' },
  { href: '/faq', key: 'common.footer_faq' },
  { href: '/about', key: 'common.footer_about' },
  { href: '/terms', key: 'common.footer_terms' },
  { href: '/privacy', key: 'common.footer_privacy' },
] as const;

const SUPPORT_LINKS = [
  { href: 'https://ko-fi.com/reconeur', label: 'Ko-fi' },
  { href: 'https://buymeacoffee.com/coner', label: 'Buy Me a Coffee' },
] as const;

export function Footer() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.split('-')[0] || i18n.language.split('-')[0];

  return (
    <footer className="app-footer w-full shrink-0">
      <div className="mx-auto flex w-full max-w-[1480px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:px-5 lg:px-10">
        <div className="footer-meta min-w-0">
          <a href="/" lang={language} className="footer-brand">
            {t('common.title_brand')}
          </a>
          <span className="footer-legal">
            <span aria-hidden="true" className="footer-separator">·</span>
            © SQUARE ENIX. {t('common.footer_fan_project')}
          </span>
        </div>

        <nav aria-label={t('common.footer_navigation')} className="footer-nav">
          {FOOTER_LINKS.map(({ href, key }) => (
            <a
              key={href}
              href={href}
              className="footer-link"
            >
              {t(key)}
            </a>
          ))}
          <details className="footer-support-menu">
            <summary className="footer-link footer-support footer-support-trigger">
              {t('common.footer_support')}
            </summary>
            <div
              className="footer-support-options"
              role="group"
              aria-label={t('common.footer_support_options')}
            >
              {SUPPORT_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-support-option"
                  aria-label={`${label} (${t('common.opens_new_window')})`}
                >
                  {label}
                </a>
              ))}
            </div>
          </details>
        </nav>
      </div>
    </footer>
  );
}
