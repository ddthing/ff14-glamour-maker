import { useLocalizedPageContent } from '../content/localizedPages';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';

export function Faq() {
  const { faq } = useLocalizedPageContent();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--bg-app)]">
      <Header />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="mb-8 text-3xl font-black">{faq.title}</h1>
        <div className="space-y-5">
          {faq.entries.map(entry => (
            <section key={entry.question} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-panel)] p-6">
              <h2 className="mb-2 text-lg font-bold">{entry.question}</h2>
              <p className="leading-relaxed text-[var(--text-secondary)]">{entry.answer}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
