// @vitest-environment jsdom

import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FF14Item } from '../../hooks/useFF14Search';
import { useItemSearchCombobox } from './useItemSearchCombobox';

const mocks = vi.hoisted(() => ({
  searchItems: vi.fn(),
  clearResults: vi.fn(),
  preloadSearchItems: vi.fn(() => Promise.resolve()),
  onNameChange: vi.fn(),
  onSelect: vi.fn(),
}));

const resultItem: FF14Item = {
  id: 1,
  name: 'Friendship Circlet',
  nameEn: 'Friendship Circlet',
  nameJa: 'フレンドシップサークレット',
  iconPath: '/fixture.png',
  uiCategory: 34,
};

vi.mock('../../hooks/useFF14Search', () => ({
  useFF14Search: () => ({
    results: [resultItem],
    isLoading: false,
    error: '',
    searchItems: mocks.searchItems,
    clearResults: mocks.clearResults,
  }),
}));

vi.mock('./loadSearchItems', () => ({
  preloadSearchItems: mocks.preloadSearchItems,
}));

type ComboboxState = ReturnType<typeof useItemSearchCombobox>;
let container: HTMLDivElement;
let root: Root;
let current: ComboboxState;
const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

function Harness() {
  const combobox = useItemSearchCombobox({
    value: '',
    currentSlot: 'head',
    onNameChange: mocks.onNameChange,
    onSelect: mocks.onSelect,
  });
  useEffect(() => { current = combobox; }, [combobox]);
  return null;
}

beforeEach(() => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  vi.clearAllMocks();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<Harness />));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

describe('useItemSearchCombobox', () => {
  it('preloads on focus and debounces the current slot search', () => {
    act(() => current.handleFocus());
    act(() => current.handleChange({ target: { value: 'circlet' } } as React.ChangeEvent<HTMLInputElement>));
    act(() => vi.advanceTimersByTime(199));

    expect(mocks.searchItems).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));

    expect(mocks.preloadSearchItems).toHaveBeenCalledWith('head');
    expect(mocks.searchItems).toHaveBeenCalledWith('circlet', 'head');
    expect(current.shouldShowDropdown).toBe(true);
  });

  it('selects the first filtered result with Enter', () => {
    act(() => current.handleFocus());
    act(() => current.handleChange({ target: { value: 'circlet' } } as React.ChangeEvent<HTMLInputElement>));
    act(() => vi.advanceTimersByTime(200));

    act(() => current.handleKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as React.KeyboardEvent<HTMLInputElement>));

    expect(mocks.onSelect).toHaveBeenCalledWith(resultItem);
  });
});
