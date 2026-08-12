import { useState } from 'react';
import { PreviewCanvas } from './components/canvas/PreviewCanvas';
import { ControlPanel } from './components/controls/ControlPanel';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { createInitialState } from './features/glamour/stateFactory';
import { useGlamourActions } from './features/glamour/useGlamourActions';
import type { AppState } from './types';

function App() {
  const [state, setState] = useState<AppState>(createInitialState);
  const actions = useGlamourActions(setState);

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      <Header />

      <div className="workspace-shell mx-auto flex w-full max-w-[1480px] flex-1 px-3 pb-10 pt-4 sm:px-5 sm:pt-6 lg:px-10 lg:pb-14 lg:pt-8">
        <main
          id="main-content"
          tabIndex={-1}
          className="grid w-full min-w-0 grid-cols-1 items-stretch gap-4 min-[1400px]:grid-cols-[minmax(0,1fr)_400px] min-[1400px]:gap-9"
        >
          <div className="flex min-w-0 flex-col self-stretch">
            <PreviewCanvas state={state} onPhotoConfirm={actions.setPhoto} />
          </div>

          <aside className="flex w-full min-w-0 flex-col self-stretch">
            <ControlPanel state={state} actions={actions} />
          </aside>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;
