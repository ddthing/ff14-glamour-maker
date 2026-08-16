// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { COMMON_GLAMOUR_HASHTAGS } from '../../constants/hashtags';
import { HashtagTools } from './HashtagTools';

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
  vi.restoreAllMocks();
});

describe('HashtagTools', () => {
  it('uses broad glamour-photo tags instead of campaign or buddy-specific tags', () => {
    expect(COMMON_GLAMOUR_HASHTAGS).not.toContain('모험가_오오티디');
    expect(COMMON_GLAMOUR_HASHTAGS).not.toContain('버디룩템');
    expect(COMMON_GLAMOUR_HASHTAGS).toContain('FFXIVGpose');
    expect(COMMON_GLAMOUR_HASHTAGS).toContain('EorzeaPhotos');
  });

  it('copies only the clicked hashtag', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    act(() => root.render(<HashtagTools />));

    await act(async () => {
      const copyButton = Array.from(container.querySelectorAll<HTMLButtonElement>('.hashtag-copy-button'))
        .find(button => button.getAttribute('aria-label')?.includes('#ミラプリレシピ'));
      copyButton?.click();
    });

    expect(writeText).toHaveBeenCalledWith('#ミラプリレシピ');
    expect(container.textContent).toContain('Copied');
  });

  it('copies selected hashtags together in the displayed order', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    act(() => root.render(<HashtagTools />));

    await act(async () => {
      const selectButtons = Array.from(container.querySelectorAll<HTMLButtonElement>('.hashtag-select-button'));
      selectButtons.find(button => button.textContent?.includes('#FF14'))?.click();
      selectButtons.find(button => button.textContent?.includes('#파판룩템'))?.click();
    });

    const copySelectedButton = container.querySelector<HTMLButtonElement>('.hashtag-copy-selected-button');
    expect(copySelectedButton?.disabled).toBe(false);

    await act(async () => {
      copySelectedButton?.click();
    });

    expect(writeText).toHaveBeenCalledWith('#FF14 #파판룩템');
    expect(container.textContent).toContain('Selected hashtags copied');
  });

  it('shows an error when clipboard access is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    act(() => root.render(<HashtagTools />));

    await act(async () => {
      container.querySelector<HTMLButtonElement>('.hashtag-copy-button')?.click();
    });

    expect(container.textContent).toContain('Could not copy');
  });
});
