import weaponUrl from '../../data/search/weapon.json?url';
import headUrl from '../../data/search/head.json?url';
import bodyUrl from '../../data/search/body.json?url';
import handsUrl from '../../data/search/hands.json?url';
import legsUrl from '../../data/search/legs.json?url';
import feetUrl from '../../data/search/feet.json?url';
import earsUrl from '../../data/search/ears.json?url';
import neckUrl from '../../data/search/neck.json?url';
import wristsUrl from '../../data/search/wrists.json?url';
import ringsUrl from '../../data/search/rings.json?url';
import faceUrl from '../../data/search/face.json?url';
import type { EquipmentPart } from '../../types';
import type { FF14Item } from './types';

type SearchDataset =
  | 'weapon'
  | 'head'
  | 'body'
  | 'hands'
  | 'legs'
  | 'feet'
  | 'ears'
  | 'neck'
  | 'wrists'
  | 'rings'
  | 'face';

const DATASET_URLS: Record<SearchDataset, string> = {
  weapon: weaponUrl,
  head: headUrl,
  body: bodyUrl,
  hands: handsUrl,
  legs: legsUrl,
  feet: feetUrl,
  ears: earsUrl,
  neck: neckUrl,
  wrists: wristsUrl,
  rings: ringsUrl,
  face: faceUrl,
};

const SLOT_DATASETS: Record<EquipmentPart, SearchDataset> = {
  mainhand: 'weapon',
  offhand: 'weapon',
  head: 'head',
  body: 'body',
  hands: 'hands',
  legs: 'legs',
  feet: 'feet',
  ears: 'ears',
  neck: 'neck',
  wrists: 'wrists',
  rings: 'rings',
  rings2: 'rings',
  face: 'face',
};

const datasetPromises = new Map<SearchDataset, Promise<FF14Item[]>>();

async function fetchDataset(dataset: SearchDataset): Promise<FF14Item[]> {
  const response = await fetch(DATASET_URLS[dataset]);
  if (!response.ok) {
    throw new Error(`Could not load ${dataset} search data (${response.status}).`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error(`Invalid ${dataset} search data.`);
  }

  return data as FF14Item[];
}

function loadDataset(dataset: SearchDataset): Promise<FF14Item[]> {
  const cached = datasetPromises.get(dataset);
  if (cached) return cached;

  const request = fetchDataset(dataset).catch(error => {
    datasetPromises.delete(dataset);
    throw error;
  });
  datasetPromises.set(dataset, request);
  return request;
}

export async function loadSearchItems(slot?: EquipmentPart): Promise<readonly FF14Item[]> {
  if (slot) return loadDataset(SLOT_DATASETS[slot]);

  const datasets = await Promise.all(
    (Object.keys(DATASET_URLS) as SearchDataset[]).map(loadDataset),
  );
  const uniqueItems = new Map<string, FF14Item>();

  for (const items of datasets) {
    for (const item of items) {
      uniqueItems.set(`${item.source ?? 'item'}:${item.id}`, item);
    }
  }

  return [...uniqueItems.values()];
}

export async function preloadSearchItems(slot?: EquipmentPart): Promise<void> {
  try {
    await loadSearchItems(slot);
  } catch {
    // Failed cache entries are removed by loadDataset so an actual search can retry.
  }
}
