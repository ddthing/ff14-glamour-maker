export interface PaletteColor {
  hex: string;
  weight: number;
}

export interface ImagePalette {
  colors: PaletteColor[];
  averageLuminance: number;
  scrimOpacity: number;
  contrastScrimOpacity: number;
  textTone: 'light' | 'dark';
  previewDataUrl: string | null;
  fallback: 'none' | 'low-color' | 'unavailable';
}

const SAMPLE_SIZE = 32;
const DEFAULT_COLORS = ['#3f4348', '#24272b', '#111315'];

// Reference-card calibration: medium-light panels still use white text;
// dark text is reserved for panels that are genuinely close to white.
const DARK_TEXT_LUMINANCE_THRESHOLD = 0.78;
const LIGHT_TEXT_TARGET_LUMINANCE = 0.15;

interface Bucket {
  red: number;
  green: number;
  blue: number;
  weight: number;
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

function channelToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(red: number, green: number, blue: number): number {
  return 0.2126 * channelToLinear(red)
    + 0.7152 * channelToLinear(green)
    + 0.0722 * channelToLinear(blue);
}

function saturation(red: number, green: number, blue: number): number {
  const maximum = Math.max(red, green, blue) / 255;
  const minimum = Math.min(red, green, blue) / 255;
  const lightness = (maximum + minimum) / 2;
  const delta = maximum - minimum;
  return delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
}

function toHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue]
    .map(channel => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

function colorDistance(left: Bucket, right: Bucket): number {
  return Math.hypot(left.red - right.red, left.green - right.green, left.blue - right.blue);
}

function calculateScrimOpacity(averageLuminance: number): number {
  return clamp(0.1 + averageLuminance * 0.1, 0.1, 0.2);
}

function calculateContrastScrimOpacity(averageLuminance: number, scrimOpacity: number, textTone: ImagePalette['textTone']): number {
  if (textTone === 'dark') return 0;

  const luminanceAfterArtisticScrim = averageLuminance * (1 - scrimOpacity);
  if (luminanceAfterArtisticScrim <= LIGHT_TEXT_TARGET_LUMINANCE) return 0;

  return clamp(
    1 - LIGHT_TEXT_TARGET_LUMINANCE / luminanceAfterArtisticScrim,
    0,
    0.88,
  );
}

export function createFallbackPalette(reason: ImagePalette['fallback'] = 'unavailable'): ImagePalette {
  return {
    colors: DEFAULT_COLORS.map((hex, index) => ({ hex, weight: index === 0 ? 0.46 : 0.27 })),
    averageLuminance: 0.035,
    scrimOpacity: 0.12,
    contrastScrimOpacity: 0,
    textTone: 'light',
    previewDataUrl: null,
    fallback: reason,
  };
}

export function extractPaletteFromPixels(
  pixels: Uint8ClampedArray,
  previewDataUrl: string | null = null,
): ImagePalette {
  const buckets = new Map<string, Bucket>();
  let weightedLuminance = 0;
  let totalPixelWeight = 0;

  for (let index = 0; index + 3 < pixels.length; index += 4) {
    const alpha = pixels[index + 3] / 255;
    if (alpha < 0.08) continue;

    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const pixelLuminance = luminance(red, green, blue);
    const pixelSaturation = saturation(red, green, blue);
    let pixelWeight = alpha;

    if (pixelLuminance >= 0.83 && pixelSaturation <= 0.08) pixelWeight *= 0.08;
    if (pixelLuminance <= 0.015 && pixelSaturation <= 0.08) pixelWeight *= 0.16;
    if (pixelWeight < 0.02) continue;

    weightedLuminance += pixelLuminance * alpha;
    totalPixelWeight += alpha;

    const quantized = [red, green, blue].map(channel => Math.round(channel / 32) * 32);
    const key = quantized.join('-');
    const existing = buckets.get(key) ?? { red: 0, green: 0, blue: 0, weight: 0 };
    existing.red += red * pixelWeight;
    existing.green += green * pixelWeight;
    existing.blue += blue * pixelWeight;
    existing.weight += pixelWeight;
    buckets.set(key, existing);
  }

  const ranked = [...buckets.values()]
    .map(bucket => ({
      red: bucket.red / bucket.weight,
      green: bucket.green / bucket.weight,
      blue: bucket.blue / bucket.weight,
      weight: bucket.weight,
    }))
    .sort((left, right) => right.weight - left.weight);

  const selected: Bucket[] = [];
  for (const candidate of ranked) {
    if (selected.every(color => colorDistance(color, candidate) >= 54)) selected.push(candidate);
    if (selected.length === 3) break;
  }

  if (selected.length === 0) return createFallbackPalette('low-color');
  while (selected.length < 3) {
    selected.push(selected.length === 1
      ? { red: 61, green: 65, blue: 70, weight: selected[0].weight * 0.55 }
      : { red: 25, green: 28, blue: 31, weight: selected[0].weight * 0.4 });
  }

  const selectedWeight = selected.reduce((sum, color) => sum + color.weight, 0);
  const averageLuminance = totalPixelWeight > 0 ? weightedLuminance / totalPixelWeight : 0.04;
  const textTone = averageLuminance >= DARK_TEXT_LUMINANCE_THRESHOLD ? 'dark' : 'light';
  const scrimOpacity = calculateScrimOpacity(averageLuminance);

  return {
    colors: selected.map(color => ({
      hex: toHex(color.red, color.green, color.blue),
      weight: color.weight / selectedWeight,
    })),
    averageLuminance,
    scrimOpacity,
    contrastScrimOpacity: calculateContrastScrimOpacity(averageLuminance, scrimOpacity, textTone),
    textTone,
    previewDataUrl,
    fallback: ranked.length < 2 ? 'low-color' : 'none',
  };
}

export async function extractImagePalette(source: string): Promise<ImagePalette> {
  const image = new Image();
  image.decoding = 'async';
  if (/^https?:/i.test(source)) image.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Could not decode image for palette extraction.'));
    image.src = source;
  });

  const canvas = document.createElement('canvas');
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return createFallbackPalette();

  context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  return extractPaletteFromPixels(
    context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data,
    canvas.toDataURL('image/jpeg', 0.72),
  );
}
