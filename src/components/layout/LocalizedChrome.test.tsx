// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { Footer } from './Footer';
import { Header } from './Header';

vi.mock('../../hooks/useDarkMode', () => ({
  useDarkMode: () => [false, vi.fn()] as const,
}));

let container: HTMLDivElement;
let root: Root;
const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

beforeEach(() => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  act(() => root.unmount());
  container.remove();
  await i18n.changeLanguage('ko');
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

async function renderChrome(language: 'en' | 'ja') {
  await act(async () => {
    await i18n.changeLanguage(language);
    root.render(<><Header /><Footer /></>);
  });
}

function localFooterLabels(): string[] {
  return Array.from(container.querySelectorAll('footer a'))
    .filter(link => link.getAttribute('href')?.startsWith('/'))
    .map(link => link.textContent?.trim() ?? '');
}

describe('localized application chrome', () => {
  it('renders English navigation and footer labels', async () => {
    await renderChrome('en');

    expect(container.querySelector('header')?.getAttribute('aria-label')).toBe('Main navigation');
    expect(container.querySelector('.brand-wordmark')?.textContent).toBe('Glamour Set Maker');
    expect(container.querySelector('header img')).toBeNull();
    expect(container.querySelector('header > div')?.className).toContain('h-[52px]');
    expect(container.querySelector('.header-control-rail')).not.toBeNull();
    expect(container.querySelectorAll('.header-control-cell')).toHaveLength(4);
    expect(
      Array.from(container.querySelectorAll('.header-control-cell'))
        .every(cell => cell.tagName === 'BUTTON'),
    ).toBe(true);
    expect(localFooterLabels()).toEqual(['Guide', 'About', 'Terms', 'Privacy']);
  });

  it('renders Japanese navigation and footer labels', async () => {
    await renderChrome('ja');

    expect(container.querySelector('header')?.getAttribute('aria-label')).toBe('メインナビゲーション');
    expect(container.querySelector('.brand-wordmark')?.textContent).toBe('ミラプリセットメーカー');
    expect(localFooterLabels()).toEqual([
      'ガイド',
      '概要',
      '利用規約',
      'プライバシーポリシー',
    ]);
  });
});
