import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { InformationPageKey } from '../../content/pageTypes';
import { Footer } from './Footer';
import { Header } from './Header';

interface ContentPageLayoutProps {
  page: InformationPageKey;
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  lastUpdatedIso: string;
  children: ReactNode;
}

export function ContentPageLayout({
  page,
  eyebrow,
  title,
  description,
  lastUpdated,
  lastUpdatedIso,
  children,
}: ContentPageLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="content-page-shell">
      <Header page={page} />

      <main id="main-content" tabIndex={-1} className="content-page">
        <div className="content-page-inner">
          <nav aria-label={t('common.breadcrumb')} className="content-breadcrumb">
            <a href="/" className="content-breadcrumb-link">
              {t('common.title_brand')}
            </a>
            <span aria-hidden="true" className="content-breadcrumb-separator">/</span>
            <span aria-current="page" className="content-breadcrumb-current">{title}</span>
          </nav>

          <header className="content-page-hero">
            <p className="content-eyebrow">{eyebrow}</p>
            <h1 className="content-page-title">{title}</h1>
            <p className="content-page-description">{description}</p>
            <p className="content-page-updated">
              <span>{t('common.last_updated')}</span>{' '}
              <time dateTime={lastUpdatedIso}>{lastUpdated}</time>
            </p>
          </header>

          <div className="content-page-body">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
