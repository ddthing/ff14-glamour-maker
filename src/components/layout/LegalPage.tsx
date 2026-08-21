import { ContentPageLayout } from './ContentPageLayout';
import { useLocalizedPageContent } from '../../content/localizedPages';
import { useTranslation } from 'react-i18next';

interface LegalPageProps {
  type: 'terms' | 'privacy';
}

export function LegalPage({ type }: LegalPageProps) {
  const content = useLocalizedPageContent();
  const { t } = useTranslation();
  const page = content[type];

  return (
    <ContentPageLayout
      page={type}
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description}
      lastUpdated={page.lastUpdated}
      lastUpdatedIso={page.lastUpdatedIso}
    >
      <article className="content-prose">
        <div className="content-policy-date">
          <span>{page.effectiveDate}</span>
        </div>

        {page.sections.map(section => (
          <section key={section.title} className="content-section-card">
            <h2>{section.title}</h2>
            {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            {section.links?.length ? (
              <ul className="content-link-list">
                {section.links.map(link => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${link.label} (${t('common.opens_new_window')})`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <a href="/" className="content-home-link">
          {content.backHome}
        </a>
      </article>
    </ContentPageLayout>
  );
}
