import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PreviewCanvas } from './components/canvas/PreviewCanvas';
import { ControlPanel } from './components/controls/ControlPanel';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomeValueSection } from './components/home/HomeValueSection';
import { createInitialState } from './features/glamour/stateFactory';
import { useGlamourActions } from './features/glamour/useGlamourActions';
import type { AppState } from './types';

function App() {
  const { t } = useTranslation();
  const [state, setState] = useState<AppState>(createInitialState);
  const actions = useGlamourActions(setState);

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      <Header />

      <div className="workspace-shell mx-auto flex w-full max-w-[1480px] flex-1 px-3 pb-10 pt-4 sm:px-5 sm:pt-6 lg:px-10 lg:pb-14 lg:pt-8">
        <main id="main-content" tabIndex={-1} aria-labelledby="app-page-title" className="w-full min-w-0">
          <section className="home-intro" aria-labelledby="app-page-title">
            <div className="home-intro-copy">
              <p className="content-eyebrow">{t('common.home_intro_eyebrow')}</p>
              <h1 id="app-page-title" className="home-intro-title">
                {t('common.home_intro_title')}
              </h1>
              <p className="home-intro-description">{t('common.home_intro_description')}</p>
            </div>
            <ul className="home-intro-proof-list" aria-label={t('common.home_intro_proof_label')}>
              <li>{t('common.home_proof_photo')}</li>
              <li>{t('common.home_proof_items')}</li>
              <li>{t('common.home_proof_post')}</li>
            </ul>
          </section>

          <div className="mt-5 grid w-full min-w-0 grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-8">
            <div className="flex min-w-0 flex-col self-stretch">
              <PreviewCanvas state={state} onPhotoConfirm={actions.setPhoto} />
            </div>

            <aside className="flex w-full min-w-0 flex-col self-stretch">
              <ControlPanel state={state} actions={actions} />
            </aside>
          </div>

          <HomeValueSection />
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;
