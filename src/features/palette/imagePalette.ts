export interface PaletteColor {
  hex: string;
  weight: number;
}

export type ImageBackgroundMode = 'light-neutral' | 'soft-color' | 'dark' | 'unknown';

export interface ImageBackgroundProfile {
  mode: ImageBackgroundMode;
  hex: string;
  coverage: number;
  edgeConfidence: number;
  luminance: number;
  saturation: number;
  tintOpacity: number;
  previewOpacity: number;
}

export interface ImagePalette {
  colors: PaletteColor[];
  background: ImageBackgroundProfile;
  averageLuminance: number;
  scrimOpacity: number;
  contrastScrimOpacity: number;
  textTone: 'light' | 'dark';
  previewDataUrl: string | null;
  fallback: 'none' | 'low-color' | 'unavailable';
}

const SAMPLE_SIZE = 32;
const DEFAULT_COLORS = ['#3f4348', '#24272b', '#111315'];
const BACKGROUND_QUANTIZATION = 16;
const BACKGROUND_DISTANCE_THRESHOLD = 48;
const MIN_BACKGROUND_COVERAGE = 0.55;
const MIN_EDGE_CONFIDENCE = 0.55;
const LIGHT_BACKGROUND_LUMINANCE = 0.82;
const LIGHT_BACKGROUND_SATURATION = 0.08;
const DARK_BACKGROUND_LUMINANCE = 0.26;

// Reference-card calibration: medium-light panels still use white text;
// dark text is reserved for panels that are genuinely close to white.
const DARK_TEXT_LUMINANCE_THRESHOLD = 0.78;
const LIGHT_TEXT_TARGET_LUMINANCE = 0.18;

interface RGBColor {
  red: number;
  green: number;
  blue: number;
}

interface Pixel extends RGBColor {
  alpha: number;
}

interface Bucket extends RGBColor {
  weight: number;
}

interface PixelDimensions {
  width: number;
  height: number;
}

interface BackgroundAnalysis {
  color: RGBColor;
  profile: ImageBackgroundProfile;
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
  const delta = maximum - minimum;
  return maximum === 0 ? 0 : delta / maximum;
}

function toHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue]
    .map(channel => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

function colorDistance(left: RGBColor, right: RGBColor): number {
  return Math.hypot(left.red - right.red, left.green - right.green, left.blue - right.blue);
}

function resolvePixelDimensions(pixels: Uint8ClampedArray, requested: PixelDimensions): PixelDimensions {
  const pixelCount = Math.floor(pixels.length / 4);
  const width = Math.floor(requested.width);
  const height = Math.floor(requested.height);

  if (pixelCount > 0 && width > 0 && height > 0 && width * height <= pixelCount) {
    return { width, height };
  }

  const inferredWidth = Math.max(1, Math.floor(Math.sqrt(pixelCount)));
  return {
    width: inferredWidth,
    height: Math.max(1, Math.ceil(pixelCount / inferredWidth)),
  };
}

function readPixel(
  pixels: Uint8ClampedArray,
  x: number,
  y: number,
  dimensions: PixelDimensions,
): Pixel | null {
  const index = (y * dimensions.width + x) * 4;
  if (index < 0 || index + 3 >= pixels.length) return null;

  return {
    red: pixels[index],
    green: pixels[index + 1],
    blue: pixels[index + 2],
    alpha: pixels[index + 3] / 255,
  };
}

function collectEdgePixels(pixels: Uint8ClampedArray, dimensions: PixelDimensions): Pixel[] {
  const edgeThickness = Math.max(1, Math.round(Math.min(dimensions.width, dimensions.height) * 0.06));
  const edgePixels: Pixel[] = [];

  for (let y = 0; y < dimensions.height; y += 1) {
    for (let x = 0; x < dimensions.width; x += 1) {
      const isEdge = x < edgeThickness
        || y < edgeThickness
        || x >= dimensions.width - edgeThickness
        || y >= dimensions.height - edgeThickness;
      if (!isEdge) continue;

      const pixel = readPixel(pixels, x, y, dimensions);
      if (pixel && pixel.alpha >= 0.08) edgePixels.push(pixel);
    }
  }

  return edgePixels;
}

function createBackgroundProfile(
  mode: ImageBackgroundMode,
  color: RGBColor,
  coverage: number,
  edgeConfidence: number,
): ImageBackgroundProfile {
  const backgroundLuminance = luminance(color.red, color.green, color.blue);
  const backgroundSaturation = saturation(color.red, color.green, color.blue);
  const visualSettings: Record<ImageBackgroundMode, { tintOpacity: number; previewOpacity: number }> = {
    'light-neutral': { tintOpacity: 0.16, previewOpacity: 0.15 },
    'soft-color': { tintOpacity: 0.12, previewOpacity: 0.1 },
    dark: { tintOpacity: 0.16, previewOpacity: 0.12 },
    unknown: { tintOpacity: 0.08, previewOpacity: 0.08 },
  };

  return {
    mode,
    hex: toHex(color.red, color.green, color.blue),
    coverage,
    edgeConfidence,
    luminance: backgroundLuminance,
    saturation: backgroundSaturation,
    ...visualSettings[mode],
  };
}

function analyzeBackground(
  pixels: Uint8ClampedArray,
  dimensions: PixelDimensions,
): BackgroundAnalysis {
  const edgePixels = collectEdgePixels(pixels, dimensions);
  if (edgePixels.length === 0) {
    const fallbackColor = { red: 23, green: 25, blue: 28 };
    return {
      color: fallbackColor,
      profile: createBackgroundProfile('unknown', fallbackColor, 0, 0),
    };
  }

  const edgeBuckets = new Map<string, Bucket>();
  for (const pixel of edgePixels) {
    const quantized = [pixel.red, pixel.green, pixel.blue]
      .map(channel => Math.round(channel / BACKGROUND_QUANTIZATION) * BACKGROUND_QUANTIZATION);
    const key = quantized.join('-');
    const existing = edgeBuckets.get(key) ?? { red: 0, green: 0, blue: 0, weight: 0 };
    existing.red += pixel.red * pixel.alpha;
    existing.green += pixel.green * pixel.alpha;
    existing.blue += pixel.blue * pixel.alpha;
    existing.weight += pixel.alpha;
    edgeBuckets.set(key, existing);
  }

  const dominantEdgeBucket = [...edgeBuckets.values()]
    .sort((left, right) => right.weight - left.weight)[0];
  const candidate = {
    red: dominantEdgeBucket.red / dominantEdgeBucket.weight,
    green: dominantEdgeBucket.green / dominantEdgeBucket.weight,
    blue: dominantEdgeBucket.blue / dominantEdgeBucket.weight,
  };
  const edgeWeight = edgePixels.reduce((sum, pixel) => sum + pixel.alpha, 0);
  const edgeConfidence = dominantEdgeBucket.weight / edgeWeight;

  let totalAlpha = 0;
  let matchingAlpha = 0;
  for (let index = 0; index + 3 < pixels.length; index += 4) {
    const alpha = pixels[index + 3] / 255;
    if (alpha < 0.08) continue;

    totalAlpha += alpha;
    if (colorDistance(candidate, {
      red: pixels[index],
      green: pixels[index + 1],
      blue: pixels[index + 2],
    }) <= BACKGROUND_DISTANCE_THRESHOLD) {
      matchingAlpha += alpha;
    }
  }

  const coverage = totalAlpha > 0 ? matchingAlpha / totalAlpha : 0;
  const backgroundLuminance = luminance(candidate.red, candidate.green, candidate.blue);
  const backgroundSaturation = saturation(candidate.red, candidate.green, candidate.blue);
  const reliable = coverage >= MIN_BACKGROUND_COVERAGE && edgeConfidence >= MIN_EDGE_CONFIDENCE;
  const mode: ImageBackgroundMode = !reliable
    ? 'unknown'
    : backgroundLuminance >= LIGHT_BACKGROUND_LUMINANCE
      && backgroundSaturation <= LIGHT_BACKGROUND_SATURATION
      ? 'light-neutral'
      : backgroundLuminance <= DARK_BACKGROUND_LUMINANCE
        ? 'dark'
        : 'soft-color';

  return {
    color: candidate,
    profile: createBackgroundProfile(mode, candidate, coverage, edgeConfidence),
  };
}

function resolveTextTone(background: ImageBackgroundProfile, averageLuminance: number): ImagePalette['textTone'] {
  if (background.mode === 'light-neutral') return 'dark';
  if (background.mode === 'dark') return 'light';
  if (background.mode === 'soft-color') return background.luminance >= 0.62 ? 'dark' : 'light';
  return averageLuminance >= DARK_TEXT_LUMINANCE_THRESHOLD ? 'dark' : 'light';
}

function calculateScrimOpacity(
  mode: ImageBackgroundMode,
  averageLuminance: number,
  textTone: ImagePalette['textTone'],
): number {
  if (mode === 'light-neutral') return 0;
  if (mode === 'dark') return 0.08;
  if (mode === 'soft-color') return textTone === 'dark' ? 0.02 : 0.1;
  return clamp(0.1 + averageLuminance * 0.1, 0.1, 0.2);
}

function calculateContrastScrimOpacity(
  averageLuminance: number,
  scrimOpacity: number,
  textTone: ImagePalette['textTone'],
  mode: ImageBackgroundMode,
): number {
  if (textTone === 'dark' || mode === 'light-neutral' || mode === 'dark') return 0;

  const luminanceAfterArtisticScrim = averageLuminance * (1 - scrimOpacity);
  if (luminanceAfterArtisticScrim <= LIGHT_TEXT_TARGET_LUMINANCE) return 0;

  return clamp((luminanceAfterArtisticScrim - LIGHT_TEXT_TARGET_LUMINANCE) * 0.65, 0, 0.22);
}

function createFallbackBackground(): ImageBackgroundProfile {
  return createBackgroundProfile('dark', { red: 23, green: 25, blue: 28 }, 0, 0);
}

export function createFallbackPalette(
  reason: ImagePalette['fallback'] = 'unavailable',
  detectedBackground?: ImageBackgroundProfile,
): ImagePalette {
  const background = detectedBackground ?? createFallbackBackground();
  const averageLuminance = detectedBackground?.luminance ?? 0.035;
  const textTone = detectedBackground
    ? resolveTextTone(background, averageLuminance)
    : 'light';

  return {
    colors: DEFAULT_COLORS.map((hex, index) => ({ hex, weight: index === 0 ? 0.46 : 0.27 })),
    background,
    averageLuminance,
    scrimOpacity: detectedBackground
      ? calculateScrimOpacity(background.mode, averageLuminance, textTone)
      : 0.12,
    contrastScrimOpacity: 0,
    textTone,
    previewDataUrl: null,
    fallback: reason,
  };
}

export function extractPaletteFromPixels(
  pixels: Uint8ClampedArray,
  previewDataUrl: string | null = null,
  requestedDimensions: PixelDimensions = { width: SAMPLE_SIZE, height: SAMPLE_SIZE },
): ImagePalette {
  const dimensions = resolvePixelDimensions(pixels, requestedDimensions);
  const backgroundAnalysis = analyzeBackground(pixels, dimensions);
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

    if (backgroundAnalysis.profile.mode !== 'unknown'
      && colorDistance(backgroundAnalysis.color, { red, green, blue }) <= BACKGROUND_DISTANCE_THRESHOLD) {
      pixelWeight *= backgroundAnalysis.profile.mode === 'light-neutral' ? 0.04 : 0.12;
    }
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

  if (selected.length === 0) {
    return createFallbackPalette('low-color', backgroundAnalysis.profile);
  }
  while (selected.length < 3) {
    selected.push(selected.length === 1
      ? { red: 61, green: 65, blue: 70, weight: selected[0].weight * 0.55 }
      : { red: 25, green: 28, blue: 31, weight: selected[0].weight * 0.4 });
  }

  const selectedWeight = selected.reduce((sum, color) => sum + color.weight, 0);
  const averageLuminance = totalPixelWeight > 0 ? weightedLuminance / totalPixelWeight : 0.04;
  const textTone = resolveTextTone(backgroundAnalysis.profile, averageLuminance);
  const scrimOpacity = calculateScrimOpacity(backgroundAnalysis.profile.mode, averageLuminance, textTone);

  return {
    colors: selected.map(color => ({
      hex: toHex(color.red, color.green, color.blue),
      weight: color.weight / selectedWeight,
    })),
    background: backgroundAnalysis.profile,
    averageLuminance,
    scrimOpacity,
    contrastScrimOpacity: calculateContrastScrimOpacity(
      averageLuminance,
      scrimOpacity,
      textTone,
      backgroundAnalysis.profile.mode,
    ),
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
    { width: SAMPLE_SIZE, height: SAMPLE_SIZE },
  );
}
