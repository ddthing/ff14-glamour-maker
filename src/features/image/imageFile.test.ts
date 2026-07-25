import { describe, expect, it } from 'vitest';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_FILE_BYTES,
  validateImageFile,
} from './imageFile';

function fileWith(type: string, size: number): File {
  return { type, size } as File;
}

describe('validateImageFile', () => {
  it.each(ACCEPTED_IMAGE_TYPES)('accepts %s within the size limit', type => {
    expect(validateImageFile(fileWith(type, MAX_IMAGE_FILE_BYTES))).toBeNull();
  });

  it('rejects unsupported image types before checking size', () => {
    expect(validateImageFile(fileWith('image/gif', 10))).toBe('unsupported-type');
  });

  it('rejects files larger than 25 MiB', () => {
    expect(validateImageFile(
      fileWith('image/png', MAX_IMAGE_FILE_BYTES + 1),
    )).toBe('file-too-large');
  });
});
