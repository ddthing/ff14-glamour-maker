import { useLocalizedPageContent } from '../content/localizedPages';
import { ContentPageLayout } from '../components/layout/ContentPageLayout';

export function Faq() {
  const { faq, backHome } = useLocalizedPageContent();

  return (
    <ContentPageLayout
      page="faq"
      eyebrow={faq.eyebrow}
      title={faq.title}
      description={faq.description}
      lastUpdated={faq.lastUpdated}
      lastUpdatedIso={faq.lastUpdatedIso}
    >
      <article className="content-prose">
        <section className="content-faq-list" aria-label={faq.title}>
          {faq.entries.map((entry, index) => (
            <details key={entry.question} className="content-faq-item" open={index === 0}>
              <summary>{entry.question}</summary>
              <p>{entry.answer}</p>
            </details>
          ))}
        </section>

        <a href="/" className="content-home-link">{backHome}</a>
      </article>
    </ContentPageLayout>
  );
}
