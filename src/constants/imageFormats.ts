export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/avif',
] as const;

const IMAGE_FORMAT_LABELS: Record<typeof SUPPORTED_IMAGE_MIME_TYPES[number], string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
  'image/gif': 'GIF',
  'image/bmp': 'BMP',
  'image/avif': 'AVIF',
};

export const SUPPORTED_IMAGE_FORMAT_HINT = SUPPORTED_IMAGE_MIME_TYPES
  .map(mimeType => IMAGE_FORMAT_LABELS[mimeType])
  .join(' · ');

export function normalizeImageMimeType(mimeType: string): string {
  return mimeType.toLowerCase() === 'image/jpg' ? 'image/jpeg' : mimeType.toLowerCase();
}

export function isSupportedImageMimeType(mimeType: string): boolean {
  return SUPPORTED_IMAGE_MIME_TYPES.includes(normalizeImageMimeType(mimeType) as typeof SUPPORTED_IMAGE_MIME_TYPES[number]);
}

export function normalizeImageDataUrl(dataUrl: string): string {
  return dataUrl.replace(/^data:image\/jpg(?=;)/i, 'data:image/jpeg');
}
