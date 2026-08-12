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
  textTone: 'light',
  previewDataUrl: 'data:image/jpeg;base64,preview',
  fallback: 'none',
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
  it('uses extracted colors as the background instead of a dark neutral base', () => {
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
});
