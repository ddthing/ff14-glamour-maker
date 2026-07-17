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
    expect(localFooterLabels()).toEqual(['Guide', 'FAQ', 'About', 'Terms', 'Privacy']);
  });

  it('renders Japanese navigation and footer labels', async () => {
    await renderChrome('ja');

    expect(container.querySelector('header')?.getAttribute('aria-label')).toBe('メインナビゲーション');
    expect(localFooterLabels()).toEqual([
      'ガイド',
      'よくある質問',
      '概要',
      '利用規約',
      'プライバシーポリシー',
    ]);
  });
});
