import itemsUrl from '../../data/items.json?url';
import facewearUrl from '../../data/facewear.json?url';
import mainhandUrl from '../../data/search/mainhand.json?url';
import offhandUrl from '../../data/search/offhand.json?url';
import headUrl from '../../data/search/head.json?url';
import bodyUrl from '../../data/search/body.json?url';
import handsUrl from '../../data/search/hands.json?url';
import legsUrl from '../../data/search/legs.json?url';
import feetUrl from '../../data/search/feet.json?url';
import neckUrl from '../../data/search/neck.json?url';
import earsUrl from '../../data/search/ears.json?url';
import wristsUrl from '../../data/search/wrists.json?url';
import ringsUrl from '../../data/search/rings.json?url';
import fashionAccessoriesUrl from '../../data/search/fashion-accessories.json?url';
import type { EquipmentPart } from '../../types';
import type { FF14Item, ItemSource } from './types';

interface LocalItemData {
  en?: string;
  ja?: string;
  ko?: string;
  uiCategory?: number | null;
  iconPath?: string;
  iconAssetKey?: string;
  translationStatus?: FF14Item['translationStatus'];
  equipSlots?: EquipmentPart[];
}

type ItemDataMap = Record<string, LocalItemData>;
type SearchShardSlot = Exclude<EquipmentPart, 'face'>;

const slotUrls: Readonly<Record<SearchShardSlot, string>> = {
  mainhand: mainhandUrl,
  offhand: offhandUrl,
  head: headUrl,
  body: bodyUrl,
  hands: handsUrl,
  legs: legsUrl,
  feet: feetUrl,
  neck: neckUrl,
  ears: earsUrl,
  wrists: wristsUrl,
  rings: ringsUrl,
  rings2: ringsUrl,
};

const itemPromiseCache = new Map<string, Promise<readonly FF14Item[]>>();

function normalizeSearchText(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
}

function inferTranslationStatus(item: LocalItemData): NonNullable<FF14Item['translationStatus']> {
  if (item.translationStatus) return item.translationStatus;
  if (item.en && item.ja) return 'complete';
  if (item.en || item.ja) return 'partial';
  if (item.ko) return 'kr-only';
  return 'review';
}

function mapItems(data: ItemDataMap, source: ItemSource): FF14Item[] {
  return Object.entries(data).map(([id, item]) => {
    const name = item.ko || item.en || item.ja || (source === 'facewear' ? 'Unknown Facewear' : 'Unknown Item');
    const nameEn = item.en || '';
    const nameJa = item.ja || '';

    return {
      id: Number(id),
      name,
      nameEn,
      nameJa,
      uiCategory: item.uiCategory ?? undefined,
      iconPath: item.iconPath || undefined,
      iconAssetKey: item.iconAssetKey || undefined,
      translationStatus: inferTranslationStatus(item),
      equipSlots: item.equipSlots,
      source,
      searchKeys: [name, nameEn, nameJa].map(normalizeSearchText),
    };
  });
}

async function readJson(url: string, source: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load ${source} data (${response.status}).`);
  }
  return response.json() as Promise<unknown>;
}

async function fetchItemMap(url: string, source: ItemSource): Promise<FF14Item[]> {
  return mapItems(await readJson(url, source) as ItemDataMap, source);
}

async function fetchSearchShard(url: string, source: string): Promise<FF14Item[]> {
  const payload = await readJson(url, source);
  if (!Array.isArray(payload)) {
    throw new Error(`Could not load ${source} data (invalid response).`);
  }

  return payload.map((value: unknown) => {
    const item = value as FF14Item;
    if (Array.isArray(item.searchKeys)) return item;
    return {
      ...item,
      searchKeys: [item.name, item.nameEn, item.nameJa].map(normalizeSearchText),
    };
  });
}

function loadCachedItems(
  key: string,
  load: () => Promise<FF14Item[]>,
): Promise<readonly FF14Item[]> {
  const cached = itemPromiseCache.get(key);
  if (cached) return cached;

  const pending = load();
  itemPromiseCache.set(key, pending);
  void pending.catch(() => {
    if (itemPromiseCache.get(key) === pending) itemPromiseCache.delete(key);
  });
  return pending;
}

function loadEquipment(): Promise<readonly FF14Item[]> {
  return loadCachedItems('equipment:all', () => fetchItemMap(itemsUrl, 'item'));
}

function loadFacewear(): Promise<readonly FF14Item[]> {
  return loadCachedItems('facewear', () => fetchItemMap(facewearUrl, 'facewear'));
}

function loadSlot(slot: SearchShardSlot): Promise<readonly FF14Item[]> {
  const url = slotUrls[slot];
  return loadCachedItems(
    `slot:${url}`,
    () => fetchSearchShard(url, `${slot} item`),
  );
}

export async function loadSearchItems(slot?: EquipmentPart): Promise<readonly FF14Item[]> {
  if (slot === 'face') return loadFacewear();
  if (slot) return loadSlot(slot);

  const [equipment, facewear] = await Promise.all([loadEquipment(), loadFacewear()]);
  return [...equipment, ...facewear];
}

export async function preloadSearchItems(slot?: EquipmentPart): Promise<void> {
  try {
    await loadSearchItems(slot);
  } catch {
    // The failed cache entry is cleared by the loader so an actual search can retry.
  }
}

const LEGACY_FACEWEAR_PATTERN = /spectacles|glasses|monocle|eyepatch|안경|眼鏡|メガネ/i;

export function isFashionAccessoryItem(item: FF14Item): boolean {
  return item.source === 'item'
    && item.uiCategory === 61
    && /^\/i\/058000\/058\d{3}\.png$/i.test(item.iconPath ?? '')
    && !LEGACY_FACEWEAR_PATTERN.test(`${item.name} ${item.nameEn} ${item.nameJa}`);
}

export function loadFashionAccessories(): Promise<readonly FF14Item[]> {
  return loadCachedItems(
    'fashion-accessories',
    () => fetchSearchShard(fashionAccessoriesUrl, 'fashion accessory'),
  );
}
