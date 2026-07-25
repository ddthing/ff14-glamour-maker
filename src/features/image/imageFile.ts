export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const ACCEPTED_IMAGE_INPUT = ACCEPTED_IMAGE_TYPES.join(',');
export const MAX_IMAGE_FILE_BYTES = 25 * 1024 * 1024;

export type ImageFileError = 'unsupported-type' | 'file-too-large';

const acceptedImageTypes = new Set<string>(ACCEPTED_IMAGE_TYPES);

export function validateImageFile(file: Pick<File, 'type' | 'size'>): ImageFileError | null {
  if (!acceptedImageTypes.has(file.type)) return 'unsupported-type';
  if (file.size > MAX_IMAGE_FILE_BYTES) return 'file-too-large';
  return null;
}
