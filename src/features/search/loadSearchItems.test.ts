import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('loadSearchItems', () => {
  it('loads only the requested dataset and reuses it for later searches', async () => {
    const fetchItems = vi.fn(async (input: string | URL | Request) => {
      const isFacewear = String(input).includes('facewear');
      const record = isFacewear
        ? { 2: { ko: '얼굴 소품', en: 'Facewear', ja: 'フェイスアクセサリー' } }
        : { 1: { ko: '머리 장비', en: 'Head Gear', ja: '頭装備', uiCategory: 34 } };
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
    expect(firstFacewear[0]).toMatchObject({ id: 2, source: 'facewear' });

    const equipment = await loadSearchItems('head');
    expect(fetchItems).toHaveBeenCalledTimes(2);
    expect(equipment[0]).toMatchObject({ id: 1, source: 'item', uiCategory: 34 });
  });

  it('clears a failed cache entry so the next search can retry', async () => {
    const fetchItems = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        1: { ko: '상의', en: 'Body', ja: '胴防具', uiCategory: 35 },
      }), { status: 200 }));
    vi.stubGlobal('fetch', fetchItems);

    const { loadSearchItems } = await import('./loadSearchItems');
    await expect(loadSearchItems('body')).rejects.toThrow('Could not load item data');
    await expect(loadSearchItems('body')).resolves.toHaveLength(1);
    expect(fetchItems).toHaveBeenCalledTimes(2);
  });
});
