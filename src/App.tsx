import { useEffect } from 'react';
import { PreviewCanvas } from './components/canvas/PreviewCanvas';
import { ControlPanel } from './components/controls/ControlPanel';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AdBanner } from './components/ads/AdBanner';
import { useUpdateCheck } from './hooks/useUpdateCheck';
import { useUrlState } from './hooks/useUrlState';

import { INITIAL_ITEMS } from './constants/initialState';

// ─── App Root ─────────────────────────────────────────────────────────────────
function App() {
  const [state, setState] = useUrlState();

  useUpdateCheck();

  // 앱 업데이트 감지 (독립 effect)
  useEffect(() => {
    const handleUpdate = () => {
      if (confirm('신규 버전이 출시되었습니다. 최신 기능을 적용하기 위해 페이지를 새로고침할까요?')) {
        window.location.reload();
      }
    };
    window.addEventListener('app-update-available', handleUpdate);
    return () => window.removeEventListener('app-update-available', handleUpdate);
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)] selection:bg-[var(--accent)] selection:text-white">

      {/* ── Header (Full Width) ─── */}
      <Header />

      {/* ── Main Workspace Row (Ads + Content) ─── */}
      <div className="flex-1 w-full grid grid-cols-1 2xl:grid-cols-[1fr_minmax(auto,80rem)_1fr] relative overflow-hidden">
        
        {/* ── Left Ad Rail (1fr) ── */}
        <div className="hidden 2xl:flex items-center justify-end pr-4 min-w-0">
              <AdBanner
                slot="LEFT_RAIL_SLOT_ID"
                format="vertical"
                className="w-[160px] h-[600px] border border-[var(--border)] rounded-xl"
              />
        </div>

        {/* ── Central Application (1280px max) ── */}
        <main
          id="main-content"
          className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-stretch px-6 md:px-10 py-6 lg:py-8 lg:min-h-0 min-w-0"
        >
          {/* Left Column: Preview Canvas */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 lg:min-h-0">
            {/* Canvas Container */}
            <div className="flex-1 min-h-0 min-w-0 flex items-center justify-start">
              <PreviewCanvas state={state} setState={setState} />
            </div>
          </div>

          {/* Right Column: Control Sidebar */}
          <aside className="w-full lg:w-[420px] shrink-0 lg:flex lg:flex-col lg:min-h-0 relative">
            {/* Desktop scroll container */}
            <div className="flex-1 lg:overflow-y-auto scrollbar-thin lg:absolute lg:inset-0 lg:-mr-4 lg:pr-4">
              <ControlPanel
                state={state}
                setState={setState}
                onResetItems={() => setState(s => ({ ...s, items: INITIAL_ITEMS }))}
              />
            </div>
          </aside>
        </main>

        {/* ── Right Ad Rail (1fr) ── */}
        <div className="hidden 2xl:flex items-center justify-start pl-4 min-w-0">
              <AdBanner
                slot="RIGHT_RAIL_SLOT_ID"
                format="vertical"
                className="w-[160px] h-[600px] border border-[var(--border)] rounded-xl"
              />
        </div>
      </div>

      {/* ── Footer (Full Width) ─── */}
      <Footer />

    </div>
  );
}

export default App;
