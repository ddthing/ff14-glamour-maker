// @vitest-environment jsdom

import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_IMAGE_FILE_BYTES } from '../features/image/imageFile';
import { useImageUpload } from './useImageUpload';

type UploadState = ReturnType<typeof useImageUpload>;
let container: HTMLDivElement;
let root: Root;
let current: UploadState;
let createObjectUrl: ReturnType<typeof vi.fn>;
let revokeObjectUrl: ReturnType<typeof vi.fn>;
const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

function fileWith(type: string, size = 10): File {
  return { type, size } as File;
}

function Harness() {
  const upload = useImageUpload();
  useEffect(() => {
    current = upload;
  }, [upload]);
  return null;
}

beforeEach(() => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  createObjectUrl = vi.fn()
    .mockReturnValueOnce('blob:pending-1')
    .mockReturnValueOnce('blob:pending-2');
  revokeObjectUrl = vi.fn();
  vi.stubGlobal('URL', {
    createObjectURL: createObjectUrl,
    revokeObjectURL: revokeObjectUrl,
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<Harness />));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

describe('useImageUpload', () => {
  it('creates one pending URL and revokes it when replaced', () => {
    act(() => current.loadFile(fileWith('image/png')));
    expect(current.pendingImage).toBe('blob:pending-1');

    act(() => current.loadFile(fileWith('image/jpeg')));

    expect(current.pendingImage).toBe('blob:pending-2');
    expect(createObjectUrl).toHaveBeenCalledTimes(2);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:pending-1');
  });

  it('rejects invalid files without creating an object URL', () => {
    act(() => current.loadFile(fileWith('image/gif')));
    expect(current.error).toBe('unsupported-type');

    act(() => current.loadFile(fileWith('image/png', MAX_IMAGE_FILE_BYTES + 1)));
    expect(current.error).toBe('file-too-large');
    expect(createObjectUrl).not.toHaveBeenCalled();
  });

  it('revokes the pending URL on cancellation and unmount', () => {
    act(() => current.loadFile(fileWith('image/webp')));
    act(() => current.clearPendingImage());

    expect(current.pendingImage).toBeNull();
    expect(revokeObjectUrl).toHaveBeenCalledTimes(1);

    act(() => current.loadFile(fileWith('image/avif')));
    act(() => root.unmount());
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:pending-2');
  });
});
