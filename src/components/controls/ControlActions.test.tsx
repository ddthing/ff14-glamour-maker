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
  it('keeps a full-width image export action when the optional equipment copy action is not used', () => {
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

  it('offers a disabled copy action until there is equipment to share', () => {
    act(() => {
      root.render(
        <ControlActions
          isExporting={false}
          isReadyToSave={false}
          saveLabel="Save Image"
          onExport={vi.fn()}
          hasEquipmentToCopy={false}
          copyEquipmentLabel="Copy equipment list"
          onCopyEquipment={vi.fn().mockResolvedValue(true)}
        />,
      );
    });

    const [copyButton, exportButton] = container.querySelectorAll('button');
    expect(copyButton.textContent).toContain('Copy equipment list');
    expect(copyButton.disabled).toBe(true);
    expect(exportButton.disabled).toBe(false);
  });

  it('copies equipment and announces the result without blocking partial-card export', async () => {
    const onExport = vi.fn();
    const onCopyEquipment = vi.fn().mockResolvedValue(true);

    act(() => {
      root.render(
        <ControlActions
          isExporting={false}
          isReadyToSave={false}
          saveLabel="Save Image"
          onExport={onExport}
          hasEquipmentToCopy
          copyEquipmentLabel="Copy equipment list"
          copyingEquipmentLabel="Copying equipment list…"
          equipmentCopiedLabel="Equipment list copied."
          equipmentCopyFailedLabel="Could not copy the equipment list."
          onCopyEquipment={onCopyEquipment}
        />,
      );
    });

    const [copyButton, exportButton] = container.querySelectorAll('button');
    await act(async () => {
      copyButton.click();
    });

    expect(onCopyEquipment).toHaveBeenCalledOnce();
    expect(container.textContent).toContain('Equipment list copied.');
    expect(exportButton.disabled).toBe(false);

    act(() => exportButton.click());
    expect(onExport).toHaveBeenCalledOnce();
  });
});
