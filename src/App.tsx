import { PreviewCanvas } from './components/canvas/PreviewCanvas';
import { ControlPanel } from './components/controls/ControlPanel';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { useUrlState } from './hooks/useUrlState';
import { INITIAL_ITEMS } from './constants/initialState';

/**
 * App — Senior Architect Layout
 * min-h-screen: allows the page to scroll naturally
 */
function App() {
  const [state, setState] = useUrlState();

  return (
    <div className="min-h-screen flex flex-col w-full bg-[var(--bg-app)]">

      {/* ── Header (shrink-0: fixed height) ── */}
      <Header />

      {/* ── Workspace ── */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 flex justify-center mt-6 mb-12">

        {/* Central Workspace (Stage) */}
        <main className="w-full flex flex-col lg:flex-row gap-4 lg:gap-8 h-auto items-stretch">
          {/* Left: Canvas */}
          <div className="flex-1 min-w-0 flex flex-col h-full">
            <PreviewCanvas state={state} setState={setState} />
          </div>

          {/* Right: Control Sidebar */}
          <aside className="w-full lg:w-[400px] shrink-0 flex flex-col h-[600px] lg:h-full">
            <ControlPanel
              state={state}
              setState={setState}
              onResetItems={() => setState(s => ({ ...s, items: INITIAL_ITEMS }))}
            />
          </aside>
        </main>

        {/* Ad Rail removed */}
      </div>

      {/* ── Footer ── */}
      <Footer />

    </div>
  );
}

export default App;
