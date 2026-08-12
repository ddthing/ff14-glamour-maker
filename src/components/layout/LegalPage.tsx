import { Footer } from './Footer';
import { Header } from './Header';
import { useLocalizedPageContent } from '../../content/localizedPages';

interface LegalPageProps {
  type: 'terms' | 'privacy';
}

export function LegalPage({ type }: LegalPageProps) {
  const content = useLocalizedPageContent();
  const page = content[type];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--bg-app)] text-[var(--text-primary)]">
      <Header />
      <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 md:py-20">
        <h1 className="border-b border-[var(--border)] pb-6 text-2xl font-black tracking-tight md:text-3xl">
          {page.title}
        </h1>
        <div className="flex max-w-none flex-col gap-6 text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">{page.effectiveDate}</p>
          {page.sections.map(section => (
            <section key={section.title} className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{section.title}</h2>
              {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </div>
        <div className="mt-6">
          <a href="/" className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] bg-[var(--surface-300)] px-6 py-3 text-sm font-bold transition-colors hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]">
            {content.backHome}
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
