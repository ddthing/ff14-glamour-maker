// @vitest-environment jsdom

import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FF14Item } from '../features/search/types';
import { useFF14Search } from './useFF14Search';

const mocks = vi.hoisted(() => ({
  loadSearchItems: vi.fn(),
}));

vi.mock('../features/search/loadSearchItems', () => ({
  loadSearchItems: mocks.loadSearchItems,
}));

type SearchState = ReturnType<typeof useFF14Search>;
let container: HTMLDivElement;
let root: Root;
let current: SearchState;
const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

function Harness() {
  const search = useFF14Search();
  useEffect(() => {
    current = search;
  }, [search]);
  return null;
}

beforeEach(() => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<Harness />));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

describe('useFF14Search', () => {
  it('loads the requested slot dataset and caps rendered results at 50', async () => {
    const items: FF14Item[] = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      name: `Needle ${index + 1}`,
      nameEn: `Needle ${index + 1}`,
      nameJa: `Needle ${index + 1}`,
      source: 'item',
      searchKeys: [`needle${index + 1}`],
    }));
    mocks.loadSearchItems.mockResolvedValue(items);

    await act(async () => {
      await current.searchItems('needle', 'head');
    });

    expect(mocks.loadSearchItems).toHaveBeenCalledWith('head');
    expect(current.results).toHaveLength(50);
    expect(current.results.map(item => item.id)).toEqual(
      Array.from({ length: 50 }, (_, index) => index + 1),
    );
  });

  it('preserves offhand-only filtering inside the shared weapon dataset', async () => {
    const mainhand: FF14Item = {
      id: 1,
      name: 'Needle Blade',
      nameEn: 'Needle Blade',
      nameJa: 'Needle Blade',
      source: 'item',
      equipSlot: 'mainhand',
      searchKeys: ['needleblade'],
    };
    const offhand: FF14Item = {
      id: 2,
      name: 'Needle Shield',
      nameEn: 'Needle Shield',
      nameJa: 'Needle Shield',
      source: 'item',
      equipSlot: 'offhand',
      searchKeys: ['needleshield'],
    };
    mocks.loadSearchItems.mockResolvedValue([mainhand, offhand]);

    await act(async () => {
      await current.searchItems('needle', 'offhand');
    });

    expect(current.results).toEqual([offhand]);
  });
});
