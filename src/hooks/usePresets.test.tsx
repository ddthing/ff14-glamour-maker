// @vitest-environment jsdom

import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INITIAL_STATE } from '../constants/initialState';
import { usePresets, type RemovedPreset, type UsePresetsReturn } from './usePresets';

let container: HTMLDivElement;
let root: Root;
let current: UsePresetsReturn;
const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

function Harness() {
  const presets = usePresets();
  useEffect(() => {
    current = presets;
  }, [presets]);
  return null;
}

beforeEach(() => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<Harness />));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

describe('usePresets', () => {
  it('restores a deleted preset at its original position', () => {
    act(() => {
      current.addPreset('첫 번째', INITIAL_STATE);
      current.addPreset('두 번째', INITIAL_STATE);
    });

    let removed: RemovedPreset | null = null;
    act(() => {
      removed = current.removePreset(current.presets[0].id);
    });
    expect(current.presets.map(preset => preset.name)).toEqual(['두 번째']);

    act(() => {
      if (removed) current.restorePreset(removed.preset, removed.index);
    });
    expect(current.presets.map(preset => preset.name)).toEqual(['첫 번째', '두 번째']);
  });

  it('does not update UI state when localStorage persistence fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError');
    });

    let saved = true;
    act(() => {
      saved = current.addPreset('저장 실패', INITIAL_STATE);
    });

    expect(saved).toBe(false);
    expect(current.presets).toEqual([]);
    expect(current.error).toBe('storage-failed');
  });
});
