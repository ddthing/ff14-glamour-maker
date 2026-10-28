// @vitest-environment jsdom

import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { EditorTour } from './EditorTour';

const tours = [
  { id: 'photo', view: 0, left: 10, top: 120, width: 355, height: 290 },
  { id: 'slots', view: 1, left: 10, top: 180, width: 355, height: 410 },
  { id: 'search', view: 1, left: 20, top: 320, width: 335, height: 52 },
  { id: 'settings', view: 2, left: 10, top: 90, width: 355, height: 240 },
  { id: 'export', view: 3, left: 250, top: 590, width: 105, height: 44 },
] as const;

let container: HTMLDivElement;
let root: Root;
let frameQueue: FrameRequestCallback[];
let reducedMotion = true;
let mediaListeners: Array<(event: MediaQueryListEvent) => void>;
let rootMounted = true;
let originalBodyTabIndex: string | null;
const reactTestEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean };

function makeRect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect;
}

function TestEditor({ onStart, onStepChange, onFinish }: {
  onStart: () => void;
  onStepChange: (index: number) => void;
  onFinish: () => void;
}) {
  const [view, setView] = useState(0);

  return (
    <>
      {tours.map(target => {
        let top: number = target.top;
        return (
          <div
            key={target.id}
            data-tour={target.id}
            hidden={view !== target.view}
            ref={element => {
              if (!element) return;
              element.getBoundingClientRect = () => makeRect(target.left, top, target.width, target.height);
              element.getClientRects = () => ({ length: 1 } as DOMRectList);
              element.scrollIntoView = vi.fn(options => {
                top = options?.block === 'start'
                  ? 64
                  : (window.innerHeight - target.height) / 2;
              });
            }}
          />
        );
      })}
      <EditorTour
        onStart={onStart}
        onStepChange={index => {
          setView(index === 0 ? 0 : index <= 2 ? 1 : index === 3 ? 2 : 3);
          onStepChange(index);
        }}
        onFinish={onFinish}
      />
    </>
  );
}

async function flushFrames(count = 5): Promise<void> {
  await act(async () => {
    for (let index = 0; index < count; index += 1) {
      const callbacks = frameQueue;
      frameQueue = [];
      callbacks.forEach(callback => callback(performance.now() + 1000));
      await Promise.resolve();
    }
  });
}

function trigger(): HTMLButtonElement {
  const button = container.querySelector<HTMLButtonElement>('.u197-help-trigger');
  if (!button) throw new Error('Tour trigger was not rendered');
  return button;
}

function nextButton(): HTMLButtonElement {
  const button = document.querySelector<HTMLButtonElement>('.u197-nx');
  if (!button) throw new Error('Tour next button was not rendered');
  return button;
}

beforeEach(async () => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  await act(async () => { await i18n.changeLanguage('ko'); });
  originalBodyTabIndex = document.body.getAttribute('tabindex');

  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 667 });
  frameQueue = [];
  reducedMotion = true;
  mediaListeners = [];

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    frameQueue.push(callback);
    return frameQueue.length;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    get matches() { return reducedMotion; },
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      if (typeof listener === 'function') mediaListeners.push(listener as (event: MediaQueryListEvent) => void);
    },
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  } as unknown as MediaQueryList)));

  container = document.createElement('div');
  container.id = 'root';
  document.body.appendChild(container);
  root = createRoot(container);
  rootMounted = true;
});

