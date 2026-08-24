import { describe, expect, it } from 'vitest';
import { extractPaletteFromPixels } from './imagePalette';

function pixels(...colors: Array<[number, number, number, number?]>): Uint8ClampedArray {
  return new Uint8ClampedArray(colors.flatMap(([red, green, blue, alpha = 255]) => [
    red, green, blue, alpha,
  ]));
}

describe('extractPaletteFromPixels', () => {
  it('keeps multiple dominant colors and normalizes weights', () => {
    const palette = extractPaletteFromPixels(pixels(
      [196, 72, 58], [196, 72, 58], [42, 92, 156], [42, 92, 156], [66, 130, 82],
    ));
    expect(palette.fallback).toBe('none');
    expect(palette.colors).toHaveLength(3);
    expect(palette.colors.reduce((sum, color) => sum + color.weight, 0)).toBeCloseTo(1);
  });

  it('reduces white influence and provides neutral support colors', () => {
    const palette = extractPaletteFromPixels(pixels(
      [252, 252, 252], [250, 250, 250], [248, 248, 248], [174, 135, 96],
    ));
    expect(palette.colors[0].hex).not.toBe('#fafafa');
    expect(palette.background.mode).toBe('light-neutral');
    expect(palette.scrimOpacity).toBe(0);
    expect(palette.background.previewOpacity).toBeLessThanOrEqual(0.05);
    expect(palette.textTone).toBe('dark');
    expect(palette.colors).toHaveLength(3);
  });

  it('keeps a mostly white source background even when the subject is dark', () => {
    const palette = extractPaletteFromPixels(pixels(
      [255, 255, 255], [255, 255, 255], [248, 248, 248], [255, 255, 255],
      [28, 28, 30], [155, 38, 42], [232, 232, 232], [255, 255, 255],
    ), null, { width: 4, height: 2 });

    expect(palette.background.mode).toBe('light-neutral');
    expect(palette.background.coverage).toBeGreaterThanOrEqual(0.55);
    expect(palette.background.tintOpacity).toBeLessThanOrEqual(0.05);
    expect(palette.scrimOpacity).toBe(0);
    expect(palette.textTone).toBe('dark');
  });

  it('keeps white text for medium-light reference-card brightness', () => {
    const palette = extractPaletteFromPixels(pixels(
      [214, 214, 214], [198, 198, 198], [184, 184, 184], [174, 135, 96],
    ));

    expect(palette.averageLuminance).toBeLessThan(0.78);
    expect(palette.textTone).toBe('light');
    expect(palette.contrastScrimOpacity).toBeGreaterThan(0);
  });

  it('keeps a warm saturated image visible below the readability scrim', () => {
    const palette = extractPaletteFromPixels(pixels(
      [236, 126, 34], [236, 126, 34], [211, 82, 24], [148, 65, 31],
    ));

    expect(palette.colors[0].hex).toBe('#ec7e22');
    expect(palette.scrimOpacity).toBeLessThan(0.3);
    expect(palette.textTone).toBe('light');
  });

  it('keeps the same subtle effect and switches to dark text for an almost-white image', () => {
    const palette = extractPaletteFromPixels(pixels(
      [255, 255, 255], [253, 253, 253], [250, 250, 250],
    ));

    expect(palette.background.mode).toBe('light-neutral');
    expect(palette.scrimOpacity).toBe(0);
    expect(palette.contrastScrimOpacity).toBe(0);
    expect(palette.textTone).toBe('dark');
  });

  it('falls back safely for transparent input', () => {
    const palette = extractPaletteFromPixels(pixels([255, 255, 255, 0]));
    expect(palette.fallback).toBe('low-color');
    expect(palette.colors).toHaveLength(3);
  });
});
