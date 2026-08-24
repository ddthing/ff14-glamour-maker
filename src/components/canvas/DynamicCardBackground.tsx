import type { CSSProperties } from 'react';
import type { ImagePalette } from '../../features/palette/imagePalette';
import type { ImagePaletteState } from '../../hooks/useImagePalette';

interface DynamicCardBackgroundProps {
  source: string | null;
  palette: ImagePalette;
  status: ImagePaletteState['status'];
}

export function DynamicCardBackground({ source, palette, status }: DynamicCardBackgroundProps) {
  const [primary, secondary, tertiary] = palette.colors;
  const { background } = palette;
  const primaryStop = Math.round(Math.max(34, Math.min(58, primary.weight * 100)));
  const secondaryStop = Math.round(Math.max(
    primaryStop + 22,
    Math.min(88, (primary.weight + secondary.weight) * 100),
  ));
  const meshStyle: CSSProperties = {
    background: [
      `radial-gradient(circle at 82% 12%, ${secondary.hex} 0%, transparent 68%)`,
      `radial-gradient(circle at 18% 88%, ${tertiary.hex} 0%, transparent 72%)`,
      `linear-gradient(135deg, ${primary.hex} 0%, ${primary.hex} ${primaryStop}%, ${secondary.hex} ${secondaryStop}%, ${tertiary.hex} 100%)`,
    ].join(', '),
    backgroundColor: background.hex,
  };

  if (!source) {
    return (
      <div
        className="absolute inset-0 bg-[#17191c]"
        aria-hidden="true"
        data-palette-fallback={palette.fallback}
        data-palette-status={status}
      />
    );
  }

  return (
    <div
      className="absolute inset-0"
      aria-hidden="true"
      data-palette-fallback={palette.fallback}
      data-palette-colors={palette.colors.map(color => color.hex).join(',')}
      data-palette-background-mode={background.mode}
      data-palette-status={status}
      data-contrast-scrim-opacity={palette.contrastScrimOpacity}
    >
      <div className="absolute inset-0" style={{ backgroundColor: background.hex }} />
      {palette.previewDataUrl ? (
        <img
          src={palette.previewDataUrl}
          alt=""
          width={32}
          height={32}
          className="absolute -inset-16 h-[calc(100%+128px)] w-[calc(100%+128px)] object-cover opacity-90"
          style={{
            filter: background.mode === 'light-neutral'
              ? 'blur(34px) saturate(1.05) brightness(1.02)'
              : 'blur(34px) saturate(1.25) brightness(1.04)',
            opacity: background.previewOpacity,
            transform: 'scale(1.12)',
          }}
        />
      ) : null}
      <div className="absolute inset-0" style={{ ...meshStyle, opacity: background.tintOpacity }} />
      {palette.scrimOpacity > 0 ? (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(100deg, rgba(8,10,12,${Math.max(0, palette.scrimOpacity - 0.04)}) 0%, rgba(8,10,12,${palette.scrimOpacity}) 62%, rgba(6,8,10,${Math.min(0.24, palette.scrimOpacity + 0.04)}) 100%)`,
          }}
        />
      ) : null}
      {palette.contrastScrimOpacity > 0 ? (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(100deg, rgba(8,10,12,${palette.contrastScrimOpacity}) 0%, rgba(8,10,12,${Math.min(0.92, palette.contrastScrimOpacity + 0.06)}) 62%, rgba(6,8,10,${Math.min(0.94, palette.contrastScrimOpacity + 0.1)}) 100%)`,
          }}
        />
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: background.mode === 'light-neutral' ? 0.018 : 0.035,
        }}
      />
    </div>
  );
}
