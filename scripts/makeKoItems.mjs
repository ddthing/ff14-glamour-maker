import fs from 'node:fs/promises';
import { mergeLocalizedItems, parseEquipSlotCsv, parseItemCsv } from './itemData.mjs';

const ITEM_SOURCES = {
  ko: 'https://raw.githubusercontent.com/Ra-Workspace/ffxiv-datamining-ko/master/csv/Item.csv',
  en: 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/en/Item.csv',
  ja: 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/ja/Item.csv',
};
const EQUIP_SLOTS = 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/en/EquipSlotCategory.csv';

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.text();
}

async function main() {
  const [localizedEntries, equipSlotCsv] = await Promise.all([
    Promise.all(Object.entries(ITEM_SOURCES).map(async ([language, url]) => [
      language,
      parseItemCsv(await fetchText(url)),
    ])),
    fetchText(EQUIP_SLOTS),
  ]);
  const items = mergeLocalizedItems(
    Object.fromEntries(localizedEntries),
    parseEquipSlotCsv(equipSlotCsv),
  );
  await fs.writeFile('src/data/items.json', `${JSON.stringify(items, null, 2)}\n`, 'utf8');

  const counts = Object.fromEntries(Object.keys(ITEM_SOURCES).map(language => [
    language,
    Object.values(items).filter(item => item[language]).length,
  ]));
  console.log(JSON.stringify({ total: Object.keys(items).length, counts }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
