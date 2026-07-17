// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ControlActions } from './ControlActions';

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

describe('ControlActions', () => {
  it('renders one full-width image export action without link sharing', () => {
    act(() => {
      root.render(
        <ControlActions
          isExporting={false}
          isReadyToSave
          saveLabel="Save Image"
          onExport={vi.fn()}
        />,
      );
    });

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent).toContain('Save Image');
    expect(container.textContent).not.toContain('Copy');
  });
});
