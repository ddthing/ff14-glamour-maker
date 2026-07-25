const MAX_CROP_WIDTH = 1440;
const MAX_CROP_HEIGHT = 2700;

export interface CropRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropImageDependencies {
  createImage?: (url: string) => Promise<HTMLImageElement>;
  createCanvas?: () => HTMLCanvasElement;
}

export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('Could not decode source image.')));
    image.src = url;
  });
}

export function calculateCropOutputSize(
  crop: Pick<CropRectangle, 'width' | 'height'>,
): { width: number; height: number } {
  if (!Number.isFinite(crop.width) || !Number.isFinite(crop.height)
    || crop.width <= 0 || crop.height <= 0) {
    throw new Error('Crop dimensions must be positive finite numbers.');
  }

  const scale = Math.min(
    1,
    MAX_CROP_WIDTH / crop.width,
    MAX_CROP_HEIGHT / crop.height,
  );

  return {
    width: Math.max(1, Math.floor(crop.width * scale)),
    height: Math.max(1, Math.floor(crop.height * scale)),
  };
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Could not encode cropped image.'));
    }, 'image/png');
  });
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropRectangle,
  dependencies: CropImageDependencies = {},
): Promise<Blob> {
  const loadImage = dependencies.createImage ?? createImage;
  const createCanvas = dependencies.createCanvas
    ?? (() => document.createElement('canvas'));
  const image = await loadImage(imageSrc);
  const outputSize = calculateCropOutputSize(pixelCrop);
  const canvas = createCanvas();
  canvas.width = outputSize.width;
  canvas.height = outputSize.height;
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Could not create crop canvas context.');

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize.width,
    outputSize.height,
  );

  return canvasToPngBlob(canvas);
}
