import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

const shardRecord = {
  id: 1,
  name: '머리 장비',
  nameEn: 'Head Gear',
  nameJa: '頭装備',
  uiCategory: 34,
  equipSlots: ['head'],
  source: 'item',
  searchKeys: ['머리장비', 'headgear', '頭装備'],
};

describe('loadSearchItems', () => {
  it('loads the requested slot shard and reuses it for later searches', async () => {
    const fetchItems = vi.fn(async (input: string | URL | Request) => {
      const isFacewear = String(input).includes('facewear');
      const record = isFacewear
        ? { 2: { ko: '얼굴 소품', en: 'Facewear', ja: 'フェイスアクセサリー', iconAssetKey: 'ko/2' } }
        : [shardRecord];
      return new Response(JSON.stringify(record), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchItems);

    const { loadSearchItems } = await import('./loadSearchItems');
    const firstFacewear = await loadSearchItems('face');
    const secondFacewear = await loadSearchItems('face');

    expect(fetchItems).toHaveBeenCalledTimes(1);
    expect(firstFacewear).toBe(secondFacewear);
    expect(firstFacewear[0]).toMatchObject({
      id: 2,
      source: 'facewear',
      iconAssetKey: 'ko/2',
      translationStatus: 'complete',
      searchKeys: ['얼굴소품', 'facewear', 'フェイスアクセサリー'],
    });

    const equipment = await loadSearchItems('head');
    expect(fetchItems).toHaveBeenCalledTimes(2);
    expect(equipment[0]).toMatchObject({ id: 1, source: 'item', uiCategory: 34 });
    expect(String(fetchItems.mock.calls[1]?.[0])).toContain('head.json');
  });

  it('clears a failed slot cache entry so the next search can retry', async () => {
    const fetchItems = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([shardRecord]), { status: 200 }));
    vi.stubGlobal('fetch', fetchItems);

    const { loadSearchItems } = await import('./loadSearchItems');
    await expect(loadSearchItems('body')).rejects.toThrow('Could not load body item data');
    await expect(loadSearchItems('body')).resolves.toHaveLength(1);
    expect(fetchItems).toHaveBeenCalledTimes(2);
  });

  it('preloads only the requested shard and shares its pending request', async () => {
    let resolveFetch: ((response: Response) => void) | undefined;
    const fetchItems = vi.fn((input: string | URL | Request) => {
      void input;
      return new Promise<Response>(resolve => {
        resolveFetch = resolve;
      });
    });
    vi.stubGlobal('fetch', fetchItems);

    const { loadSearchItems, preloadSearchItems } = await import('./loadSearchItems');
    const preload = preloadSearchItems('head');
    const load = loadSearchItems('head');

    expect(fetchItems).toHaveBeenCalledTimes(1);
    resolveFetch?.(new Response(JSON.stringify([shardRecord]), { status: 200 }));

    await expect(preload).resolves.toBeUndefined();
    await expect(load).resolves.toHaveLength(1);
    expect(String(fetchItems.mock.calls[0]?.[0])).toContain('head.json');
  });

  it('loads and caches a jewelry-specific shard', async () => {
    const fetchItems = vi.fn(async (input: string | URL | Request) => {
      void input;
      return new Response(JSON.stringify([{
        ...shardRecord,
        uiCategory: 43,
        equipSlots: ['rings'],
      }]), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchItems);

    const { loadSearchItems } = await import('./loadSearchItems');
    const first = await loadSearchItems('rings');
    const second = await loadSearchItems('rings');
    const secondRingSlot = await loadSearchItems('rings2');

    expect(first).toBe(second);
    expect(secondRingSlot).toBe(first);
    expect(fetchItems).toHaveBeenCalledTimes(1);
    expect(String(fetchItems.mock.calls[0]?.[0])).toContain('rings.json');
  });

  it('loads only the fashion accessory shard', async () => {
    const fetchItems = vi.fn(async (input: string | URL | Request) => {
      void input;
      return new Response(JSON.stringify([{
        id: 30269,
        name: '파라솔',
        nameEn: 'Parasol',
        nameJa: 'パラソル',
        iconPath: '/i/058000/058001.png',
        uiCategory: 61,
        source: 'item',
        searchKeys: ['파라솔', 'parasol', 'パラソル'],
      }]), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchItems);

    const { loadFashionAccessories } = await import('./loadSearchItems');
    const first = await loadFashionAccessories();
    const second = await loadFashionAccessories();

    expect(first).toBe(second);
    expect(first).toHaveLength(1);
    expect(fetchItems).toHaveBeenCalledTimes(1);
    expect(String(fetchItems.mock.calls[0]?.[0])).toContain('fashion-accessories.json');
  });

  it('keeps the unscoped search path available through the canonical full dataset', async () => {
    const fetchItems = vi.fn(async (input: string | URL | Request) => {
      const isFacewear = String(input).includes('facewear');
      const record = isFacewear
        ? { 2: { ko: '얼굴 소품', en: 'Facewear', ja: 'フェイスアクセサリー' } }
        : { 1: { ko: '길', en: 'Gil', ja: 'ギル' } };
      return new Response(JSON.stringify(record), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchItems);

    const { loadSearchItems } = await import('./loadSearchItems');
    const items = await loadSearchItems();

    expect(fetchItems).toHaveBeenCalledTimes(2);
    expect(items.map(item => item.id)).toEqual([1, 2]);
    expect(String(fetchItems.mock.calls[0]?.[0])).toContain('items.json');
  });
});

describe('isFashionAccessoryItem', () => {
  it('accepts fashion unlock icons and excludes migrated facewear', async () => {
    const { isFashionAccessoryItem } = await import('./loadSearchItems');
    expect(isFashionAccessoryItem({
      id: 30269,
      name: '파라솔',
      nameEn: 'Parasol',
      nameJa: 'パラソル',
      iconPath: '/i/058000/058001.png',
      uiCategory: 61,
      source: 'item',
    })).toBe(true);
    expect(isFashionAccessoryItem({
      id: 36345,
      name: '타원형 안경 환영',
      nameEn: 'False Oval Spectacles',
      nameJa: 'オーバルグラス',
      iconPath: '/i/058000/058022.png',
      uiCategory: 61,
      source: 'item',
    })).toBe(false);
  });

  it('rejects similarly named housing items', async () => {
    const { isFashionAccessoryItem } = await import('./loadSearchItems');
    expect(isFashionAccessoryItem({
      id: 6482,
      name: '정원용 파라솔',
      nameEn: 'Linen Parasol',
      nameJa: 'ガーデンパラソル',
      iconPath: '/i/052000/052125.png',
      uiCategory: 57,
      source: 'item',
    })).toBe(false);
  });
});
