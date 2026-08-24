// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ImagePalette } from '../../features/palette/imagePalette';
import { DynamicCardBackground } from './DynamicCardBackground';

const palette: ImagePalette = {
  colors: [
    { hex: '#d7a47d', weight: 0.47 },
    { hex: '#e99741', weight: 0.37 },
    { hex: '#7f401d', weight: 0.16 },
  ],
  averageLuminance: 0.25,
  scrimOpacity: 0.13,
  contrastScrimOpacity: 0.3,
  textTone: 'light',
  previewDataUrl: 'data:image/jpeg;base64,preview',
  fallback: 'none',
  background: {
    mode: 'soft-color',
    hex: '#d7a47d',
    coverage: 0.74,
    edgeConfidence: 0.8,
    luminance: 0.25,
    saturation: 0.48,
    tintOpacity: 0.12,
    previewOpacity: 0.1,
  },
};

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('DynamicCardBackground', () => {
  it('uses extracted colors as a restrained background treatment for colored sources', () => {
    act(() => root.render(
      <DynamicCardBackground source="photo" palette={palette} status="ready" />,
    ));

    const background = container.querySelector<HTMLElement>('[data-palette-status="ready"]');
    const styles = Array.from(background?.children ?? [])
      .map(child => child.getAttribute('style') ?? '')
      .join(' ');

    expect(background?.dataset.paletteColors).toBe('#d7a47d,#e99741,#7f401d');
    expect(styles).toContain('rgb(215, 164, 125)');
    expect(styles).toContain('rgb(233, 151, 65)');
    expect(styles).not.toContain('rgb(41, 45, 49)');
    expect(styles).not.toContain('rgb(17, 19, 21)');
  });

  it('keeps a light-neutral source background as the panel base', () => {
    const lightPalette: ImagePalette = {
      ...palette,
      textTone: 'dark',
      scrimOpacity: 0,
      contrastScrimOpacity: 0,
      background: {
        ...palette.background,
        mode: 'light-neutral',
        hex: '#fbfaf8',
        coverage: 0.78,
        edgeConfidence: 0.92,
        luminance: 0.96,
        saturation: 0,
        tintOpacity: 0.1,
        previewOpacity: 0.07,
      },
    };

    act(() => root.render(
      <DynamicCardBackground source="mostly-white-photo" palette={lightPalette} status="ready" />,
    ));

    const background = container.querySelector<HTMLElement>('[data-palette-status="ready"]');
    const styles = Array.from(background?.children ?? [])
      .map(child => child.getAttribute('style') ?? '')
      .join(' ');

    expect(background?.dataset.paletteBackgroundMode).toBe('light-neutral');
    expect(styles).toContain('rgb(251, 250, 248)');
    expect(styles).toContain('opacity: 0.1');
    expect(styles).toContain('opacity: 0.07');
    expect(styles).not.toContain('rgba(8,10,12,0.06)');
  });
});
