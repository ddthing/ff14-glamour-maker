import { describe, expect, it } from 'vitest';
import itemsData from '../../data/items.json';
import facewearData from '../../data/facewear.json';
import mainhandData from '../../data/search/mainhand.json';
import offhandData from '../../data/search/offhand.json';
import headData from '../../data/search/head.json';
import bodyData from '../../data/search/body.json';
import handsData from '../../data/search/hands.json';
import legsData from '../../data/search/legs.json';
import feetData from '../../data/search/feet.json';
import neckData from '../../data/search/neck.json';
import earsData from '../../data/search/ears.json';
import wristsData from '../../data/search/wrists.json';
import ringsData from '../../data/search/rings.json';
import rings2Data from '../../data/search/rings.json';
import fashionAccessoriesData from '../../data/search/fashion-accessories.json';
import type { EquipmentPart } from '../../types';
import { isFashionAccessoryItem } from './loadSearchItems';
import { isMatchingSlot, searchItems, WEAPON_UI_CATEGORIES } from './searchItems';
import type { FF14Item } from './types';

interface LocalItemData {
  ko?: string;
  en?: string;
  ja?: string;
  uiCategory?: number | null;
  iconPath?: string;
  iconAssetKey?: string;
  translationStatus?: FF14Item['translationStatus'];
  equipSlots?: EquipmentPart[];
}

const records: FF14Item[] = Object.entries(itemsData as Record<string, LocalItemData>).map(
  ([id, item]) => ({
    id: Number(id),
    name: item.ko || item.en || item.ja || '',
    nameEn: item.en || '',
    nameJa: item.ja || '',
    uiCategory: item.uiCategory ?? undefined,
    iconPath: item.iconPath,
    iconAssetKey: item.iconAssetKey,
    translationStatus: item.translationStatus,
    equipSlots: item.equipSlots,
    source: 'item',
  }),
);

const categorySlots = new Map<number, EquipmentPart>([
  [34, 'head'], [35, 'body'], [36, 'legs'], [37, 'hands'], [38, 'feet'],
  [40, 'neck'], [41, 'ears'], [42, 'wrists'], [43, 'rings'],
]);

const facewearRecords: FF14Item[] = Object.entries(
  facewearData as Record<string, LocalItemData>,
).map(([id, item]) => ({
  id: Number(id),
  name: item.ko || item.en || item.ja || '',
  nameEn: item.en || '',
  nameJa: item.ja || '',
  iconPath: item.iconPath,
  iconAssetKey: item.iconAssetKey,
  translationStatus: item.translationStatus,
  source: 'facewear',
}));

type SearchShardSlot = Exclude<EquipmentPart, 'face'>;
const searchShards: Record<SearchShardSlot, readonly FF14Item[]> = {
  mainhand: mainhandData as unknown as FF14Item[],
  offhand: offhandData as unknown as FF14Item[],
  head: headData as unknown as FF14Item[],
  body: bodyData as unknown as FF14Item[],
  hands: handsData as unknown as FF14Item[],
  legs: legsData as unknown as FF14Item[],
  feet: feetData as unknown as FF14Item[],
  neck: neckData as unknown as FF14Item[],
  ears: earsData as unknown as FF14Item[],
  wrists: wristsData as unknown as FF14Item[],
  rings: ringsData as unknown as FF14Item[],
  rings2: rings2Data as unknown as FF14Item[],
};
const fashionAccessoryShard = fashionAccessoriesData as unknown as FF14Item[];
const recordsById = new Map(records.map(item => [item.id, item]));

function normalizeSearchKey(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
}

