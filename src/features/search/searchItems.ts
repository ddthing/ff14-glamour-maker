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
  return value.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
}

const normalizedNameCache = new WeakMap<FF14Item, readonly string[]>();

function getSearchKeys(item: FF14Item): readonly string[] {
  if (item.searchKeys) return item.searchKeys;

  const cached = normalizedNameCache.get(item);
  if (cached) return cached;

  const keys = [item.name, item.nameEn, item.nameJa].map(normalizeSearchText);
  normalizedNameCache.set(item, keys);
  return keys;
}

function matchScore(item: FF14Item, query: string): 0 | 1 | 2 | null {
  let bestScore: 1 | 2 | null = null;

  for (const normalizedName of getSearchKeys(item)) {
    if (!normalizedName) continue;
    if (normalizedName === query) return 0;
    if (normalizedName.startsWith(query)) bestScore = 1;
    else if (normalizedName.includes(query) && bestScore === null) bestScore = 2;
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
  if (limit === 0) return [];

  const ranked: [FF14Item[], FF14Item[], FF14Item[]] = [[], [], []];

  items.forEach(item => {
    if (options.slot && !isMatchingSlot(item, options.slot)) return;
    const score = matchScore(item, normalizedQuery);
    if (score === null) return;
    ranked[score].push(item);
  });

  const results: FF14Item[] = [];
  for (const bucket of ranked) {
    const remaining = limit - results.length;
    results.push(...bucket.slice(0, remaining));
    if (results.length >= limit) break;
  }
  return results;
}
