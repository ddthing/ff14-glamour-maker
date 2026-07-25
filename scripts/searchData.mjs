import fs from 'node:fs/promises';
import path from 'node:path';

export const SEARCH_DATASET_SLOTS = Object.freeze({
  weapon: Object.freeze(['mainhand', 'offhand']),
  head: Object.freeze(['head']),
  body: Object.freeze(['body']),
  hands: Object.freeze(['hands']),
  legs: Object.freeze(['legs']),
  feet: Object.freeze(['feet']),
  ears: Object.freeze(['ears']),
  neck: Object.freeze(['neck']),
  wrists: Object.freeze(['wrists']),
  rings: Object.freeze(['rings', 'rings2']),
});

export const SEARCH_DATASET_KEYS = Object.freeze([
  ...Object.keys(SEARCH_DATASET_SLOTS),
  'face',
]);

export function normalizeSearchText(value) {
  return value.normalize('NFKC').toLowerCase().replace(/\s+/gu, '');
}

function localizedNames(item) {
  return [item.ko, item.en, item.ja]
    .filter(name => typeof name === 'string' && name.trim())
    .map(name => name.trim());
}

function searchKeys(item) {
  return [...new Set(localizedNames(item).map(normalizeSearchText).filter(Boolean))];
}

function mapSearchRecord(id, item, source) {
  const names = localizedNames(item);
  if (names.length === 0) return null;

  return {
    id: Number(id),
    name: item.ko?.trim() || item.en?.trim() || item.ja?.trim(),
    nameEn: item.en?.trim() || '',
    nameJa: item.ja?.trim() || '',
    ...(item.iconPath ? { iconPath: item.iconPath } : {}),
    source,
    searchKeys: searchKeys(item),
  };
}

function orderedEntries(data) {
  return Object.entries(data).sort(([left], [right]) => Number(left) - Number(right));
}

export function buildSearchDatasets(items, facewear) {
  const datasets = Object.fromEntries(
    SEARCH_DATASET_KEYS.map(key => [key, []]),
  );

  for (const [id, item] of orderedEntries(items)) {
    const record = mapSearchRecord(id, item, 'item');
    if (!record) continue;

    const itemSlots = Array.isArray(item.equipSlots) ? item.equipSlots : [];
    for (const [dataset, supportedSlots] of Object.entries(SEARCH_DATASET_SLOTS)) {
      if (supportedSlots.some(slot => itemSlots.includes(slot))) {
        datasets[dataset].push(dataset === 'weapon'
          ? {
              ...record,
              equipSlot: itemSlots.includes('offhand') ? 'offhand' : 'mainhand',
            }
          : record);
      }
    }
  }

  for (const [id, item] of orderedEntries(facewear)) {
    const record = mapSearchRecord(id, item, 'facewear');
    if (record) datasets.face.push(record);
  }

  validateSearchDatasets(datasets);
  return datasets;
}

export function validateSearchDatasets(datasets) {
  if (!datasets || typeof datasets !== 'object' || Array.isArray(datasets)) {
    throw new Error('Search datasets must be an object.');
  }

  for (const key of SEARCH_DATASET_KEYS) {
    const records = datasets[key];
    if (!Array.isArray(records)) {
      throw new Error(`Search dataset "${key}" must be an array.`);
    }

    let previousId = -1;
    for (const record of records) {
      if (!Number.isInteger(record.id) || record.id <= previousId) {
        throw new Error(`Search dataset "${key}" must have ascending integer IDs.`);
      }
      if (typeof record.name !== 'string' || !record.name) {
        throw new Error(`Search dataset "${key}" contains an invalid display name.`);
      }
      if (record.source !== 'item' && record.source !== 'facewear') {
        throw new Error(`Search dataset "${key}" contains an invalid source.`);
      }
      if (!Array.isArray(record.searchKeys) || record.searchKeys.length === 0) {
        throw new Error(`Search dataset "${key}" contains no search keys.`);
      }
      if (record.searchKeys.some(keyValue =>
        typeof keyValue !== 'string' || !keyValue || keyValue !== normalizeSearchText(keyValue)
      )) {
        throw new Error(`Search dataset "${key}" contains an invalid search key.`);
      }
      previousId = record.id;
    }
  }
}

export async function writeSearchDatasets(datasets, outputDirectory) {
  validateSearchDatasets(datasets);
  await fs.mkdir(outputDirectory, { recursive: true });

  const pendingFiles = SEARCH_DATASET_KEYS.map(key => {
    const destination = path.join(outputDirectory, `${key}.json`);
    return {
      destination,
      temporary: `${destination}.tmp`,
      contents: `${JSON.stringify(datasets[key])}\n`,
    };
  });

  try {
    await Promise.all(pendingFiles.map(file =>
      fs.writeFile(file.temporary, file.contents, 'utf8')
    ));
    for (const file of pendingFiles) {
      await fs.rename(file.temporary, file.destination);
    }
  } catch (error) {
    await Promise.allSettled(pendingFiles.map(file => fs.unlink(file.temporary)));
    throw error;
  }
}

export async function generateSearchData({
  itemsPath = 'src/data/items.json',
  facewearPath = 'src/data/facewear.json',
  outputDirectory = 'src/data/search',
} = {}) {
  const [items, facewear] = await Promise.all([
    fs.readFile(itemsPath, 'utf8').then(JSON.parse),
    fs.readFile(facewearPath, 'utf8').then(JSON.parse),
  ]);
  const datasets = buildSearchDatasets(items, facewear);
  await writeSearchDatasets(datasets, outputDirectory);
  return datasets;
}
