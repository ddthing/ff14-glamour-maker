import { toPng } from 'html-to-image';

export type ExportStage = 'preparing' | 'rendering';

interface ImageSnapshot {
  image: HTMLImageElement;
  source: string | null;
  sourceSet: string | null;
  sizes: string | null;
  inlinedSource?: string;
}

const IMAGE_PREPARATION_TIMEOUT_MS = 10_000;
const RENDER_TIMEOUT_MS = 20_000;

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
  snapshot: ImageSnapshot,
  fetchImage: typeof fetch,
  blobToDataUrl: (blob: Blob) => Promise<string>,
  groupSignal: AbortSignal,
): Promise<void> {
  const { image } = snapshot;
  const source = image.currentSrc || image.getAttribute('src') || '';
  if (!source || /^data:/i.test(source)) return;

  const controller = new AbortController();
  let timeoutId: number | undefined;
  let rejectAbort: ((reason: Error) => void) | undefined;
  const abortPromise = new Promise<never>((_resolve, reject) => {
    rejectAbort = reject;
  });
  void abortPromise.catch(() => {});
  const abortFromGroup = () => {
    controller.abort();
    rejectAbort?.(new Error('Image preparation was cancelled.'));
  };
  const timeoutError = new Error(
    `Image preparation timed out after ${IMAGE_PREPARATION_TIMEOUT_MS} ms. Please retry the export.`,
  );
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(timeoutError);
      controller.abort();
    }, IMAGE_PREPARATION_TIMEOUT_MS);
  });
  void timeoutPromise.catch(() => {});
  const waitForStep = <T,>(promise: Promise<T>) => Promise.race([
    promise,
    timeoutPromise,
    abortPromise,
  ]);

  if (groupSignal.aborted) abortFromGroup();
  else groupSignal.addEventListener('abort', abortFromGroup, { once: true });

  try {
    const response = await waitForStep(fetchImage(source, {
      cache: 'default',
      signal: controller.signal,
    }));
    if (!response.ok) {
      throw new Error(`Image request failed with status ${response.status}.`);
    }

    const blob = await waitForStep(response.blob());
    const dataUrl = await waitForStep(blobToDataUrl(blob));
    const sourceIsUnchanged = image.getAttribute('src') === snapshot.source
      && image.getAttribute('srcset') === snapshot.sourceSet
      && image.getAttribute('sizes') === snapshot.sizes;
    if (!sourceIsUnchanged) {
      throw new Error('A canvas image changed during export preparation. Please retry.');
    }

    image.src = dataUrl;
    image.removeAttribute('srcset');
    image.removeAttribute('sizes');
    snapshot.inlinedSource = image.getAttribute('src') ?? dataUrl;
    if (typeof image.decode === 'function') await waitForStep(image.decode());
  } catch (error) {
    if (error === timeoutError) throw timeoutError;
    throw new Error('Could not prepare an image for export. Please retry.', { cause: error });
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    groupSignal.removeEventListener('abort', abortFromGroup);
  }
}

function restoreImageSources(snapshots: readonly ImageSnapshot[]): void {
  for (const { image, source, sourceSet, sizes, inlinedSource } of snapshots) {
    // Leave any newer user-selected image in place if it changed during export.
    if (
      inlinedSource === undefined
      || image.getAttribute('src') !== inlinedSource
      || image.getAttribute('srcset') !== null
      || image.getAttribute('sizes') !== null
    ) continue;
    if (source === null) image.removeAttribute('src');
    else image.setAttribute('src', source);
    if (sourceSet === null) image.removeAttribute('srcset');
    else image.setAttribute('srcset', sourceSet);
    if (sizes === null) image.removeAttribute('sizes');
    else image.setAttribute('sizes', sizes);
  }
}

async function waitForRender(promise: Promise<string>, timeoutMs: number): Promise<string> {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(`Image rendering timed out after ${timeoutMs} ms. Please retry the export.`));
    }, timeoutMs);
  });
  void timeout.catch(() => {});

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
}

async function waitForPalette(element: HTMLElement, timeoutMs = 5_000): Promise<void> {
  if (!element.querySelector('[data-palette-status="loading"]')) return;

  await new Promise<void>(resolve => {
    const finish = () => {
      observer.disconnect();
      window.clearTimeout(timeout);
      resolve();
    };
    const observer = new MutationObserver(() => {
      if (!element.querySelector('[data-palette-status="loading"]')) finish();
    });
    const timeout = window.setTimeout(finish, timeoutMs);
    observer.observe(element, { attributes: true, subtree: true, attributeFilter: ['data-palette-status'] });
  });
}

export async function exportCanvasElement(
  element: HTMLElement,
  dependencies: ExportCanvasDependencies = {},
): Promise<string> {
  const fetchImage = dependencies.fetchImage ?? fetch;
  const render = dependencies.render ?? toPng;
  const blobToDataUrl = dependencies.blobToDataUrl ?? readBlobAsDataUrl;
  let snapshots: ImageSnapshot[] = [];
  let renderTask: Promise<string> | null = null;
  let renderSettled = false;
  let imagesRestored = false;
  const restoreImages = () => {
    if (imagesRestored) return;
    imagesRestored = true;
    restoreImageSources(snapshots);
  };

  try {
    dependencies.onStage?.('preparing');
    await waitForPalette(element);
    snapshots = Array.from(element.querySelectorAll('img')).map(image => ({
      image,
      source: image.getAttribute('src'),
      sourceSet: image.getAttribute('srcset'),
      sizes: image.getAttribute('sizes'),
    }));
    const imagePreparationController = new AbortController();
    const imageTasks = snapshots.map(snapshot => inlineImage(
      snapshot,
      fetchImage,
      blobToDataUrl,
      imagePreparationController.signal,
    ));
    try {
      await Promise.all(imageTasks);
    } catch (error) {
      imagePreparationController.abort();
      await Promise.allSettled(imageTasks);
      throw error;
    }

    dependencies.onStage?.('rendering');
    renderTask = Promise.resolve().then(() => render(element, {
      filter: node => !(node instanceof Element && node.hasAttribute('data-export-exclude')),
      style: { transform: 'none', transformOrigin: 'top left' },
      pixelRatio: 3,
      cacheBust: false,
      quality: 1,
    })).then(
      result => {
        renderSettled = true;
        return result;
      },
      error => {
        renderSettled = true;
        throw error;
      },
    );
    return await waitForRender(renderTask, RENDER_TIMEOUT_MS);
  } finally {
    if (renderTask && !renderSettled) {
      // html-to-image cannot cancel an active render; keep its source snapshot stable until it settles.
      void renderTask.then(restoreImages, restoreImages);
    } else {
      restoreImages();
    }
  }
}
