// @vitest-environment jsdom

import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useExport, type UseExportReturn } from './useExport';

const mocks = vi.hoisted(() => ({
  exportCanvasElement: vi.fn(),
}));

vi.mock('../features/export/exportCanvas', () => ({
  exportCanvasElement: mocks.exportCanvasElement,
}));

let container: HTMLDivElement;
let canvas: HTMLDivElement;
let root: Root;
let current: UseExportReturn;
const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

function Harness() {
  const hook = useExport();
  useEffect(() => { current = hook; }, [hook]);
  return null;
}

beforeEach(() => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  container = document.createElement('div');
  canvas = document.createElement('div');
  canvas.id = 'glamour-canvas';
  document.body.append(canvas, container);
  root = createRoot(container);
  act(() => root.render(<Harness />));
});

afterEach(() => {
  act(() => root.unmount());
  canvas.remove();
  container.remove();
  vi.restoreAllMocks();
  vi.resetModules();
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

describe('useExport', () => {
  it('ignores duplicate calls while an export is in flight', async () => {
    let resolveExport: ((dataUrl: string) => void) | undefined;
    const pendingExport = new Promise<string>(resolve => {
      resolveExport = resolve;
    });
    mocks.exportCanvasElement.mockReturnValue(pendingExport);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    let first: Promise<void> = Promise.resolve();
    let second: Promise<void> = Promise.resolve();

    act(() => {
      first = current.handleExport('Set');
      second = current.handleExport('Set');
    });
    await act(async () => { await Promise.resolve(); });

    expect(mocks.exportCanvasElement).toHaveBeenCalledOnce();
    expect(current.isExporting).toBe(true);
    resolveExport?.('data:image/png;base64,result');
    await act(async () => { await Promise.all([first, second]); });

    expect(current.isExporting).toBe(false);
    expect(click).toHaveBeenCalledOnce();
  });

  it('surfaces exporter errors so the existing retry action can recover', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.exportCanvasElement
      .mockRejectedValueOnce(new Error('Image preparation timed out. Please retry the export.'))
      .mockResolvedValueOnce('data:image/png;base64,result');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    await act(async () => { await current.handleExport('Set'); });
    expect(current.error).toContain('Image preparation timed out');
    expect(current.isExporting).toBe(false);

    await act(async () => { await current.handleExport('Set'); });
    expect(mocks.exportCanvasElement).toHaveBeenCalledTimes(2);
    expect(current.error).toBeNull();
    expect(current.isExporting).toBe(false);
    expect(consoleError).toHaveBeenCalledOnce();
  });
});
