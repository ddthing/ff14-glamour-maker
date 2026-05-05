import { PreviewCanvas } from './components/canvas/PreviewCanvas';
import { ControlPanel } from './components/controls/ControlPanel';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AdBanner } from './components/ads/AdBanner';
import { useUrlState } from './hooks/useUrlState';
import { INITIAL_ITEMS } from './constants/initialState';

/**
 * App — Senior Architect Layout
 * h-screen + overflow-hidden: viewport is exactly the height of the screen.
 * No page scroll. Sidebar scrolls independently.
 */
function App() {
  const [state, setState] = useUrlState();

  return (
    // h-screen + overflow-hidden = viewport is locked. No external scroll.
    <div className="flex flex-col h-screen overflow-hidden w-full" style={{ background: '#f7f6f2' }}>

      {/* ── Header (shrink-0: fixed height) ── */}
      <Header />

      {/* ── Workspace: grows to fill remaining height ── */}
      <div className="flex-1 overflow-hidden w-full grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_minmax(auto,80rem)_minmax(0,1fr)]">

        {/* Left Ad Rail */}
        <div className="hidden 2xl:flex items-center justify-end px-6">
          <AdBanner
            slot="LEFT_RAIL"
            format="vertical"
            className="w-[160px] h-[600px] border border-black/5 rounded-xl"
          />
        </div>

        {/* Central Workspace — internal scroll only */}
        <main className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-10 p-3 sm:p-6 md:p-8 overflow-y-auto">
          {/* Left: Canvas */}
          <div className="flex-1 min-w-0 flex flex-col">
            <PreviewCanvas state={state} setState={setState} />
          </div>

          {/* Right: Control Sidebar */}
          <aside className="w-full lg:w-[400px] xl:w-[420px] shrink-0 flex flex-col">
            <ControlPanel
              state={state}
              setState={setState}
              onResetItems={() => setState(s => ({ ...s, items: INITIAL_ITEMS }))}
            />
          </aside>
        </main>

        {/* Right Ad Rail */}
        <div className="hidden 2xl:flex items-center justify-start px-6">
          <AdBanner
            slot="RIGHT_RAIL"
            format="vertical"
            className="w-[160px] h-[600px] border border-black/5 rounded-xl"
          />
        </div>
      </div>

      {/* ── Footer (shrink-0: always at the absolute bottom) ── */}
      <Footer />

    </div>
  );
}

export default App;
