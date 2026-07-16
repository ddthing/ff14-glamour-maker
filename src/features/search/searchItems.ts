import type { EquipmentPart } from '../../types';
import type { FF14Item } from './types';

export const SLOT_CATEGORY_MAP: Readonly<Partial<Record<EquipmentPart, number>>> = {
  head: 34,
  body: 35,
  legs: 36,
  hands: 37,
  feet: 38,
  neck: 40,
  ears: 41,
  wrists: 42,
  rings: 43,
  rings2: 43,
};

export const WEAPON_UI_CATEGORIES: ReadonlySet<number> = new Set([
  ...Array.from({ length: 33 }, (_, index) => index + 1),
  84, 87, 88, 89, 96, 97, 98,
  105, 106, 107, 108, 109, 110, 111,
]);

export function isMatchingSlot(item: FF14Item, slot: EquipmentPart): boolean {
  if (slot === 'face') return item.source === 'facewear';
  if (item.source === 'facewear') return false;
  if (item.equipSlots && item.equipSlots.length > 0) {
    if (slot === 'mainhand') {
      return item.equipSlots.includes('mainhand') || item.equipSlots.includes('offhand');
    }
    return item.equipSlots.includes(slot);
  }
  if (slot === 'offhand') return item.equipSlot === 'offhand';
  if (slot === 'mainhand') {
    return item.uiCategory !== undefined && WEAPON_UI_CATEGORIES.has(item.uiCategory);
  }

  const expectedCategory = SLOT_CATEGORY_MAP[slot];
  return item.uiCategory !== undefined && item.uiCategory === expectedCategory;
}

function normalizeSearchText(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, '');
}

function matchScore(item: FF14Item, query: string): number | null {
  let bestScore: number | null = null;

  for (const name of [item.name, item.nameEn, item.nameJa]) {
    const normalizedName = normalizeSearchText(name);
    if (!normalizedName) continue;

    let score: number | null = null;
    if (normalizedName === query) score = 0;
    else if (normalizedName.startsWith(query)) score = 1;
    else if (normalizedName.includes(query)) score = 2;

    if (score !== null && (bestScore === null || score < bestScore)) {
      bestScore = score;
    }
  }

  return bestScore;
}

export interface SearchItemsOptions {
  slot?: EquipmentPart;
  limit?: number;
}

export function searchItems(
  items: readonly FF14Item[],
  query: string,
  options: SearchItemsOptions = {},
): FF14Item[] {
  const normalizedQuery = normalizeSearchText(query.trim());
  if (!normalizedQuery) return [];

  const limit = Math.max(0, options.limit ?? 200);
  const ranked: Array<{ item: FF14Item; score: number; index: number }> = [];

  items.forEach((item, index) => {
    if (options.slot && !isMatchingSlot(item, options.slot)) return;
    const score = matchScore(item, normalizedQuery);
    if (score === null) return;
    ranked.push({ item, score, index });
  });

  ranked.sort((left, right) => left.score - right.score || left.index - right.index);
  return ranked.slice(0, limit).map(result => result.item);
}
