// @vitest-environment jsdom

import { act, createElement, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeImageDataUrl, SUPPORTED_IMAGE_MIME_TYPES } from '../constants/imageFormats';
import { isSupportedImageFile, MAX_IMAGE_FILE_BYTES, useImageUpload, type UseImageUploadReturn } from './useImageUpload';

function fileWith(type: string, size = 1): File {
  const file = new File(['x'], 'upload', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('isSupportedImageFile', () => {
  it('accepts image files within the memory limit', () => {
    expect(isSupportedImageFile(fileWith('image/png'))).toBe(true);
    expect(isSupportedImageFile(fileWith('image/jpeg', MAX_IMAGE_FILE_BYTES))).toBe(true);
    expect(SUPPORTED_IMAGE_MIME_TYPES.every(type => isSupportedImageFile(fileWith(type)))).toBe(true);
    expect(isSupportedImageFile(fileWith('image/jpg'))).toBe(true);
  });

  it('rejects non-images and oversized files', () => {
    expect(isSupportedImageFile(fileWith('text/plain'))).toBe(false);
    expect(isSupportedImageFile(fileWith('image/svg+xml'))).toBe(false);
    expect(isSupportedImageFile(fileWith('image/heic'))).toBe(false);
    expect(isSupportedImageFile(fileWith('image/png', MAX_IMAGE_FILE_BYTES + 1))).toBe(false);
  });

  it('normalizes the nonstandard image/jpg data URL alias', () => {
    expect(normalizeImageDataUrl('data:image/jpg;base64,photo')).toBe('data:image/jpeg;base64,photo');
  });
});

let container: HTMLDivElement;
let root: Root;
let upload: UseImageUploadReturn;
let readers: FileReader[];

function Harness() {
  const state = useImageUpload();
  useEffect(() => {
    upload = state;
  }, [state]);
  return createElement('div', null,
    createElement('output', null, state.pendingImage),
    createElement('p', null, state.error),
  );
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  readers = [];
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(createElement(Harness)));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
});

describe('useImageUpload', () => {
  it('reports invalid and oversized files instead of silently ignoring them', () => {
    act(() => upload.loadFile(fileWith('text/plain')));
    expect(container.querySelector('p')?.textContent).toBe('invalidType');

    act(() => upload.loadFile(fileWith('image/png', MAX_IMAGE_FILE_BYTES + 1)));
    expect(container.querySelector('p')?.textContent).toBe('tooLarge');
  });

  it.each(['image/svg+xml', 'image/heic'])('reports unsupported raster format %s', type => {
    act(() => upload.loadFile(fileWith(type)));
    expect(container.querySelector('p')?.textContent).toBe('invalidType');
    expect(readers).toHaveLength(0);
  });

  it('keeps only the most recently selected file when reads finish out of order', () => {
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (this: FileReader) {
      readers.push(this);
    });

    act(() => {
      upload.loadFile(fileWith('image/png'));
      upload.loadFile(fileWith('image/jpeg'));
    });
    expect(readers).toHaveLength(2);

    Object.defineProperty(readers[0], 'result', { configurable: true, value: 'data:image/png;base64,old' });
    Object.defineProperty(readers[1], 'result', { configurable: true, value: 'data:image/jpeg;base64,new' });
    act(() => readers[0].onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>));
    expect(container.querySelector('output')?.textContent).toBe('');
    act(() => readers[1].onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>));
    expect(container.querySelector('output')?.textContent).toBe('data:image/jpeg;base64,new');
  });

  it('reports read failures and aborts an active read when unmounted', () => {
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (this: FileReader) {
      readers.push(this);
    });
    const abort = vi.spyOn(FileReader.prototype, 'abort').mockImplementation(() => undefined);

    act(() => upload.loadFile(fileWith('image/png')));
    act(() => readers[0].onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>));
    expect(container.querySelector('p')?.textContent).toBe('readFailed');

    act(() => upload.loadFile(fileWith('image/png')));
    act(() => root.unmount());
    expect(abort).toHaveBeenCalled();
    root = createRoot(container);
  });
});
