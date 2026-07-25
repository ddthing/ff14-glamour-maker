import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_MANIFEST_PATH = 'dist/.vite/manifest.json';
const INITIAL_ENTRY = 'index.html';
const CROP_ENTRY = 'src/components/canvas/CropModal.tsx';
const EXPORT_ENTRY = 'src/features/export/exportCanvas.ts';

function requireEntry(manifest, key) {
  const entry = manifest[key];
  if (!entry) {
    throw new Error(`Missing Vite manifest entry: ${key}`);
  }
  return entry;
}

export function collectStaticImports(manifest, entryKey, collected = new Set()) {
  const entry = requireEntry(manifest, entryKey);

  for (const dependencyKey of entry.imports ?? []) {
    if (collected.has(dependencyKey)) continue;
    collected.add(dependencyKey);
    collectStaticImports(manifest, dependencyKey, collected);
  }

  return collected;
}

export function findSharedLazyDependencies(manifest) {
  requireEntry(manifest, INITIAL_ENTRY);
  requireEntry(manifest, CROP_ENTRY);
  requireEntry(manifest, EXPORT_ENTRY);

  const initialDependencies = collectStaticImports(manifest, INITIAL_ENTRY);
  initialDependencies.add(INITIAL_ENTRY);

  const cropOnly = collectStaticImports(manifest, CROP_ENTRY);
  const exportOnly = collectStaticImports(manifest, EXPORT_ENTRY);

  for (const dependency of initialDependencies) {
    cropOnly.delete(dependency);
    exportOnly.delete(dependency);
  }

  return [...cropOnly]
    .filter(dependency => exportOnly.has(dependency))
    .sort();
}

export async function checkLazyChunkIsolation(manifestPath = DEFAULT_MANIFEST_PATH) {
  const manifestContents = await readFile(resolve(manifestPath), 'utf8');
  const manifest = JSON.parse(manifestContents);
  const sharedLazyDependencies = findSharedLazyDependencies(manifest);

  if (sharedLazyDependencies.length > 0) {
    throw new Error(
      `Crop and export share lazy-only dependencies:\n${sharedLazyDependencies
        .map(dependency => `- ${dependency}`)
        .join('\n')}`,
    );
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : '';

if (import.meta.url === invokedPath) {
  checkLazyChunkIsolation(process.argv[2])
    .then(() => {
      console.log('Lazy crop and export chunks are isolated.');
    })
    .catch(error => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
