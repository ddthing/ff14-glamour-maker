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
  window.history.replaceState({}, '', '/');
  document.head.innerHTML = [
    '<meta name="description" content="">',
    '<meta name="robots" content="">',
    '<meta property="og:title" content="">',
    '<meta property="og:description" content="">',
    '<meta property="og:url" content="">',
    '<meta name="twitter:title" content="">',
    '<meta name="twitter:description" content="">',
    '<link rel="canonical" href="">',
    '<meta name="apple-mobile-web-app-title" content="">',
    '<link rel="manifest" href="">',
    '<script id="app-structured-data" type="application/ld+json">{"@type":"WebApplication"}</script>',
  ].join('');
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  act(() => root.unmount());
  container.remove();
  window.history.replaceState({}, '', '/');
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
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain('ミラプリカード');
    expect(document.querySelector('meta[name="apple-mobile-web-app-title"]')?.getAttribute('content')).toBe('ミラプリセットメーカー');
    expect(document.querySelector('link[rel="manifest"]')?.getAttribute('href')).toBe('/manifest.ja.webmanifest');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href'))
      .toBe('https://ff14-glamour-maker.pages.dev/');
    expect(document.querySelector('#app-structured-data')).not.toBeNull();
  });

  it('uses the dedicated Korean home-screen name', async () => {
    await act(async () => {
      await i18n.changeLanguage('ko');
      root.render(<Header />);
    });

    expect(document.querySelector('meta[name="apple-mobile-web-app-title"]')?.getAttribute('content')).toBe('투영세트 메이커');
  });

  it('publishes route-specific metadata and removes home schema from the guide', async () => {
    window.history.replaceState({}, '', '/guide');

    await act(async () => {
      await i18n.changeLanguage('ko');
      root.render(<Header />);
    });

    expect(document.title).toBe('공식 사용 가이드 | 투영 세트 메이커');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content'))
      .toContain('프리셋 관리');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href'))
      .toBe('https://ff14-glamour-maker.pages.dev/guide');
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content'))
      .toBe('https://ff14-glamour-maker.pages.dev/guide');
    expect(document.querySelector('#app-structured-data')).toBeNull();
  });

  it('marks unknown routes as non-indexable without a canonical', async () => {
    window.history.replaceState({}, '', '/missing');

    await act(async () => {
      await i18n.changeLanguage('ko');
      root.render(<Header />);
    });

    expect(document.title).toContain('페이지를 찾을 수 없습니다');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content'))
      .toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });
});
