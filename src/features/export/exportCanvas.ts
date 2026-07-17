import { toPng } from 'html-to-image';

export type ExportStage = 'preparing' | 'rendering';

interface ImageSnapshot {
  image: HTMLImageElement;
  source: string | null;
}
export interface ExportCanvasDependencies {
  fetchImage?: typeof fetch;
  render?: typeof toPng;
  blobToDataUrl?: (blob: Blob) => Promise<string>;
  onStage?: (stage: ExportStage) => void;
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image data.'));
    reader.readAsDataURL(blob);
  });
}

async function inlineImage(
  image: HTMLImageElement,
  fetchImage: typeof fetch,
  blobToDataUrl: (blob: Blob) => Promise<string>,
): Promise<void> {
  try {
    const response = await fetchImage(image.currentSrc || image.src, { cache: 'default' });
    if (!response.ok) return;

    image.src = await blobToDataUrl(await response.blob());
    await image.decode().catch(() => undefined);
  } catch {
    // The renderer can still use the original URL when an image cannot be inlined.
  }
}

export async function exportCanvasElement(
  element: HTMLElement,
  dependencies: ExportCanvasDependencies = {},
): Promise<string> {
  const fetchImage = dependencies.fetchImage ?? fetch;
  const render = dependencies.render ?? toPng;
  const blobToDataUrl = dependencies.blobToDataUrl ?? readBlobAsDataUrl;
  const snapshots: ImageSnapshot[] = Array.from(element.querySelectorAll('img')).map(image => ({
    image,
    source: image.getAttribute('src'),
  }));

  try {
    dependencies.onStage?.('preparing');
    await Promise.all(snapshots.map(({ image }) => inlineImage(image, fetchImage, blobToDataUrl)));

    dependencies.onStage?.('rendering');
    return await render(element, {
      style: { transform: 'none', transformOrigin: 'top left' },
      pixelRatio: 3,
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
