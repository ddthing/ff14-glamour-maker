import fs from 'node:fs/promises';
import { summarizeItemData } from './itemData.mjs';

const ITEMS_FILE = 'src/data/items.json';
const ASSET_ROOT = 'public/item-icons';
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

  console.log(JSON.stringify(summarizeItemData(items), null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
