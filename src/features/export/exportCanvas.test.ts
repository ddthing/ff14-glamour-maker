// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportCanvasElement } from './exportCanvas';

afterEach(() => {
  vi.useRealTimers();
});

function createCanvas(): HTMLElement {
  const canvas = document.createElement('div');
  canvas.innerHTML = '<img src="https://example.com/a.png"><img src="https://example.com/b.png">';
  for (const image of canvas.querySelectorAll('img')) {
    image.decode = vi.fn().mockResolvedValue(undefined);
  }
  return canvas;
}

describe('exportCanvasElement', () => {
  it('prepares images in parallel and restores their sources after rendering', async () => {
    const canvas = createCanvas();
    const pending: Array<() => void> = [];
    const fetchImage = vi.fn((url: string | URL | Request) => new Promise<Response>(resolve => {
      pending.push(() => resolve(new Response(String(url), { status: 200 })));
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
    const options = render.mock.calls[0][1];
    const overlay = document.createElement('span');
    overlay.setAttribute('data-export-exclude', '');
    expect(options.filter(overlay)).toBe(false);
    expect(options.filter(document.createElement('img'))).toBe(true);
    expect(options.filter(document.createTextNode('Equipment'))).toBe(true);
    expect(Array.from(canvas.querySelectorAll('img'), image => image.getAttribute('src'))).toEqual([
      'https://example.com/a.png',
      'https://example.com/b.png',
    ]);
  });

  it('restores image sources when rendering fails', async () => {
    const canvas = createCanvas();
    const renderError = new Error('render failed');

    await expect(exportCanvasElement(canvas, {
      fetchImage: vi.fn(() => Promise.resolve(new Response('image', { status: 200 }))) as typeof fetch,
      blobToDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,inlined'),
      render: vi.fn().mockRejectedValue(renderError),
    })).rejects.toBe(renderError);

    expect(Array.from(canvas.querySelectorAll('img'), image => image.getAttribute('src'))).toEqual([
      'https://example.com/a.png',
      'https://example.com/b.png',
    ]);
  });

  it('waits for palette analysis before taking the image snapshot', async () => {
    const canvas = createCanvas();
    const palette = document.createElement('div');
    palette.dataset.paletteStatus = 'loading';
    canvas.appendChild(palette);
    const render = vi.fn().mockResolvedValue('data:image/png;base64,result');
    const promise = exportCanvasElement(canvas, {
      fetchImage: vi.fn(() => Promise.resolve(new Response('image', { status: 200 }))) as typeof fetch,
      blobToDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,inlined'),
      render,
    });

    await Promise.resolve();
    expect(render).not.toHaveBeenCalled();
    palette.dataset.paletteStatus = 'ready';

    await expect(promise).resolves.toBe('data:image/png;base64,result');
    expect(render).toHaveBeenCalledOnce();
  });

  it('does not fetch images that are already data URLs', async () => {
    const canvas = createCanvas();
    canvas.querySelector('img')?.setAttribute('src', 'data:image/png;base64,already-inline');
    const fetchImage = vi.fn().mockResolvedValue(new Response('image', { status: 200 }));

    await expect(exportCanvasElement(canvas, {
      fetchImage: fetchImage as typeof fetch,
      blobToDataUrl: async () => 'data:image/png;base64,inlined',
      render: vi.fn().mockResolvedValue('data:image/png;base64,result'),
    })).resolves.toBe('data:image/png;base64,result');

    expect(fetchImage).toHaveBeenCalledOnce();
    expect(String(fetchImage.mock.calls[0]?.[0])).toContain('/b.png');
  });

  it('fails preparation instead of handing a failed image URL to the renderer', async () => {
    const canvas = createCanvas();
    const render = vi.fn().mockResolvedValue('data:image/png;base64,result');

    await expect(exportCanvasElement(canvas, {
      fetchImage: vi.fn().mockResolvedValue(new Response('', { status: 503 })) as typeof fetch,
      render,
    })).rejects.toThrow('Could not prepare an image for export');

    expect(render).not.toHaveBeenCalled();
    expect(Array.from(canvas.querySelectorAll('img'), image => image.getAttribute('src'))).toEqual([
      'https://example.com/a.png',
      'https://example.com/b.png',
    ]);
  });

  it('aborts a network request when per-image preparation exceeds its deadline', async () => {
    vi.useFakeTimers();
    const canvas = createCanvas();
    let requestSignal: AbortSignal | undefined;
    const fetchImageMock = vi.fn((_url: string | URL | Request, options?: RequestInit) => {
      requestSignal = options?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Request aborted.', 'AbortError'));
        }, { once: true });
      });
    });
    const fetchImage = fetchImageMock as typeof fetch;
    const render = vi.fn();
    const promise = exportCanvasElement(canvas, { fetchImage, render });

    for (let index = 0; index < 8 && !fetchImageMock.mock.calls.length; index += 1) {
      await Promise.resolve();
    }
    expect(fetchImageMock).toHaveBeenCalledTimes(2);
    const rejection = expect(promise).rejects.toThrow('Image preparation timed out');
    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;

    expect(requestSignal?.aborted).toBe(true);
    expect(render).not.toHaveBeenCalled();
    expect(Array.from(canvas.querySelectorAll('img'), image => image.getAttribute('src'))).toEqual([
      'https://example.com/a.png',
      'https://example.com/b.png',
    ]);
  });

  it('bounds image decoding and restores already inlined sources on failure', async () => {
    vi.useFakeTimers();
    const canvas = createCanvas();
    const image = canvas.querySelector('img')!;
    const decode = vi.fn(() => new Promise<void>(() => {}));
    image.decode = decode;
    const render = vi.fn();
    const promise = exportCanvasElement(canvas, {
      fetchImage: vi.fn().mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(new Blob(['image'])),
      }) as unknown as typeof fetch,
      blobToDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,inlined'),
      render,
    });

    for (let index = 0; index < 12 && !decode.mock.calls.length; index += 1) {
      await Promise.resolve();
    }
    expect(decode).toHaveBeenCalledOnce();
    const rejection = expect(promise).rejects.toThrow('Image preparation timed out');
    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;

    expect(render).not.toHaveBeenCalled();
    expect(Array.from(canvas.querySelectorAll('img'), item => item.getAttribute('src'))).toEqual([
      'https://example.com/a.png',
      'https://example.com/b.png',
    ]);
  });

  it('times out a stalled renderer and restores sources only after it settles', async () => {
    vi.useFakeTimers();
    const canvas = createCanvas();
    let resolveRender: ((result: string) => void) | undefined;
    const render = vi.fn(() => new Promise<string>(resolve => {
      resolveRender = resolve;
    }));
    const promise = exportCanvasElement(canvas, {
      fetchImage: vi.fn().mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(new Blob(['image'])),
      }) as unknown as typeof fetch,
      blobToDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,inlined'),
      render,
    });

    for (let index = 0; index < 16 && !render.mock.calls.length; index += 1) {
      await Promise.resolve();
    }
    expect(render).toHaveBeenCalledOnce();
    const rejection = expect(promise).rejects.toThrow('Image rendering timed out');
    await vi.advanceTimersByTimeAsync(20_000);
    await rejection;
    expect(canvas.querySelector('img')?.getAttribute('src')).toBe('data:image/png;base64,inlined');

    resolveRender?.('data:image/png;base64,late-result');
    for (let index = 0; index < 4; index += 1) await Promise.resolve();
    expect(Array.from(canvas.querySelectorAll('img'), image => image.getAttribute('src'))).toEqual([
      'https://example.com/a.png',
      'https://example.com/b.png',
    ]);
  });
});
