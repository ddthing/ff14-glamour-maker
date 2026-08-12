import { useEffect, useState } from 'react';
import { createFallbackPalette, extractImagePalette, type ImagePalette } from '../features/palette/imagePalette';

export interface ImagePaletteState {
  palette: ImagePalette;
  status: 'idle' | 'loading' | 'ready' | 'fallback';
}

export function useImagePalette(source: string | null): ImagePaletteState {
  const [palette, setPalette] = useState<ImagePalette>(() => createFallbackPalette());
  const [status, setStatus] = useState<ImagePaletteState['status']>('idle');

  useEffect(() => {
    let active = true;
    if (!source) {
      setPalette(createFallbackPalette());
      setStatus('idle');
      return () => { active = false; };
    }

    setStatus('loading');
    extractImagePalette(source)
      .then(result => {
        if (!active) return;
        setPalette(result);
        setStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setPalette(createFallbackPalette());
        setStatus('fallback');
      });

    return () => { active = false; };
  }, [source]);

  return { palette, status };
}