describe('generated item data integrity', () => {
  it('contains no replacement characters in localized display names', () => {
    const corrupted = records.filter(item =>
      [item.name, item.nameEn, item.nameJa].some(name => name.includes('\uFFFD')),
    );

    expect(corrupted).toEqual([]);
  });

  it('keeps Korean-only icon exceptions on stable asset keys', () => {
    const regionalIds = [21036, 21037, 21038, 21039, 21040, 21041];
    expect(regionalIds.every(id => {
      const item = records.find(record => record.id === id);
      return item?.translationStatus === 'kr-only' && item.iconAssetKey === `ko/${id}`;
    })).toBe(true);
  });

  it('classifies every generated supported equipment record into its slot', () => {
    const misclassified: Array<{ id: number; category?: number; slot: EquipmentPart }> = [];

    for (const item of records) {
      const slot = item.uiCategory === undefined
        ? undefined
        : categorySlots.get(item.uiCategory);
      if (slot && !isMatchingSlot(item, slot)) {
        misclassified.push({ id: item.id, category: item.uiCategory, slot });
      }
    }

    expect(misclassified).toEqual([]);
  });

  it('keeps every recognized weapon category searchable and excludes category 83', () => {
    const reaperItems = records.filter(item => item.uiCategory === 108);
    const materiaItems = records.filter(item => item.uiCategory === 83);

    expect(reaperItems.length).toBeGreaterThan(0);
    expect(reaperItems.every(item => isMatchingSlot(item, 'mainhand'))).toBe(true);
    expect(materiaItems.length).toBeGreaterThan(0);
    expect(materiaItems.every(item => !isMatchingSlot(item, 'mainhand'))).toBe(true);
    expect(WEAPON_UI_CATEGORIES.has(108)).toBe(true);
    expect(WEAPON_UI_CATEGORIES.has(83)).toBe(false);
  });

  it('can find each supported item by every available localized full name', () => {
    const failures: Array<{ id: number; language: string; name: string }> = [];
    const supported = records.filter(item =>
      item.uiCategory !== undefined &&
      (categorySlots.has(item.uiCategory) || WEAPON_UI_CATEGORIES.has(item.uiCategory)),
    );

    for (const item of supported) {
      const categorySlot = item.uiCategory === undefined
        ? undefined
        : categorySlots.get(item.uiCategory);
      const slot = categorySlot ?? (item.equipSlots?.includes('offhand') ? 'offhand' : 'mainhand');
      for (const [language, name] of [
        ['ko', item.name], ['en', item.nameEn], ['ja', item.nameJa],
      ] as const) {
        if (!name) continue;
        const result = searchItems([item], name, { slot, limit: 1 });
        if (result[0]?.id !== item.id) failures.push({ id: item.id, language, name });
      }
    }

    expect(failures).toEqual([]);
  });

  it('preserves and searches every Facewear record in all three languages', () => {
    expect(facewearRecords).toHaveLength(684);

    const failures = facewearRecords.filter(item => {
      if (!item.name || !item.nameEn || !item.nameJa) return true;
      return [item.name, item.nameEn, item.nameJa].some(name =>
        searchItems([item], name, { slot: 'face', limit: 1 })[0]?.id !== item.id,
      );
    });

    expect(failures).toEqual([]);
  });
});

describe('generated search shard integrity', () => {
  it('includes every canonical item classified into each equipment slot', () => {
    for (const [slot, shard] of Object.entries(searchShards) as Array<[SearchShardSlot, readonly FF14Item[]]>) {
      const expected = slot === 'rings' || slot === 'rings2'
        ? records.filter(item => isMatchingSlot(item, 'rings') || isMatchingSlot(item, 'rings2'))
        : records.filter(item => isMatchingSlot(item, slot));
      expect(shard.map(item => item.id), slot).toEqual(expected.map(item => item.id));
    }
  });

  it('keeps localized names, display metadata, and pre-normalized keys in sync', () => {
    const mismatches: number[] = [];
    for (const shard of [...Object.values(searchShards), fashionAccessoryShard]) {
      for (const item of shard) {
        const canonical = recordsById.get(item.id);
        if (!canonical) {
          mismatches.push(item.id);
          continue;
        }
        const metadataMatches = item.name === canonical.name
          && item.nameEn === canonical.nameEn
          && item.nameJa === canonical.nameJa
          && item.iconPath === canonical.iconPath
          && item.iconAssetKey === canonical.iconAssetKey
          && item.uiCategory === canonical.uiCategory
          && JSON.stringify(item.equipSlots) === JSON.stringify(canonical.equipSlots)
          && item.source === 'item';
        const keysMatch = JSON.stringify(item.searchKeys)
          === JSON.stringify([item.name, item.nameEn, item.nameJa].map(normalizeSearchKey));
        if (!metadataMatches || !keysMatch) mismatches.push(item.id);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('returns the same ranked results from a slot shard as from the full catalog', () => {
    for (const [slot, shard] of Object.entries(searchShards) as Array<[SearchShardSlot, readonly FF14Item[]]>) {
      const sampleName = shard[Math.floor(shard.length / 2)]?.name ?? '';
      const query = sampleName.slice(0, Math.min(2, sampleName.length));
      const fullCatalogResults = searchItems(records, query, { slot, limit: 40 });
      const shardResults = searchItems(shard, query, { slot, limit: 40 });

      expect(shardResults.map(item => item.id), slot)
        .toEqual(fullCatalogResults.map(item => item.id));
    }
  });

  it('keeps the fashion accessory shard equivalent to the canonical filter', () => {
    const expected = records.filter(isFashionAccessoryItem);
    expect(fashionAccessoryShard.map(item => item.id)).toEqual(expected.map(item => item.id));
  });
});
