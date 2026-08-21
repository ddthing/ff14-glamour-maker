import { describe, expect, it } from 'vitest';
import itemsData from '../../data/items.json';
import facewearData from '../../data/facewear.json';
import type { EquipmentPart } from '../../types';
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
