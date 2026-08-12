// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { CropModal } from './CropModal';

vi.mock('react-easy-crop', () => ({
  default: () => <div data-testid="crop-stage" />,
}));

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
  document.body.querySelector('[role="dialog"]')?.remove();
});

describe('CropModal', () => {
  it('portals above the app shell and exposes responsive editor controls', () => {
    act(() => {
      root.render(
        <CropModal
          imageSrc="data:image/png;base64,photo"
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />,
      );
    });

    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.className).toContain('fixed');
    expect(dialog?.querySelector('[data-testid="crop-stage"]')).not.toBeNull();
    expect(dialog?.querySelector('input[type="range"]')).not.toBeNull();
    expect(dialog?.querySelector('button[aria-label]')).not.toBeNull();
    expect(dialog?.querySelectorAll('button')).toHaveLength(3);
  });
});
