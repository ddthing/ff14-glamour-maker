// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import getCroppedImg, { calculateCropOutputSize } from './cropImage';

describe('calculateCropOutputSize', () => {
  it('caps a large portrait crop at 1440x2700', () => {
    expect(calculateCropOutputSize({ width: 3000, height: 5625 })).toEqual({
      width: 1440,
      height: 2700,
    });
  });

  it('does not upscale a small crop', () => {
    expect(calculateCropOutputSize({ width: 480, height: 900 })).toEqual({
      width: 480,
      height: 900,
    });
  });

  it('rejects zero, negative, and non-finite dimensions', () => {
    expect(() => calculateCropOutputSize({ width: 0, height: 900 })).toThrow();
    expect(() => calculateCropOutputSize({ width: -1, height: 900 })).toThrow();
    expect(() => calculateCropOutputSize({ width: Number.NaN, height: 900 })).toThrow();
  });
});

describe('getCroppedImg', () => {
  it('draws the source crop directly into one bounded output canvas', async () => {
    const drawImage = vi.fn();
    const outputBlob = new Blob(['png'], { type: 'image/png' });
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage })),
      toBlob: vi.fn((callback: BlobCallback) => callback(outputBlob)),
    } as unknown as HTMLCanvasElement;
    const createCanvas = vi.fn(() => canvas);
    const image = {} as HTMLImageElement;

    await expect(getCroppedImg(
      'blob:source',
      { x: 10, y: 20, width: 3000, height: 5625 },
      {
        createImage: vi.fn().mockResolvedValue(image),
        createCanvas,
      },
    )).resolves.toBe(outputBlob);

    expect(createCanvas).toHaveBeenCalledTimes(1);
    expect(canvas.width).toBe(1440);
    expect(canvas.height).toBe(2700);
    expect(drawImage).toHaveBeenCalledWith(
      image,
      10,
      20,
      3000,
      5625,
      0,
      0,
      1440,
      2700,
    );
  });

  it('rejects when PNG Blob encoding fails', async () => {
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage: vi.fn() })),
      toBlob: vi.fn((callback: BlobCallback) => callback(null)),
    } as unknown as HTMLCanvasElement;

    await expect(getCroppedImg(
      'blob:source',
      { x: 0, y: 0, width: 480, height: 900 },
      {
        createImage: vi.fn().mockResolvedValue({} as HTMLImageElement),
        createCanvas: () => canvas,
      },
    )).rejects.toThrow('Could not encode cropped image');
  });
});
