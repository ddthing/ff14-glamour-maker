// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { HomeValueSection } from './HomeValueSection';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  act(() => root.unmount());
  container.remove();
  await i18n.changeLanguage('ko');
});

describe('home value content', () => {
  it('explains the actual workflow and links to supporting pages', async () => {
    await act(async () => {
      await i18n.changeLanguage('ko');
      root.render(<HomeValueSection />);
    });

    expect(container.querySelector('h2')?.textContent).toContain('스크린샷과 장비 정보를 함께');
    expect(container.querySelectorAll('li.home-feature-card')).toHaveLength(3);
    expect(container.querySelector('a[href="/guide"]')?.textContent).toBe('가이드');
    expect(container.querySelector('a[href="/faq"]')?.textContent).toBe('자주 묻는 질문');
    expect(container.textContent).toContain('해시태그 도구는 카드 이미지에 태그를 그리지 않고');
  });

  it('keeps the value content localized', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
      root.render(<HomeValueSection />);
    });

    expect(container.querySelector('h2')?.textContent).toContain('Keep the screenshot');
    expect(container.querySelector('a[href="/guide"]')?.textContent).toBe('Guide');
  });
});
