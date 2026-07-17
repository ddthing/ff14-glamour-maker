import { useLocalizedPageContent } from '../content/localizedPages';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';

export function About() {
  const { about } = useLocalizedPageContent();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--bg-app)]">
      <Header />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="mb-8 text-3xl font-black">{about.title}</h1>
        <div className="space-y-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-panel)] p-6 sm:p-8">
          {about.sections.map((section, index) => (
            <section key={section.title}>
              <h2 className="mb-4 text-xl font-bold">{section.title}</h2>
              <div className="space-y-3 leading-relaxed text-[var(--text-secondary)]">
                {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                {index === 1 ? (
                  <p>
                    <strong>{about.contactLabel}:</strong>{' '}
                    <a href="https://x.com/reconeur" className="text-[var(--accent)] hover:underline" target="_blank" rel="noopener noreferrer">
                      @reconeur
                    </a>
                  </p>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
