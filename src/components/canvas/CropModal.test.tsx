// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { CropModal } from './CropModal';

const mocks = vi.hoisted(() => ({
  cropImage: vi.fn(),
}));

vi.mock('../../utils/cropImage', () => ({
  default: mocks.cropImage,
}));

vi.mock('react-easy-crop', () => ({
  default: ({ onCropComplete }: {
    onCropComplete: (
      area: unknown,
      pixels: { x: number; y: number; width: number; height: number },
    ) => void;
  }) => (
    <button
      type="button"
      data-testid="complete-crop"
      onClick={() => onCropComplete({}, { x: 10, y: 20, width: 480, height: 900 })}
    >
      Complete crop
    </button>
  ),
}));

let container: HTMLDivElement;
let root: Root;
let onCancel: ReturnType<typeof vi.fn<() => void>>;
let onConfirm: ReturnType<typeof vi.fn<(croppedImage: Blob) => void>>;
const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

function buttonWithText(text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll('button'))
    .find(candidate => candidate.textContent?.includes(text));
  if (!(button instanceof HTMLButtonElement)) throw new Error(`Missing button: ${text}`);
  return button;
}

beforeEach(async () => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  await i18n.changeLanguage('en');
  vi.clearAllMocks();
  onCancel = vi.fn<() => void>();
  onConfirm = vi.fn<(croppedImage: Blob) => void>();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(
    <CropModal
      imageSrc="blob:pending"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />,
  ));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

describe('CropModal', () => {
  it('requires a crop rectangle and blocks duplicate confirmation', async () => {
    const applyButton = buttonWithText('Apply Portrait');
    expect(applyButton.disabled).toBe(true);

    act(() => container.querySelector<HTMLButtonElement>('[data-testid="complete-crop"]')?.click());
    let resolveCrop: ((blob: Blob) => void) | undefined;
    mocks.cropImage.mockReturnValue(new Promise<Blob>(resolve => {
      resolveCrop = resolve;
    }));

    act(() => {
      applyButton.click();
      applyButton.click();
    });

    expect(mocks.cropImage).toHaveBeenCalledTimes(1);
    expect(applyButton.disabled).toBe(true);

    const croppedBlob = new Blob(['crop'], { type: 'image/png' });
    await act(async () => {
      resolveCrop?.(croppedBlob);
      await Promise.resolve();
    });
    expect(onConfirm).toHaveBeenCalledWith(croppedBlob);
  });

  it('cancels an active request and ignores its late result', async () => {
    act(() => container.querySelector<HTMLButtonElement>('[data-testid="complete-crop"]')?.click());
    let resolveCrop: ((blob: Blob) => void) | undefined;
    mocks.cropImage.mockReturnValue(new Promise<Blob>(resolve => {
      resolveCrop = resolve;
    }));

    act(() => buttonWithText('Apply Portrait').click());
    act(() => buttonWithText('Discard').click());
    const croppedBlob = new Blob(['late'], { type: 'image/png' });
    await act(async () => {
      resolveCrop?.(croppedBlob);
      await Promise.resolve();
    });

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('keeps the modal open and exposes a retryable error', async () => {
    act(() => container.querySelector<HTMLButtonElement>('[data-testid="complete-crop"]')?.click());
    mocks.cropImage.mockRejectedValue(new Error('crop failed'));

    await act(async () => {
      buttonWithText('Apply Portrait').click();
      await Promise.resolve();
    });

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'Could not crop the image',
    );
    expect(buttonWithText('Apply Portrait').disabled).toBe(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
