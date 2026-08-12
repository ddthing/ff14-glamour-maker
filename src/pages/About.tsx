import { useLocalizedPageContent } from '../content/localizedPages';
import { ContentPageLayout } from '../components/layout/ContentPageLayout';

export function About() {
  const { about, backHome } = useLocalizedPageContent();

  return (
    <ContentPageLayout
      page="about"
      eyebrow={about.eyebrow}
      title={about.title}
      description={about.description}
      lastUpdated={about.lastUpdated}
      lastUpdatedIso={about.lastUpdatedIso}
    >
      <article className="content-prose about-article">
        {about.sections.map(section => (
          <section key={section.title} className="content-section-card">
            <h2>{section.title}</h2>
            {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}

        <section className="content-callout">
          <h2>{about.contactLabel}</h2>
          <p>{about.contactText}</p>
          <a href="https://x.com/reconeur" target="_blank" rel="noopener noreferrer" className="content-inline-link">
            @reconeur
          </a>
        </section>

        <a href="/" className="content-home-link">{backHome}</a>
      </article>
    </ContentPageLayout>
  );
}
