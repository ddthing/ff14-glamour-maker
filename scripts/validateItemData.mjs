import fs from 'node:fs/promises';
import { summarizeItemData } from './itemData.mjs';
import { buildSearchData } from './buildSearchData.mjs';

const ITEMS_FILE = 'src/data/items.json';
const ASSET_ROOT = 'public/item-icons';
const SEARCH_ROOT = 'src/data/search';
const VALID_STATUSES = new Set(['complete', 'partial', 'kr-only', 'review']);

function inferredStatus(item) {
  if (item.en && item.ja) return 'complete';
  if (item.en || item.ja) return 'partial';
  if (item.ko) return 'kr-only';
  return 'review';
}

async function main() {
  const items = JSON.parse(await fs.readFile(ITEMS_FILE, 'utf8'));
  const errors = [];
  const expectedSearchData = buildSearchData(items);

  for (const [filename, expected] of Object.entries(expectedSearchData)) {
    try {
      const actual = JSON.parse(await fs.readFile(`${SEARCH_ROOT}/${filename}`, 'utf8'));
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        errors.push(`${filename}: search shard is stale; run node scripts/buildSearchData.mjs`);
      }
    } catch {
      errors.push(`${filename}: missing or invalid search shard; run node scripts/buildSearchData.mjs`);
    }
  }

  for (const filename of await fs.readdir(SEARCH_ROOT)) {
    if (filename.endsWith('.json') && !(filename in expectedSearchData)) {
      errors.push(`${filename}: obsolete search shard; run node scripts/buildSearchData.mjs`);
    }
  }

  for (const [id, item] of Object.entries(items)) {
    const status = item.translationStatus ?? inferredStatus(item);
    if (!VALID_STATUSES.has(status)) {
      errors.push(`${id}: invalid translationStatus ${String(item.translationStatus)}`);
    }
    if (
      item.iconAssetKey !== undefined
      && !/^[a-z0-9_-]+\/[a-z0-9_-]+$/i.test(item.iconAssetKey)
    ) {
      errors.push(`${id}: invalid iconAssetKey ${String(item.iconAssetKey)}`);
    }
    if (item.iconAssetKey) {
      try {
        await fs.stat(`${ASSET_ROOT}/${item.iconAssetKey}.png`);
      } catch {
        errors.push(`${id}: missing local icon asset ${ASSET_ROOT}/${item.iconAssetKey}.png`);
      }
    }
    if (status === 'kr-only' && (item.en || item.ja)) {
      errors.push(`${id}: kr-only item contains a non-Korean name`);
    }
    if (status === 'complete' && (!item.en || !item.ja)) {
      errors.push(`${id}: complete item is missing en or ja`);
    }
  }

  if (errors.length > 0) {
    console.error(errors.slice(0, 20).join('\n'));
    if (errors.length > 20) console.error(`... and ${errors.length - 20} more errors`);
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify({
    ...summarizeItemData(items),
    searchShards: Object.fromEntries(Object.entries(expectedSearchData).map(([filename, records]) => [
      filename,
      { items: records.length },
    ])),
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
