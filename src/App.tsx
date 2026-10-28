import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PreviewCanvas } from './components/canvas/PreviewCanvas';
import { ControlPanel } from './components/controls/ControlPanel';
import type { ControlTab } from './components/controls/ControlTabs';
import { StudioPreviewToolbar } from './components/studio/StudioPreviewToolbar';
import { useStudioKeyboardShortcuts } from './components/studio/useStudioKeyboardShortcuts';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { EditorTour } from './components/onboarding/EditorTour';
import { useStudioState } from './features/studio/useStudioState';
import { useGlamourActions } from './features/glamour/useGlamourActions';

function App() {
  const { t } = useTranslation();
  const [activeControlTab, setActiveControlTab] = useState<ControlTab>('equipment');
  const previousControlTab = useRef<ControlTab | null>(null);
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

  const handleTourStart = () => {
    previousControlTab.current = activeControlTab;
  };
  const handleTourStepChange = (index: number) => {
    if (index === 1 || index === 2) setActiveControlTab('equipment');
    if (index === 3) setActiveControlTab('general');
  };
  const handleTourFinish = () => {
    if (previousControlTab.current) setActiveControlTab(previousControlTab.current);
    previousControlTab.current = null;
  };

  useStudioKeyboardShortcuts({ canUndo, canRedo, undo, redo });

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      <Header />

      <div className="workspace-shell mx-auto flex w-full max-w-[1480px] flex-1 px-3 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-3 lg:px-10 lg:pb-6 lg:pt-3">
        <main id="main-content" tabIndex={-1} aria-labelledby="app-page-title" className="w-full min-w-0">
          <h1 id="app-page-title" className="sr-only">{t('common.series_label')}</h1>

          <div className="workspace-grid w-full min-w-0 items-stretch">
            <aside className="workspace-controls flex w-full min-w-0 flex-col self-stretch">
              <ControlPanel
                state={state}
                actions={actions}
                activeTab={activeControlTab}
                onTabChange={setActiveControlTab}
              />
            </aside>

            <div className="workspace-preview flex min-w-0 flex-col self-stretch">
              <StudioPreviewToolbar
                draftStatus={draftStatus}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
                retrySave={retrySave}
                helpControl={(
                  <EditorTour
                    onStart={handleTourStart}
                    onStepChange={handleTourStepChange}
                    onFinish={handleTourFinish}
                  />
                )}
              />
              <div className="studio-preview-canvas-shell">
                <PreviewCanvas state={state} onPhotoConfirm={actions.setPhoto} />
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;
