import { useLocalizedPageContent } from '../../content/localizedPages';

export function SeoArticle() {
  const { guide } = useLocalizedPageContent();

  return (
    <article className="mx-auto mt-8 w-full max-w-4xl space-y-12 px-0 py-8 text-[var(--text-secondary)] sm:px-6 sm:py-12">
      <section className="space-y-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{guide.title}</h1>
        {guide.intro.map(paragraph => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">{guide.howTitle}</h2>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {guide.steps.map((step, index) => (
            <div key={step.title} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-panel)] p-6 shadow-sm">
              <div className="mb-3 text-2xl font-black text-[var(--text-muted)]">{String(index + 1).padStart(2, '0')}</div>
              <h3 className="mb-2 font-bold text-[var(--text-primary)]">{step.title}</h3>
              <p className="text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">{guide.tipsTitle}</h2>
        <ul className="list-disc space-y-2 pl-5">
          {guide.tips.map(tip => (
            <li key={tip.title}><strong>{tip.title}:</strong> {tip.description}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">{guide.faqTitle}</h2>
        <div className="space-y-6">
          {guide.entries.map(entry => (
            <div key={entry.question}>
              <h3 className="font-bold text-[var(--text-primary)]">{entry.question}</h3>
              <p className="mt-1 leading-relaxed">{entry.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
