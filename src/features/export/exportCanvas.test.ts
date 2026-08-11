// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { exportCanvasElement } from './exportCanvas';

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
    expect(Array.from(canvas.querySelectorAll('img'), image => image.getAttribute('src'))).toEqual([
      'https://example.com/a.png',
      'https://example.com/b.png',
    ]);
  });

  it('restores image sources when rendering fails', async () => {
    const canvas = createCanvas();
    const renderError = new Error('render failed');

    await expect(exportCanvasElement(canvas, {
      fetchImage: vi.fn().mockResolvedValue(new Response('image', { status: 200 })),
      blobToDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,inlined'),
      render: vi.fn().mockRejectedValue(renderError),
    })).rejects.toBe(renderError);

    expect(Array.from(canvas.querySelectorAll('img'), image => image.getAttribute('src'))).toEqual([
      'https://example.com/a.png',
      'https://example.com/b.png',
    ]);
  });
});
