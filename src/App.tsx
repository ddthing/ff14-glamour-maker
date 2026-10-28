import { useTranslation } from 'react-i18next';
import { PreviewCanvas } from './components/canvas/PreviewCanvas';
import { ControlPanel } from './components/controls/ControlPanel';
import { StudioOverview } from './components/studio/StudioOverview';
import { StudioPreviewToolbar } from './components/studio/StudioPreviewToolbar';
import { useStudioKeyboardShortcuts } from './components/studio/useStudioKeyboardShortcuts';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomeValueSection } from './components/home/HomeValueSection';
import { useStudioState } from './features/studio/useStudioState';
import { useGlamourActions } from './features/glamour/useGlamourActions';

function App() {
  const { t } = useTranslation();
  const {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    draftStatus,
    retrySave,
  } = useStudioState();
  const actions = useGlamourActions(setState);
  const hasPhoto = Boolean(state.croppedImageSrc);
  const hasEquipment = Object.values(state.items).some(item => Boolean(item.name))
    || state.fashionAccessory !== null;

  useStudioKeyboardShortcuts({ canUndo, canRedo, undo, redo });

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      <Header />

      <div className="workspace-shell mx-auto flex w-full max-w-[1480px] flex-1 px-3 pb-10 pt-4 sm:px-5 sm:pt-6 lg:px-10 lg:pb-14 lg:pt-8">
        <main id="main-content" tabIndex={-1} aria-labelledby="app-page-title" className="w-full min-w-0">
          <StudioOverview hasPhoto={hasPhoto} hasEquipment={hasEquipment} />

          <div className="workspace-grid w-full min-w-0 items-stretch">
            <aside className="workspace-controls flex w-full min-w-0 flex-col self-stretch">
              <ControlPanel state={state} actions={actions} />
            </aside>

            <div className="workspace-preview flex min-w-0 flex-col self-stretch">
              <StudioPreviewToolbar
                draftStatus={draftStatus}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
                retrySave={retrySave}
              />
              <div className="studio-preview-canvas-shell">
                <PreviewCanvas state={state} onPhotoConfirm={actions.setPhoto} />
              </div>
            </div>
          </div>

          <section className="home-intro" aria-labelledby="home-intro-title">
            <div className="home-intro-copy">
              <p className="content-eyebrow">{t('common.home_intro_eyebrow')}</p>
              <h2 id="home-intro-title" className="home-intro-title">
                {t('common.home_intro_title')}
              </h2>
              <p className="home-intro-description">{t('common.home_intro_description')}</p>
            </div>
            <ul className="home-intro-proof-list" aria-label={t('common.home_intro_proof_label')}>
              <li>{t('common.home_proof_photo')}</li>
              <li>{t('common.home_proof_items')}</li>
              <li>{t('common.home_proof_post')}</li>
            </ul>
          </section>

          <HomeValueSection />
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;
