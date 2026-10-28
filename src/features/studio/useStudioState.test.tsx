// @vitest-environment jsdom

import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../glamour/stateFactory';
import type { AppState } from '../../types';
import type { StudioDraftLoadResult, StudioDraftRepository } from './draftStorage';
import {
  STUDIO_HISTORY_PHOTO_MEMORY_LIMIT_BYTES,
  useStudioState,
  type UseStudioStateResult,
} from './useStudioState';

const mocks = vi.hoisted(() => ({
  load: vi.fn<StudioDraftRepository['load']>(),
  save: vi.fn<StudioDraftRepository['save']>(),
}));

vi.mock('./draftStorage', () => ({
  createStudioDraftRepository: () => ({ load: mocks.load, save: mocks.save }),
}));

const PHOTO = 'data:image/png;base64,YWJj';
const CROPPED_PHOTO = 'data:image/jpeg;base64,ZGVm';
const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

let container: HTMLDivElement;
let root: Root;
let current: UseStudioStateResult;

function Harness() {
  const studioState = useStudioState();
  useEffect(() => {
    current = studioState;
  }, [studioState]);
  return null;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

async function flushPromises(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function advanceAndFlush(milliseconds: number): Promise<void> {
  await act(async () => {
    vi.advanceTimersByTime(milliseconds);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

function renderHook(): void {
  act(() => root.render(<Harness />));
}

beforeEach(() => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  vi.clearAllMocks();
  mocks.load.mockResolvedValue({ status: 'empty' });
  mocks.save.mockResolvedValue();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  renderHook();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.clearAllTimers();
  vi.useRealTimers();
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

describe('useStudioState', () => {
  it('coalesces continuous text edits while preserving separate item and photo history', async () => {
    await flushPromises();
    expect(current.state.title).toBe('');

    act(() => current.setState(previous => ({ ...previous, title: 'M' })));
    act(() => current.setState(previous => ({ ...previous, title: 'Midnight' })));
    act(() => current.setState(previous => ({
      ...previous,
      imageSrc: PHOTO,
      croppedImageSrc: CROPPED_PHOTO,
    })));
    act(() => current.setState(previous => ({
      ...previous,
      items: { ...previous.items, head: { ...previous.items.head, name: 'Fending Hood' } },
    })));

    act(() => current.undo());
    expect(current.state.items.head.name).toBe('');
    expect(current.state.title).toBe('Midnight');
    expect(current.state.imageSrc).toBe(PHOTO);

    act(() => current.undo());
    expect(current.state.imageSrc).toBeNull();
    expect(current.state.title).toBe('Midnight');

    act(() => current.undo());
    expect(current.state.title).toBe('');
    expect(current.canUndo).toBe(false);

    act(() => current.redo());
    expect(current.state.title).toBe('Midnight');
    expect(current.canRedo).toBe(true);
  });

  it('bounds history and clears redo after a new edit', async () => {
    await flushPromises();
    for (let value = 1; value <= 55; value += 1) {
      act(() => current.setState(previous => ({ ...previous, crop: { ...previous.crop, x: value } })));
    }

    let undoCount = 0;
    while (current.canUndo) {
      act(() => current.undo());
      undoCount += 1;
    }
    expect(undoCount).toBe(50);
    expect(current.state.crop.x).toBe(5);
    expect(current.canRedo).toBe(true);

    act(() => current.setState(previous => ({ ...previous, creator: '@new-look' })));
    expect(current.canRedo).toBe(false);
  });

  it('trims old photo generations to the memory budget while retaining recent edits', async () => {
    await flushPromises();
    const suffix = 'A'.repeat(9 * 1024 * 1024);
    const photoGenerations = ['one', 'two', 'three', 'four', 'five'].map(
      label => `data:image/png;base64,${label}${suffix}`,
    );

    for (const imageSrc of photoGenerations) {
      act(() => current.setState(previous => ({ ...previous, imageSrc })));
    }

    expect(STUDIO_HISTORY_PHOTO_MEMORY_LIMIT_BYTES).toBe(64 * 1024 * 1024);
    expect(current.state.imageSrc).toBe(photoGenerations[4]);
    act(() => current.undo());
    expect(current.state.imageSrc).toBe(photoGenerations[3]);
    act(() => current.undo());
    expect(current.state.imageSrc).toBe(photoGenerations[2]);
    expect(current.canUndo).toBe(false);
  });

  it('debounces local saves and only reports saved after persistence resolves', async () => {
    await flushPromises();
    expect(current.draftStatus).toBe('saved');
    let finishSave!: () => void;
    mocks.save.mockImplementation(() => new Promise<void>(resolve => { finishSave = resolve; }));

    act(() => current.setState(previous => ({ ...previous, title: 'Saved later' })));
    expect(current.draftStatus).toBe('saving');
    await advanceAndFlush(399);
    expect(mocks.save).not.toHaveBeenCalled();

    await advanceAndFlush(1);
    expect(mocks.save).toHaveBeenCalledOnce();
    expect(current.draftStatus).toBe('saving');

    await act(async () => {
      finishSave();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(current.draftStatus).toBe('saved');
  });

  it('restores a valid local draft with its photos and leaves edits made during loading intact', async () => {
    const pendingLoad = deferred<StudioDraftLoadResult>();
    const restored: AppState = {
      ...createInitialState(),
      title: 'Old title',
      imageSrc: PHOTO,
      croppedImageSrc: CROPPED_PHOTO,
    };
    mocks.load.mockReturnValue(pendingLoad.promise);

    act(() => root.unmount());
    root = createRoot(container);
    renderHook();
    expect(current.draftStatus).toBe('loading');

    act(() => current.setState(previous => ({ ...previous, title: 'New edit' })));
    await act(async () => {
      pendingLoad.resolve({ status: 'valid', state: restored });
      await pendingLoad.promise;
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(current.state.title).toBe('New edit');
    expect(current.state.imageSrc).toBeNull();
    expect(current.draftStatus).toBe('saving');
    await advanceAndFlush(400);
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'New edit' }));
  });

  it('restores the saved draft when pre-hydration edits are undone to the initial state', async () => {
    const pendingLoad = deferred<StudioDraftLoadResult>();
    const restored: AppState = { ...createInitialState(), title: 'Persisted title' };
    mocks.load.mockReturnValue(pendingLoad.promise);

    act(() => root.unmount());
    root = createRoot(container);
    renderHook();

    act(() => current.setState(previous => ({ ...previous, title: 'Temporary edit' })));
    act(() => current.undo());
    expect(current.state.title).toBe('');
    expect(current.canRedo).toBe(true);

    await act(async () => {
      pendingLoad.resolve({ status: 'valid', state: restored });
      await pendingLoad.promise;
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(current.state.title).toBe('Persisted title');
    expect(current.canUndo).toBe(false);
    expect(current.canRedo).toBe(false);
    expect(current.draftStatus).toBe('saved');
    await advanceAndFlush(400);
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('marks storage failures unavailable and lets retrySave recover', async () => {
    await flushPromises();
    mocks.save.mockRejectedValueOnce(new Error('quota denied'));
    act(() => current.setState(previous => ({ ...previous, title: 'Unsaved' })));
    await advanceAndFlush(400);
    expect(current.draftStatus).toBe('unavailable');

    mocks.save.mockResolvedValueOnce();
    act(() => current.retrySave());
    await advanceAndFlush(400);
    expect(current.draftStatus).toBe('saved');
  });

  it('reports a failed restore as unavailable while keeping the editor editable', async () => {
    mocks.load.mockRejectedValueOnce(new Error('IndexedDB disabled'));
    act(() => root.unmount());
    root = createRoot(container);
    renderHook();
    await flushPromises();

    expect(current.draftStatus).toBe('unavailable');
    act(() => current.setState(previous => ({ ...previous, title: 'Still usable' })));
    expect(current.state.title).toBe('Still usable');
    expect(current.draftStatus).toBe('saving');
  });
});
