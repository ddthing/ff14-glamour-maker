// @vitest-environment jsdom

import { act, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useManagedPhotoUrl } from './useManagedPhotoUrl';

let container: HTMLDivElement;
let root: Root;
let currentUrl: string | null;
let confirmPhoto: (blob: Blob) => void;
let createObjectUrl: ReturnType<typeof vi.fn>;
let revokeObjectUrl: ReturnType<typeof vi.fn>;
const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

function Harness({ initialUrl = null }: { initialUrl?: string | null }) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const confirm = useManagedPhotoUrl(url, setUrl);
  useEffect(() => {
    currentUrl = url;
    confirmPhoto = confirm;
  }, [confirm, url]);
  return null;
}

beforeEach(() => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  createObjectUrl = vi.fn()
    .mockReturnValueOnce('blob:cropped-1')
    .mockReturnValueOnce('blob:cropped-2');
  revokeObjectUrl = vi.fn();
  vi.stubGlobal('URL', {
    createObjectURL: createObjectUrl,
    revokeObjectURL: revokeObjectUrl,
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

describe('useManagedPhotoUrl', () => {
  it('revokes replaced and unmounted URLs that it owns', () => {
    act(() => root.render(<Harness />));
    act(() => confirmPhoto(new Blob(['first'])));
    expect(currentUrl).toBe('blob:cropped-1');
    expect(revokeObjectUrl).not.toHaveBeenCalled();

    act(() => confirmPhoto(new Blob(['second'])));
    expect(currentUrl).toBe('blob:cropped-2');
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:cropped-1');

    act(() => root.unmount());
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:cropped-2');
  });

  it('never revokes an external initial URL', () => {
    act(() => root.render(<Harness initialUrl="https://example.com/photo.png" />));
    act(() => root.unmount());

    expect(revokeObjectUrl).not.toHaveBeenCalled();
  });
});