afterEach(() => {
  if (rootMounted) act(() => root.unmount());
  container.remove();
  if (originalBodyTabIndex === null) document.body.removeAttribute('tabindex');
  else document.body.setAttribute('tabindex', originalBodyTabIndex);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

describe('EditorTour', () => {
  it('starts only on request, waits for tab targets, and supports previous/next navigation', async () => {
    const starts = vi.fn();
    const changes = vi.fn();
    const finishes = vi.fn();
    act(() => root.render(<TestEditor onStart={starts} onStepChange={changes} onFinish={finishes} />));

    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(starts).not.toHaveBeenCalled();

    act(() => trigger().click());
    expect(starts).toHaveBeenCalledTimes(1);
    expect(changes).toHaveBeenLastCalledWith(0);
    expect(container.inert).toBe(true);
    await flushFrames();

    const path = document.querySelector<SVGPathElement>('.u197-ov path');
    expect(path?.getAttribute('fill-rule')).toBe('evenodd');
    expect(path?.getAttribute('d')).toContain('M0 0H375V667H0Z');
    expect(path?.getAttribute('d')).toContain('M18 ');

    const previousTipLeft = document.querySelector<HTMLElement>('.u197-tip')?.style.left;
    act(() => nextButton().click());
    expect(changes).toHaveBeenLastCalledWith(1);
    expect(document.querySelector<HTMLElement>('.u197-tip')?.style.left).toBe(previousTipLeft);
    await flushFrames();
    expect(document.querySelector('.u197-tip')?.getAttribute('data-step')).toBe('2');
    expect(document.querySelector('[data-tour="slots"]')?.hasAttribute('hidden')).toBe(false);
    expect(document.querySelector('[data-tour="slots"]')?.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'start', inline: 'nearest' }),
    );

    act(() => nextButton().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })));
    expect(changes).toHaveBeenLastCalledWith(2);
    await flushFrames();
    act(() => nextButton().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })));
    expect(changes).toHaveBeenLastCalledWith(1);
    await flushFrames();

    act(() => document.querySelector<HTMLButtonElement>('.u197-pv')?.click());
    expect(changes).toHaveBeenLastCalledWith(0);
    expect(finishes).not.toHaveBeenCalled();
  });

  it('traps tab focus, blocks editor history shortcuts, and restores focus on Escape', async () => {
    const starts = vi.fn();
    const changes = vi.fn();
    const finishes = vi.fn();
    act(() => root.render(<TestEditor onStart={starts} onStepChange={changes} onFinish={finishes} />));
    document.body.tabIndex = 0;
    document.body.focus();
    expect(document.activeElement).toBe(document.body);
    act(() => trigger().click());
    await flushFrames();

    expect(document.activeElement).toBe(nextButton());
    const skipButton = document.querySelector<HTMLButtonElement>('.u197-x');
    expect(skipButton).not.toBeNull();

    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })));
    expect(document.activeElement).toBe(skipButton);
    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })));
    expect(document.activeElement).toBe(nextButton());

    const appShortcut = vi.fn();
    window.addEventListener('keydown', appShortcut);
    const historyEvent = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true });
    act(() => nextButton().dispatchEvent(historyEvent));
    expect(historyEvent.defaultPrevented).toBe(true);
    expect(appShortcut).not.toHaveBeenCalled();
    window.removeEventListener('keydown', appShortcut);

    act(() => nextButton().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(container.inert).toBe(false);
    expect(document.activeElement).toBe(trigger());
    expect(finishes).toHaveBeenCalledTimes(1);
  });

  it('applies reduced motion and cleans up listeners and inert state on unmount', async () => {
    const finishes = vi.fn();
    act(() => root.render(<TestEditor onStart={vi.fn()} onStepChange={vi.fn()} onFinish={finishes} />));
    act(() => trigger().click());
    await flushFrames();
    expect(document.querySelector('.u197')?.getAttribute('data-has-target')).toBe('true');
    expect(document.querySelector<SVGPathElement>('.u197-ov path')?.getAttribute('d')).toContain('M18 ');
    expect(container.inert).toBe(true);

    act(() => root.unmount());
    rootMounted = false;
    expect(container.inert).toBe(false);
    container.remove();
    act(() => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(finishes).not.toHaveBeenCalled();
    vi.restoreAllMocks();
    reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
  });

  it('keeps navigation available when a requested target is missing', async () => {
    act(() => root.render(<EditorTour onStepChange={vi.fn()} />));
    act(() => trigger().click());
    await flushFrames(95);

    expect(document.querySelector('#u197-description')?.textContent).toContain('찾을 수 없어요');
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(nextButton()).not.toBeNull();
  });

  it('provides complete Korean, English, and Japanese walkthrough copy', () => {
    for (const language of ['ko', 'en', 'ja']) {
      const tour = i18n.getResourceBundle(language, 'translation').tour;
      expect(tour.start).toBeTruthy();
      expect(tour.steps.photo.description).toBeTruthy();
      expect(tour.steps.slots.description).toBeTruthy();
      expect(tour.steps.search.description).toBeTruthy();
      expect(tour.steps.settings.description).toBeTruthy();
      expect(tour.steps.export.description).toBeTruthy();
    }
  });
});
