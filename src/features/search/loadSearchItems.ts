import itemsUrl from '../../data/items.json?url';
import facewearUrl from '../../data/facewear.json?url';
import type { EquipmentPart } from '../../types';
import type { FF14Item, ItemSource } from './types';

interface LocalItemData {
  en?: string;
  ja?: string;
  ko?: string;
  uiCategory?: number | null;
  iconPath?: string;
  equipSlots?: EquipmentPart[];
}

type ItemDataMap = Record<string, LocalItemData>;

let equipmentPromise: Promise<FF14Item[]> | null = null;
let facewearPromise: Promise<FF14Item[]> | null = null;

function mapItems(data: ItemDataMap, source: ItemSource): FF14Item[] {
  return Object.entries(data).map(([id, item]) => ({
    id: Number(id),
    name: item.ko || item.en || item.ja || (source === 'facewear' ? 'Unknown Facewear' : 'Unknown Item'),
    nameEn: item.en || '',
    nameJa: item.ja || '',
    uiCategory: item.uiCategory ?? undefined,
    iconPath: item.iconPath || undefined,
    equipSlots: item.equipSlots,
    source,
  }));
}

async function fetchItems(url: string, source: ItemSource): Promise<FF14Item[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load ${source} data (${response.status}).`);
  }
  return mapItems(await response.json() as ItemDataMap, source);
}

function loadEquipment(): Promise<FF14Item[]> {
  equipmentPromise ??= fetchItems(itemsUrl, 'item').catch(error => {
    equipmentPromise = null;
    throw error;
  });
  return equipmentPromise;
}

function loadFacewear(): Promise<FF14Item[]> {
  facewearPromise ??= fetchItems(facewearUrl, 'facewear').catch(error => {
    facewearPromise = null;
    throw error;
  });
  return facewearPromise;
}

export async function loadSearchItems(slot?: EquipmentPart): Promise<readonly FF14Item[]> {
  if (slot === 'face') return loadFacewear();
  if (slot) return loadEquipment();

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

export async function loadFashionAccessories(): Promise<readonly FF14Item[]> {
  const items = await loadEquipment();
  return items.filter(isFashionAccessoryItem);
}
