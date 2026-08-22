// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { Header } from './Header';

vi.mock('../../hooks/useDarkMode', () => ({
  useDarkMode: () => [false, vi.fn()] as const,
}));

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  document.head.innerHTML = [
    '<meta name="description" content="">',
    '<meta name="apple-mobile-web-app-title" content="">',
    '<link rel="manifest" href="">',
  ].join('');
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  act(() => root.unmount());
  container.remove();
  await i18n.changeLanguage('ko');
});

describe('localized document metadata', () => {
  it('updates language, title, description, manifest, and home-screen title', async () => {
    await act(async () => {
      await i18n.changeLanguage('ja');
      root.render(<Header />);
    });

    expect(document.documentElement.lang).toBe('ja');
    expect(document.title).toBe('ミラプリセットメーカー | ファイナルファンタジーXIV');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain('ミラプリセット');
    expect(document.querySelector('meta[name="apple-mobile-web-app-title"]')?.getAttribute('content')).toBe('ミラプリセットメーカー');
    expect(document.querySelector('link[rel="manifest"]')?.getAttribute('href')).toBe('/manifest.ja.webmanifest');
  });

  it('uses the dedicated Korean home-screen name', async () => {
    await act(async () => {
      await i18n.changeLanguage('ko');
      root.render(<Header />);
    });

    expect(document.querySelector('meta[name="apple-mobile-web-app-title"]')?.getAttribute('content')).toBe('투영세트 메이커');
  });

  it('sets route-specific metadata and structured data for information pages', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
      root.render(<Header page="privacy" />);
    });

    expect(document.title).toBe('Privacy policy | Glamour Set Maker');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${window.location.origin}/privacy/`);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain('Google AdSense');

    const structuredData = JSON.parse(document.querySelector('#page-structured-data')?.textContent || '{}') as { '@type'?: string; dateModified?: string };
    expect(structuredData['@type']).toBe('WebPage');
    expect(structuredData.dateModified).toBe('2026-08-13');
  });
});
