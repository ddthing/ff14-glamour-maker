import fs from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import {
  buildSearchDatasets,
  SEARCH_DATASET_KEYS,
} from './searchData.mjs';

const SEARCH_DATA_DIRECTORY = 'src/data/search';
const GZIP_BUDGET_BYTES = 500 * 1024;

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

describe('generated search data', () => {
  it('matches canonical item data and stays within the per-slot gzip budget', async () => {
    const [items, facewear] = await Promise.all([
      readJson('src/data/items.json'),
      readJson('src/data/facewear.json'),
    ]);
    const expected = buildSearchDatasets(items, facewear);

    for (const dataset of SEARCH_DATASET_KEYS) {
      const filePath = path.join(SEARCH_DATA_DIRECTORY, `${dataset}.json`);
      const contents = await fs.readFile(filePath);
      const actual = JSON.parse(contents.toString('utf8'));

      expect(actual, `${dataset} search data is stale`).toEqual(expected[dataset]);
      expect(
        gzipSync(contents).byteLength,
        `${dataset} search data exceeds the 500 KiB gzip budget`,
      ).toBeLessThanOrEqual(GZIP_BUDGET_BYTES);
    }
  });
});
