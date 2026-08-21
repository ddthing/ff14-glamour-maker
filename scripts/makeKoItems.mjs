import fs from 'node:fs/promises';
import {
  mergeLocalizedItems,
  parseEquipSlotCsv,
  parseItemCsv,
  summarizeItemData,
} from './itemData.mjs';

const ITEM_SOURCES = {
  ko: 'https://raw.githubusercontent.com/Ra-Workspace/ffxiv-datamining-ko/master/csv/Item.csv',
  en: 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/en/Item.csv',
  ja: 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/ja/Item.csv',
};
const EQUIP_SLOTS = 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/en/EquipSlotCategory.csv';
const OVERRIDES_FILE = new URL('./item-overrides.json', import.meta.url);

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.text();
}

async function main() {
  const [localizedEntries, equipSlotCsv, overridesText] = await Promise.all([
    Promise.all(Object.entries(ITEM_SOURCES).map(async ([language, url]) => [
      language,
      parseItemCsv(await fetchText(url)),
    ])),
    fetchText(EQUIP_SLOTS),
    fs.readFile(OVERRIDES_FILE, 'utf8'),
  ]);
  const overrides = JSON.parse(overridesText);
  const items = mergeLocalizedItems(
    Object.fromEntries(localizedEntries),
    parseEquipSlotCsv(equipSlotCsv),
    overrides,
  );
  const unknownOverrides = Object.keys(overrides).filter(id => !items[id]);
  if (unknownOverrides.length > 0) {
    throw new Error(`Overrides reference unknown item IDs: ${unknownOverrides.join(', ')}`);
  }
  await fs.writeFile('src/data/items.json', `${JSON.stringify(items, null, 2)}\n`, 'utf8');

  const counts = Object.fromEntries(Object.keys(ITEM_SOURCES).map(language => [
    language,
    Object.values(items).filter(item => item[language]).length,
  ]));
  console.log(JSON.stringify({ ...summarizeItemData(items), counts }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
