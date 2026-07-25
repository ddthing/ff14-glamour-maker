import { useTranslation } from 'react-i18next';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';

export function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--bg-app)] text-[var(--text-primary)]">
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center gap-5 px-6 py-16"
      >
        <p className="font-mono text-sm font-bold text-[var(--accent)]">404</p>
        <h1 className="text-3xl font-black tracking-tight">{t('common.not_found_title')}</h1>
        <p className="max-w-xl leading-relaxed text-[var(--text-secondary)]">
          {t('common.not_found_description')}
        </p>
        <a
          href="/"
          className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] bg-[var(--surface-300)] px-6 py-3 text-sm font-bold transition-colors hover:bg-[var(--accent)] hover:text-white"
        >
          {t('common.back_home')}
        </a>
      </main>
      <Footer />
    </div>
  );
}
