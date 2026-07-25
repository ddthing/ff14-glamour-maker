// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { exportCanvasElement, selectExportPixelRatio } from './exportCanvas';

function createCanvas(): HTMLElement {
  const canvas = document.createElement('div');
  canvas.innerHTML = '<img src="https://example.com/a.png"><img src="https://example.com/b.png">';
  for (const image of canvas.querySelectorAll('img')) {
    image.decode = vi.fn().mockResolvedValue(undefined);
  }
  return canvas;
}

function createCanvasWithSources(sources: readonly (string | null)[]): HTMLElement {
  const canvas = document.createElement('div');
  for (const source of sources) {
    const image = document.createElement('img');
    if (source !== null) image.setAttribute('src', source);
    image.decode = vi.fn().mockResolvedValue(undefined);
    canvas.append(image);
  }
  return canvas;
}

describe('selectExportPixelRatio', () => {
  it('keeps 3x output for an ordinary desktop environment', () => {
    expect(selectExportPixelRatio({
      viewportWidth: 1440,
      coarsePointer: false,
      deviceMemory: 8,
    })).toBe(3);
  });

  it.each([
    { viewportWidth: 1440, coarsePointer: true, deviceMemory: 8 },
    { viewportWidth: 820, coarsePointer: false, deviceMemory: 8 },
    { viewportWidth: 1440, coarsePointer: false, deviceMemory: 4 },
  ])('uses 2x output for a constrained environment: %o', environment => {
    expect(selectExportPixelRatio(environment)).toBe(2);
  });

  it('does not treat an unavailable memory API as low memory', () => {
    expect(selectExportPixelRatio({
      viewportWidth: 1440,
      coarsePointer: false,
    })).toBe(3);
  });
});

describe('exportCanvasElement', () => {
  it('prepares images in parallel and restores their sources after rendering', async () => {
    const canvas = createCanvas();
    const pending: Array<() => void> = [];
    const fetchImage = vi.fn((url: string | URL | Request) => new Promise<Response>(resolve => {
      pending.push(() => resolve(new Response(new Blob([String(url)]), { status: 200 })));
    }));
    const render = vi.fn().mockResolvedValue('data:image/png;base64,result');
    const promise = exportCanvasElement(canvas, {
      fetchImage: fetchImage as typeof fetch,
      blobToDataUrl: async blob => `data:image/png;base64,${await blob.text()}`,
      render,
    });

    await vi.waitFor(() => expect(fetchImage).toHaveBeenCalledTimes(2));
    pending.forEach(resolve => resolve());

    await expect(promise).resolves.toBe('data:image/png;base64,result');
    expect(render).toHaveBeenCalledOnce();
    expect(Array.from(canvas.querySelectorAll('img'), image => image.getAttribute('src'))).toEqual([
      'https://example.com/a.png',
      'https://example.com/b.png',
    ]);
  });

  it('deduplicates remote sources and skips data and blob URLs', async () => {
    const remoteSource = 'https://example.com/shared.png';
    const dataSource = 'data:image/png;base64,local';
    const blobSource = 'blob:https://example.com/local';
    const canvas = createCanvasWithSources([
      remoteSource,
      remoteSource,
      dataSource,
      blobSource,
    ]);
    const fetchImage = vi.fn().mockResolvedValue(
      new Response(new Blob(['shared-image']), { status: 200 }),
    );
    const blobToDataUrl = vi.fn().mockResolvedValue('data:image/png;base64,shared');
    const render = vi.fn(async (element: HTMLElement) => {
      expect(Array.from(element.querySelectorAll('img'), image => image.src)).toEqual([
        'data:image/png;base64,shared',
        'data:image/png;base64,shared',
        dataSource,
        blobSource,
      ]);
      return 'data:image/png;base64,result';
    });

    await exportCanvasElement(canvas, {
      fetchImage,
      blobToDataUrl,
      render,
    });

    expect(fetchImage).toHaveBeenCalledTimes(1);
    expect(blobToDataUrl).toHaveBeenCalledTimes(1);
    expect(Array.from(canvas.querySelectorAll('img'), image => image.getAttribute('src'))).toEqual([
      remoteSource,
      remoteSource,
      dataSource,
      blobSource,
    ]);
  });

  it('limits remote image preparation to four active tasks', async () => {
    const canvas = createCanvasWithSources(
      Array.from({ length: 6 }, (_, index) => `https://example.com/${index}.png`),
    );
    let activeTasks = 0;
    let maximumActiveTasks = 0;
    let releaseTasks: (() => void) | undefined;
    const taskGate = new Promise<void>(resolve => {
      releaseTasks = resolve;
    });
    const fetchImage = vi.fn(async () => {
      activeTasks += 1;
      maximumActiveTasks = Math.max(maximumActiveTasks, activeTasks);
      await taskGate;
      activeTasks -= 1;
      return new Response(new Blob(['image']), { status: 200 });
    });

    const exportPromise = exportCanvasElement(canvas, {
      fetchImage,
      blobToDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,inlined'),
      render: vi.fn().mockResolvedValue('data:image/png;base64,result'),
    });

    await vi.waitFor(() => expect(fetchImage).toHaveBeenCalledTimes(4));
    expect(maximumActiveTasks).toBe(4);
    releaseTasks?.();
    await exportPromise;

    expect(fetchImage).toHaveBeenCalledTimes(6);
    expect(maximumActiveTasks).toBe(4);
  });

  it('keeps failed image sources and renders with the selected ratio and stage order', async () => {
    const goodSource = 'https://example.com/good.png';
    const failedSource = 'https://example.com/failed.png';
    const canvas = createCanvasWithSources([goodSource, failedSource]);
    const stages: string[] = [];
    const render = vi.fn(async (element: HTMLElement) => {
      expect(Array.from(element.querySelectorAll('img'), image => image.src)).toEqual([
        'data:image/png;base64,inlined',
        failedSource,
      ]);
      return 'data:image/png;base64,result';
    });

    await expect(exportCanvasElement(canvas, {
      environment: {
        viewportWidth: 390,
        coarsePointer: true,
      },
      fetchImage: vi.fn(async input => {
        if (String(input) === failedSource) throw new Error('network failed');
        return new Response(new Blob(['image']), { status: 200 });
      }),
      blobToDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,inlined'),
      render,
      onStage: stage => stages.push(stage),
    })).resolves.toBe('data:image/png;base64,result');

    expect(render).toHaveBeenCalledWith(canvas, expect.objectContaining({ pixelRatio: 2 }));
    expect(stages).toEqual(['preparing', 'rendering']);
    expect(Array.from(canvas.querySelectorAll('img'), image => image.getAttribute('src'))).toEqual([
      goodSource,
      failedSource,
    ]);
  });

  it('restores image sources when rendering fails', async () => {
    const canvas = createCanvasWithSources([
      'https://example.com/a.png',
      null,
    ]);
    const renderError = new Error('render failed');

    await expect(exportCanvasElement(canvas, {
      fetchImage: vi.fn().mockResolvedValue(new Response(new Blob(['image']), { status: 200 })),
      blobToDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,inlined'),
      render: vi.fn().mockRejectedValue(renderError),
    })).rejects.toBe(renderError);

    expect(Array.from(canvas.querySelectorAll('img'), image => image.getAttribute('src'))).toEqual([
      'https://example.com/a.png',
      null,
    ]);
  });
});
