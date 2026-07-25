import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

function searchRecord(
  id: number,
  source: 'item' | 'facewear' = 'item',
): Record<string, unknown> {
  return {
    id,
    name: source === 'facewear' ? '안경' : '장비',
    nameEn: source === 'facewear' ? 'Glasses' : 'Equipment',
    nameJa: source === 'facewear' ? '眼鏡' : '装備',
    source,
    searchKeys: source === 'facewear'
      ? ['안경', 'glasses', '眼鏡']
      : ['장비', 'equipment', '装備'],
  };
}

describe('loadSearchItems', () => {
  it('loads only the requested slot asset and reuses it', async () => {
    const fetchItems = vi.fn(async (input: string | URL | Request) => {
      const isFacewear = String(input).includes('face');
      return new Response(JSON.stringify([
        searchRecord(isFacewear ? 2 : 1, isFacewear ? 'facewear' : 'item'),
      ]), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchItems);

    const { loadSearchItems } = await import('./loadSearchItems');
    const firstHead = await loadSearchItems('head');
    const secondHead = await loadSearchItems('head');

    expect(fetchItems).toHaveBeenCalledTimes(1);
    expect(firstHead).toBe(secondHead);
    expect(String(fetchItems.mock.calls[0]?.[0])).toContain('head');

    const facewear = await loadSearchItems('face');
    expect(fetchItems).toHaveBeenCalledTimes(2);
    expect(facewear[0]).toMatchObject({ id: 2, source: 'facewear' });
  });

  it('clears only a failed asset cache entry so the next search can retry', async () => {
    const fetchItems = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([
        searchRecord(1),
      ]), { status: 200 }));
    vi.stubGlobal('fetch', fetchItems);

    const { loadSearchItems } = await import('./loadSearchItems');
    await expect(loadSearchItems('body')).rejects.toThrow('Could not load body search data');
    await expect(loadSearchItems('body')).resolves.toHaveLength(1);
    expect(fetchItems).toHaveBeenCalledTimes(2);
  });

  it('shares a pending request between equivalent slots and preload', async () => {
    let resolveFetch: ((response: Response) => void) | undefined;
    const fetchItems = vi.fn((input: string | URL | Request) => {
      void input;
      return new Promise<Response>(resolve => {
        resolveFetch = resolve;
      });
    });
    vi.stubGlobal('fetch', fetchItems);

    const { loadSearchItems, preloadSearchItems } = await import('./loadSearchItems');
    const preload = preloadSearchItems('rings');
    const load = loadSearchItems('rings2');

    expect(fetchItems).toHaveBeenCalledTimes(1);
    expect(String(fetchItems.mock.calls[0]?.[0])).toContain('rings');
    resolveFetch?.(new Response(JSON.stringify([searchRecord(3)]), { status: 200 }));

    await expect(preload).resolves.toBeUndefined();
    await expect(load).resolves.toHaveLength(1);
  });

  it('loads all unique assets in parallel and de-duplicates by source and ID', async () => {
    const fetchItems = vi.fn(async (input: string | URL | Request) => {
      const isFacewear = String(input).includes('face');
      return new Response(JSON.stringify([
        searchRecord(isFacewear ? 1 : 1, isFacewear ? 'facewear' : 'item'),
      ]), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchItems);

    const { loadSearchItems } = await import('./loadSearchItems');
    const allItems = await loadSearchItems();

    expect(fetchItems).toHaveBeenCalledTimes(11);
    expect(allItems).toHaveLength(2);
    expect(allItems.map(item => item.source)).toEqual(['item', 'facewear']);
  });
});
