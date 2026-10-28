// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from './i18n';
import App from './App';

const stubs = vi.hoisted(() => ({
  state: {
    imageSrc: null,
    croppedImageSrc: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
    title: '',
    creator: '',
    items: {},
    fashionAccessory: null,
  },
  setState: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
  retrySave: vi.fn(),
}));

vi.mock('./components/layout/Header', () => ({ Header: () => <header /> }));
vi.mock('./components/layout/Footer', () => ({ Footer: () => <footer /> }));
vi.mock('./components/canvas/PreviewCanvas', () => ({
  PreviewCanvas: () => <div data-testid="preview-canvas" />,
}));
vi.mock('./components/controls/ControlPanel', () => ({
  ControlPanel: ({
    activeTab,
    onTabChange,
  }: {
    activeTab: string;
    onTabChange: (tab: 'equipment' | 'general') => void;
  }) => (
    <section className="control-panel" data-testid="control-panel" data-active-tab={activeTab}>
      <button type="button" data-testid="select-general" onClick={() => onTabChange('general')}>
        Select settings
      </button>
    </section>
  ),
}));
vi.mock('./components/onboarding/EditorTour', () => ({
  EditorTour: ({
    onStart,
    onStepChange,
    onFinish,
  }: {
    onStart?: () => void;
    onStepChange?: (index: number) => void;
    onFinish?: () => void;
  }) => (
    <div data-testid="editor-tour">
      <button type="button" data-testid="tour-start" onClick={onStart}>Help</button>
      {[1, 2, 3].map(index => (
        <button
          key={index}
          type="button"
          data-testid={`tour-step-${index}`}
          onClick={() => onStepChange?.(index)}
        >
          Step {index}
        </button>
      ))}
      <button type="button" data-testid="tour-finish" onClick={onFinish}>Finish</button>
    </div>
  ),
}));
vi.mock('./components/studio/useStudioKeyboardShortcuts', () => ({
  useStudioKeyboardShortcuts: vi.fn(),
}));
vi.mock('./features/studio/useStudioState', () => ({
  useStudioState: () => ({
    state: stubs.state,
    setState: stubs.setState,
    undo: stubs.undo,
    redo: stubs.redo,
    canUndo: false,
    canRedo: false,
    draftStatus: 'saved',
    retrySave: stubs.retrySave,
  }),
}));
vi.mock('./features/glamour/useGlamourActions', () => ({
  useGlamourActions: () => ({ setPhoto: vi.fn() }),
}));

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  await i18n.changeLanguage('ko');
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<App />));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function click(testId: string) {
  const button = container.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`);
  if (!button) throw new Error(`Missing test button: ${testId}`);
  act(() => button.click());
}

describe('App editor shell', () => {
  it('lands directly on the editor without promotional sections', () => {
    expect(container.querySelector('#app-page-title')?.textContent).toBeTruthy();
    expect(container.querySelector('.workspace-grid')).not.toBeNull();
    expect(container.querySelector('[data-testid="preview-canvas"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="control-panel"]')).not.toBeNull();
    expect(container.querySelector('.home-intro')).toBeNull();
    expect(container.querySelector('.home-value-section')).toBeNull();
    expect(container.querySelector('.studio-overview')).toBeNull();
    expect(container.querySelector('[data-testid="editor-tour"]')).not.toBeNull();
  });

  it('switches the control tab for tour steps and restores the tab selected before the tour', () => {
    const panel = () => container.querySelector<HTMLElement>('[data-testid="control-panel"]');

    expect(panel()?.dataset.activeTab).toBe('equipment');
    click('tour-start');
    click('tour-step-1');
    expect(panel()?.dataset.activeTab).toBe('equipment');
    click('tour-step-2');
    expect(panel()?.dataset.activeTab).toBe('equipment');
    click('tour-step-3');
    expect(panel()?.dataset.activeTab).toBe('general');
    click('tour-finish');
    expect(panel()?.dataset.activeTab).toBe('equipment');
  });
});
