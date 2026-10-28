// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { SUPPORTED_IMAGE_MIME_TYPES } from '../../constants/imageFormats';
import { INITIAL_STATE } from '../../constants/initialState';
import { PreviewCanvas } from './PreviewCanvas';

vi.mock('./CropModal', () => ({
  CropModal: ({ imageSrc }: { imageSrc: string }) => <div role="dialog">Cropping {imageSrc}</div>,
}));

let container: HTMLDivElement;
let root: Root;
let readers: FileReader[];
let resizeCallback: ResizeObserverCallback | null;

function pasteImage(target: EventTarget, file: File): ClipboardEvent {
  const event = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
  Object.defineProperty(event, 'clipboardData', {
    value: {
      items: [{ kind: 'file', type: file.type, getAsFile: () => file }],
      files: [file],
    },
  });
  act(() => target.dispatchEvent(event));
  return event;
}

beforeEach(async () => {
  await i18n.changeLanguage('en');
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: ResizeObserverCallback) {
      resizeCallback = callback;
    }
    observe() {}
    disconnect() {}
  });
  resizeCallback = null;
  readers = [];
  vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (this: FileReader) {
    readers.push(this);
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
});

describe('PreviewCanvas photo flow', () => {
  it('accepts a pasted image and ignores paste while the crop dialog is present', async () => {
    act(() => root.render(<PreviewCanvas state={INITIAL_STATE} onPhotoConfirm={vi.fn()} />));
    const file = new File(['photo'], 'photo.png', { type: 'image/png' });
    const event = pasteImage(document.body, file);
    expect(event.defaultPrevented).toBe(true);
    expect(readers).toHaveLength(1);

    Object.defineProperty(readers[0], 'result', { configurable: true, value: 'data:image/png;base64,photo' });
    await act(async () => {
      readers[0].onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>);
      await Promise.resolve();
    });
    expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain('data:image/png;base64,photo');

    const secondEvent = pasteImage(document.body, file);
    expect(secondEvent.defaultPrevented).toBe(false);
    expect(readers).toHaveLength(1);
  });

  it('ignores paste in editable fields and keeps photo replacement visible and outside export', () => {
    const state = { ...INITIAL_STATE, imageSrc: 'data:image/png;base64,photo', croppedImageSrc: 'data:image/png;base64,cropped' };
    act(() => root.render(<PreviewCanvas state={state} onPhotoConfirm={vi.fn()} />));
    const textField = document.createElement('input');
    textField.type = 'text';
    container.appendChild(textField);
    const file = new File(['photo'], 'photo.png', { type: 'image/png' });

    const event = pasteImage(textField, file);
    expect(event.defaultPrevented).toBe(false);
    expect(readers).toHaveLength(0);

    const changeButton = container.querySelector<HTMLButtonElement>('#glamour-canvas button');
    expect(changeButton?.getAttribute('aria-label')).toBeTruthy();
    expect(changeButton?.getAttribute('aria-label')).toBeTruthy();
    expect(container.querySelector('[data-export-exclude="true"]')?.textContent).toBeTruthy();
    const fileInput = container.querySelector<HTMLInputElement>('#character-photo-upload');
    expect(fileInput).not.toBeNull();
    expect(fileInput?.accept.split(',')).toEqual([...SUPPORTED_IMAGE_MIME_TYPES, 'image/jpg']);
  });

  it('keeps the upload and replacement cues readable when the preview is scaled for mobile', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    const state = { ...INITIAL_STATE, croppedImageSrc: 'data:image/png;base64,cropped' };
    act(() => root.render(<PreviewCanvas state={state} onPhotoConfirm={vi.fn()} />));
    const zone = container.querySelector<HTMLElement>('.canvas-scale-zone');
    vi.spyOn(zone!, 'getBoundingClientRect').mockReturnValue({ width: 390, height: 500 } as DOMRect);
    act(() => resizeCallback?.([], {} as ResizeObserver));

    const cue = container.querySelector<HTMLElement>('[data-export-exclude="true"]');
    expect(cue?.style.height).toBe('32px');
    expect(cue?.style.fontSize).toBe('11px');
    expect(Number.parseFloat(cue?.style.width ?? '0')).toBeGreaterThan(0);

    act(() => root.render(<PreviewCanvas state={INITIAL_STATE} onPhotoConfirm={vi.fn()} />));
    const uploadCue = container.querySelector<HTMLElement>('[data-export-exclude="true"]');
    expect(uploadCue?.textContent).toBe('Character photo');
    expect(uploadCue?.style.height).toBe('32px');
    expect(uploadCue?.style.fontSize).toBe('11px');
  });

  it('announces oversized pasted photos in a localized status outside the exported canvas', () => {
    act(() => root.render(<PreviewCanvas state={INITIAL_STATE} onPhotoConfirm={vi.fn()} />));
    const file = new File(['photo'], 'large.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 20 * 1024 * 1024 + 1 });
    pasteImage(document.body, file);

    const status = container.querySelector('[role="status"]');
    expect(status?.textContent).toBeTruthy();
    expect(status?.textContent).not.toContain('photo_too_large');
    expect(container.querySelector('#glamour-canvas [role="status"]')).toBeNull();
  });

  it('announces an unsupported file selected through the keyboard-accessible input', () => {
    act(() => root.render(<PreviewCanvas state={INITIAL_STATE} onPhotoConfirm={vi.fn()} />));
    const input = container.querySelector<HTMLInputElement>('#character-photo-upload');
    const file = new File(['text'], 'notes.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    act(() => input?.dispatchEvent(new Event('change', { bubbles: true })));

    expect(container.querySelector('[role="status"]')?.textContent).toBe('Unsupported image format. Choose a supported image file.');
  });
});
