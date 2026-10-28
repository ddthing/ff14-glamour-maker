import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, '..');
const ITEMS_FILE = path.join(REPOSITORY_ROOT, 'src/data/items.json');
const SEARCH_DIRECTORY = path.join(REPOSITORY_ROOT, 'src/data/search');

const SLOT_CATEGORY_MAP = {
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

const WEAPON_UI_CATEGORIES = new Set([
  ...Array.from({ length: 33 }, (_, index) => index + 1),
  84, 87, 88, 89, 96, 97, 98,
  105, 106, 107, 108, 109, 110, 111,
]);

const EQUIPMENT_SLOTS = [
  'mainhand', 'offhand', 'head', 'body', 'hands', 'legs', 'feet',
  'neck', 'ears', 'wrists', 'rings',
];

const LEGACY_FACEWEAR_PATTERN = /spectacles|glasses|monocle|eyepatch|안경|眼鏡|メガネ/i;

function normalizeSearchText(value) {
  return value.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
}

function isMatchingSlot(item, slot) {
  if (item.equipSlots?.length) return item.equipSlots.includes(slot);
  if (slot === 'offhand') return item.equipSlot === 'offhand';
  if (slot === 'mainhand') {
    return item.uiCategory !== undefined && WEAPON_UI_CATEGORIES.has(item.uiCategory);
  }
  return item.uiCategory !== undefined && item.uiCategory === SLOT_CATEGORY_MAP[slot];
}

function inferTranslationStatus(item) {
  if (item.translationStatus) return item.translationStatus;
  if (item.en && item.ja) return 'complete';
  if (item.en || item.ja) return 'partial';
  if (item.ko) return 'kr-only';
  return 'review';
}

function toSearchRecord(id, item) {
  const name = item.ko || item.en || item.ja || 'Unknown Item';
  const nameEn = item.en || '';
  const nameJa = item.ja || '';

  return {
    id: Number(id),
    name,
    nameEn,
    nameJa,
    ...(item.iconPath ? { iconPath: item.iconPath } : {}),
    ...(item.iconAssetKey ? { iconAssetKey: item.iconAssetKey } : {}),
    translationStatus: inferTranslationStatus(item),
    ...(item.uiCategory !== undefined && item.uiCategory !== null
      ? { uiCategory: item.uiCategory }
      : {}),
    source: 'item',
    ...(item.equipSlot ? { equipSlot: item.equipSlot } : {}),
    ...(item.equipSlots ? { equipSlots: item.equipSlots } : {}),
    searchKeys: [name, nameEn, nameJa].map(normalizeSearchText),
  };
}

function hasFashionAccessoryIcon(item) {
  return /^\/i\/058000\/058\d{3}\.png$/i.test(item.iconPath ?? '');
}

function isFashionAccessory(item) {
  return item.uiCategory === 61
    && hasFashionAccessoryIcon(item)
    && !LEGACY_FACEWEAR_PATTERN.test(`${item.ko || ''} ${item.en || ''} ${item.ja || ''}`);
}

export function buildSearchData(items) {
  const entries = Object.entries(items)
    .sort(([left], [right]) => Number(left) - Number(right));
  const records = entries.map(([id, item]) => toSearchRecord(id, item));
  const searchData = Object.fromEntries(EQUIPMENT_SLOTS.map(slot => [
    `${slot}.json`, records.filter(record => isMatchingSlot(record, slot)),
  ]));
  // Both ring slots share one payload; runtime filtering still applies the exact selected slot.
  searchData['rings.json'] = records.filter(record =>
    isMatchingSlot(record, 'rings') || isMatchingSlot(record, 'rings2'),
  );
  searchData['fashion-accessories.json'] = entries
    .filter(([, item]) => isFashionAccessory(item))
    .map(([id, item]) => toSearchRecord(id, item));

  return searchData;
}

export async function writeSearchData(items, directory = SEARCH_DIRECTORY) {
  await fs.mkdir(directory, { recursive: true });
  const searchData = buildSearchData(items);

  for (const [filename, records] of Object.entries(searchData)) {
    await fs.writeFile(
      path.join(directory, filename),
      `${JSON.stringify(records)}\n`,
      'utf8',
    );
  }

  // Replace legacy combined and duplicate slot shards with the current data layout.
  await fs.rm(path.join(directory, 'weapon.json'), { force: true });
  await fs.rm(path.join(directory, 'rings2.json'), { force: true });
  return searchData;
}

async function main() {
  const items = JSON.parse(await fs.readFile(ITEMS_FILE, 'utf8'));
  const searchData = await writeSearchData(items);
  const sizes = Object.fromEntries(await Promise.all(Object.entries(searchData).map(async ([name]) => [
    name,
    (await fs.stat(path.join(SEARCH_DIRECTORY, name))).size,
  ])));
  console.log(JSON.stringify({
    items: Object.keys(items).length,
    records: Object.fromEntries(Object.entries(searchData).map(([name, records]) => [name, records.length])),
    bytes: sizes,
  }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
