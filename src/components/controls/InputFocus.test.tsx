// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { DyeSearchInput } from './DyeSearchInput';
import { ItemSearchInput } from './ItemSearchInput';

vi.mock('../../features/search/useItemSearchCombobox', () => ({
  useItemSearchCombobox: () => ({
    containerRef: { current: null },
    inputRef: { current: null },
    listboxId: 'item-search-results',
    localValue: '',
    debouncedQuery: '',
    filteredResults: [],
    selectedIndex: -1,
    isLoading: false,
    error: null,
    shouldShowDropdown: false,
    handleChange: vi.fn(),
    handleFocus: vi.fn(),
    handleBlur: vi.fn(),
    handleKeyDown: vi.fn(),
    handleSelect: vi.fn(),
    preload: vi.fn(),
    setSelectedIndex: vi.fn(),
  }),
}));

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('input focus treatment', () => {
  it('uses the shared focus boundary for item and dye searches', () => {
    act(() => {
      root.render(
        <>
          <ItemSearchInput
            value=""
            currentSlot="head"
            onNameChange={vi.fn()}
            onSelect={vi.fn()}
          />
          <DyeSearchInput value="" onChange={vi.fn()} placeholder="염색 1" />
        </>,
      );
    });

    const itemInput = container.querySelector<HTMLInputElement>('input[name="item-search-head"]');
    const dyeInput = container.querySelector<HTMLInputElement>('input[aria-label="염색 1"]');
    const dyeShell = dyeInput?.parentElement;

    expect(itemInput).not.toBeNull();
    expect(itemInput?.classList.contains('input-focus-control')).toBe(true);
    expect(itemInput?.className).not.toContain('focus:ring-1');

    expect(dyeShell?.classList.contains('input-focus-shell')).toBe(true);
    expect(dyeInput?.classList.contains('input-focus-proxy')).toBe(true);
  });
});
