// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { StudioPreviewToolbar } from './StudioPreviewToolbar';

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  await i18n.changeLanguage('ko');
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('StudioPreviewToolbar', () => {
  it('shows truthful draft status and semantically disabled history actions', () => {
    act(() => {
      root.render(
        <StudioPreviewToolbar
          draftStatus="saved"
          canUndo={false}
          canRedo={false}
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          retrySave={vi.fn()}
        />,
      );
    });

    expect(container.querySelector('[data-status="saved"]')?.textContent).toContain('이 브라우저에 저장됨');
    expect(container.querySelector<HTMLButtonElement>('[aria-label="실행 취소"]')?.disabled).toBe(true);
    expect(container.querySelector<HTMLButtonElement>('[aria-label="다시 실행"]')?.disabled).toBe(true);
    expect(container.textContent).toContain('1080 × 900');
    expect(container.textContent).toContain('3240 × 2700');
  });

  it('offers a retry action when local draft storage is unavailable', () => {
    const retrySave = vi.fn();
    act(() => {
      root.render(
        <StudioPreviewToolbar
          draftStatus="unavailable"
          canUndo
          canRedo
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          retrySave={retrySave}
        />,
      );
    });

    const retryButton = container.querySelector<HTMLButtonElement>('.studio-draft-retry');
    expect(retryButton?.textContent).toBe('다시 저장');
    act(() => retryButton?.click());
    expect(retrySave).toHaveBeenCalledOnce();
  });
});
