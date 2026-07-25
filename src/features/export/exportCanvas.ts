import { toPng } from 'html-to-image';

export type ExportStage = 'preparing' | 'rendering';
export type ExportPixelRatio = 2 | 3;

export interface ExportEnvironment {
  viewportWidth: number;
  coarsePointer: boolean;
  deviceMemory?: number;
}

interface ImageSnapshot {
  image: HTMLImageElement;
  source: string | null;
  effectiveSource: string;
}

export interface ExportCanvasDependencies {
  fetchImage?: typeof fetch;
  render?: typeof toPng;
  blobToDataUrl?: (blob: Blob) => Promise<string>;
  environment?: ExportEnvironment;
  onStage?: (stage: ExportStage) => void;
}

const IMAGE_PREPARATION_CONCURRENCY = 4;

export function selectExportPixelRatio(
  environment: ExportEnvironment,
): ExportPixelRatio {
  const hasLowMemory = environment.deviceMemory !== undefined
    && environment.deviceMemory <= 4;

  return environment.coarsePointer
    || environment.viewportWidth <= 820
    || hasLowMemory
    ? 2
    : 3;
}

function readExportEnvironment(): ExportEnvironment {
  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };

  return {
    viewportWidth: window.innerWidth,
    coarsePointer: window.matchMedia?.('(pointer: coarse)').matches ?? false,
    deviceMemory: navigatorWithMemory.deviceMemory,
  };
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image data.'));
    reader.readAsDataURL(blob);
  });
}

function requiresPreparation(source: string): boolean {
  return !!source
    && !source.startsWith('data:')
    && !source.startsWith('blob:');
}

async function mapWithConcurrency<T, R>(
  values: readonly T[],
  concurrency: number,
  task: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await task(values[index]);
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, values.length) },
      () => worker(),
    ),
  );
  return results;
}

async function prepareImageSource(
  source: string,
  fetchImage: typeof fetch,
  blobToDataUrl: (blob: Blob) => Promise<string>,
): Promise<string | null> {
  try {
    const response = await fetchImage(source, { cache: 'default' });
    if (!response.ok) return null;
    return await blobToDataUrl(await response.blob());
  } catch {
    return null;
  }
}

async function prepareImages(
  snapshots: readonly ImageSnapshot[],
  fetchImage: typeof fetch,
  blobToDataUrl: (blob: Blob) => Promise<string>,
): Promise<void> {
  const uniqueSources = [...new Set(
    snapshots
      .map(snapshot => snapshot.effectiveSource)
      .filter(requiresPreparation),
  )];
  const preparedSources = await mapWithConcurrency(
    uniqueSources,
    IMAGE_PREPARATION_CONCURRENCY,
    async source => [
      source,
      await prepareImageSource(source, fetchImage, blobToDataUrl),
    ] as const,
  );
  const replacements = new Map(
    preparedSources.filter(
      (entry): entry is readonly [string, string] => entry[1] !== null,
    ),
  );
  const changedImages: HTMLImageElement[] = [];

  for (const snapshot of snapshots) {
    const replacement = replacements.get(snapshot.effectiveSource);
    if (!replacement) continue;
    snapshot.image.src = replacement;
    changedImages.push(snapshot.image);
  }

  await Promise.all(
    changedImages.map(image => image.decode().catch(() => undefined)),
  );
}

export async function exportCanvasElement(
  element: HTMLElement,
  dependencies: ExportCanvasDependencies = {},
): Promise<string> {
  const fetchImage = dependencies.fetchImage ?? fetch;
  const render = dependencies.render ?? toPng;
  const blobToDataUrl = dependencies.blobToDataUrl ?? readBlobAsDataUrl;
  const environment = dependencies.environment ?? readExportEnvironment();
  const pixelRatio = selectExportPixelRatio(environment);
  const snapshots: ImageSnapshot[] = Array.from(element.querySelectorAll('img')).map(image => ({
    image,
    source: image.getAttribute('src'),
    effectiveSource: image.currentSrc || image.src,
  }));

  try {
    dependencies.onStage?.('preparing');
    await prepareImages(snapshots, fetchImage, blobToDataUrl);

    dependencies.onStage?.('rendering');
    return await render(element, {
      style: { transform: 'none', transformOrigin: 'top left' },
      pixelRatio,
      cacheBust: false,
      quality: 1,
    });
  } finally {
    for (const { image, source } of snapshots) {
      if (source === null) image.removeAttribute('src');
      else image.setAttribute('src', source);
    }
  }
}
