// @vitest-environment jsdom

import { act, createElement, memo, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INITIAL_STATE } from '../../constants/initialState';
import type { AppState } from '../../types';
import i18n from '../../i18n';
import { PreviewCanvas } from './PreviewCanvas';

const renderCounters = vi.hoisted(() => ({
  photo: vi.fn(),
  info: vi.fn(),
}));

const uploadMock = vi.hoisted(() => ({
  fileInputRef: { current: null },
  pendingImage: null,
  clearPendingImage: vi.fn(),
  error: null,
  isDragging: false,
  dragHandlers: {},
  onFileInputChange: vi.fn(),
}));

vi.mock('../../hooks/useImageUpload', () => ({
  useImageUpload: () => uploadMock,
}));

vi.mock('./InfoPanel', () => ({
  InfoPanel: () => {
    renderCounters.info();
    return <div data-testid="info-panel" />;
  },
}));

vi.mock('./PhotoPanel', async () => {
  const actual = await vi.importActual<typeof import('./PhotoPanel')>('./PhotoPanel');

  const TrackedPhotoPanel = memo((props: ComponentProps<typeof actual.PhotoPanel>) => {
    renderCounters.photo();
    return createElement(actual.PhotoPanel, props);
  });

  return { PhotoPanel: TrackedPhotoPanel };
});

let container: HTMLDivElement;
let root: Root;
let requestAnimationFrameSpy: ReturnType<typeof vi.spyOn>;
let cancelAnimationFrameSpy: ReturnType<typeof vi.spyOn>;

const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
  ResizeObserver: typeof ResizeObserver;
};

class ResizeObserverMock {
  observe() {}
  disconnect() {}
  unobserve() {}
}

function createState(overrides: Partial<AppState> = {}): AppState {
  return {
    ...INITIAL_STATE,
    ...overrides,
    crop: { ...INITIAL_STATE.crop },
    items: Object.fromEntries(
      Object.entries(overrides.items ?? INITIAL_STATE.items)
        .map(([slot, item]) => [slot, { ...item }]),
    ) as AppState['items'],
  };
}

function renderPreview(state: AppState) {
  act(() => root.render(
    <PreviewCanvas state={state} onPhotoConfirm={vi.fn()} />,
  ));
}

beforeEach(() => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  reactTestEnvironment.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
  requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')
    .mockImplementation(() => 1);
  cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame')
    .mockImplementation(() => undefined);
  renderCounters.photo.mockClear();
  renderCounters.info.mockClear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  requestAnimationFrameSpy.mockRestore();
  cancelAnimationFrameSpy.mockRestore();
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

describe('PreviewCanvas render isolation', () => {
  it('does not propagate photo hover into the information panel', () => {
    renderPreview(createState({ croppedImageSrc: 'blob:photo' }));
    const infoRenders = renderCounters.info.mock.calls.length;

    const photoPanel = container.querySelector<HTMLElement>('[role="button"]');
    if (!photoPanel) throw new Error('Missing photo panel');
    act(() => photoPanel.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));

    expect(renderCounters.info).toHaveBeenCalledTimes(infoRenders);
    expect(container.textContent).toContain(i18n.t('common.replace_image'));

    act(() => photoPanel.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })));
    expect(container.textContent).not.toContain(i18n.t('common.replace_image'));
  });

  it('does not render the photo panel for an equipment-only update', () => {
    const initial = createState({ croppedImageSrc: 'blob:photo' });
    renderPreview(initial);
    const photoRenders = renderCounters.photo.mock.calls.length;
    const nextItems = {
      ...initial.items,
      head: { ...initial.items.head, name: 'Friendship Circlet' },
    };

    renderPreview({ ...initial, items: nextItems });

    expect(renderCounters.photo).toHaveBeenCalledTimes(photoRenders);
    expect(renderCounters.info.mock.calls.length).toBeGreaterThan(1);
  });

  it('renders both panels when the photo changes', () => {
    const initial = createState({ croppedImageSrc: 'blob:photo-1' });
    renderPreview(initial);
    const photoRenders = renderCounters.photo.mock.calls.length;
    const infoRenders = renderCounters.info.mock.calls.length;

    renderPreview({ ...initial, croppedImageSrc: 'blob:photo-2' });

    expect(renderCounters.photo).toHaveBeenCalledTimes(photoRenders + 1);
    expect(renderCounters.info).toHaveBeenCalledTimes(infoRenders + 1);
  });
});
