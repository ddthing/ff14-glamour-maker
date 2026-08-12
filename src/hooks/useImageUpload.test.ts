import { describe, expect, it } from 'vitest';
import { isSupportedImageFile, MAX_IMAGE_FILE_BYTES } from './useImageUpload';

function fileWith(type: string, size = 1): File {
  const file = new File(['x'], 'upload', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('isSupportedImageFile', () => {
  it('accepts image files within the memory limit', () => {
    expect(isSupportedImageFile(fileWith('image/png'))).toBe(true);
    expect(isSupportedImageFile(fileWith('image/jpeg', MAX_IMAGE_FILE_BYTES))).toBe(true);
  });

  it('rejects non-images and oversized files', () => {
    expect(isSupportedImageFile(fileWith('text/plain'))).toBe(false);
    expect(isSupportedImageFile(fileWith('image/png', MAX_IMAGE_FILE_BYTES + 1))).toBe(false);
  });
});
