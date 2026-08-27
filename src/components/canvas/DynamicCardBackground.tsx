import type { CSSProperties } from 'react';
import type { ImagePalette } from '../../features/palette/imagePalette';
import type { ImagePaletteState } from '../../hooks/useImagePalette';

interface RGBColor {
  red: number;
  green: number;
  blue: number;
}

const LIGHT_CARD_SURFACE: RGBColor = { red: 246, green: 244, blue: 239 };
const DARK_CARD_SURFACE: RGBColor = { red: 16, green: 20, blue: 25 };

function parseHex(hex: string): RGBColor | null {
  const value = hex.trim().replace(/^#/, '');
  const normalized = value.length === 3
    ? value.split('').map(channel => `${channel}${channel}`).join('')
    : value;
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;

  return {
    red: Number.parseInt(normalized.slice(0, 2), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    blue: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function toHex(color: RGBColor): string {
  return `#${[color.red, color.green, color.blue]
    .map(channel => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

function mixHex(source: string, target: RGBColor, amount: number): string {
  const sourceColor = parseHex(source) ?? target;
  const mix = Math.min(1, Math.max(0, amount));
  return toHex({
    red: sourceColor.red + (target.red - sourceColor.red) * mix,
    green: sourceColor.green + (target.green - sourceColor.green) * mix,
    blue: sourceColor.blue + (target.blue - sourceColor.blue) * mix,
  });
}

function tunePaletteColor(hex: string, textTone: ImagePalette['textTone']): string {
  return textTone === 'dark'
    ? mixHex(hex, LIGHT_CARD_SURFACE, 0.56)
    : mixHex(hex, DARK_CARD_SURFACE, 0.2);
}

interface DynamicCardBackgroundProps {
  source: string | null;
  palette: ImagePalette;
  status: ImagePaletteState['status'];
}

export function DynamicCardBackground({ source, palette, status }: DynamicCardBackgroundProps) {
  const [primary, secondary] = palette.colors;
  const { background } = palette;
  const [cardPrimary, cardSecondary, cardTertiary] = palette.colors.map(color => (
    tunePaletteColor(color.hex, palette.textTone)
  ));
  const baseColor = palette.textTone === 'dark'
    ? mixHex(background.hex, LIGHT_CARD_SURFACE, 0.08)
    : background.mode === 'light-neutral'
      ? background.hex
      : mixHex(primary.hex, DARK_CARD_SURFACE, 0.24);
  const primaryStop = Math.round(Math.max(34, Math.min(58, primary.weight * 100)));
  const secondaryStop = Math.round(Math.max(
    primaryStop + 22,
    Math.min(88, (primary.weight + secondary.weight) * 100),
  ));
  const meshStyle: CSSProperties = {
    background: [
      `radial-gradient(ellipse at 84% 10%, ${cardSecondary} 0%, transparent 62%)`,
      `radial-gradient(ellipse at 14% 88%, ${cardTertiary} 0%, transparent 68%)`,
      `linear-gradient(132deg, ${cardPrimary} 0%, ${cardPrimary} ${primaryStop}%, ${cardSecondary} ${secondaryStop}%, ${cardTertiary} 100%)`,
    ].join(', '),
    backgroundColor: baseColor,
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
      data-palette-base-color={baseColor}
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
          className="absolute -inset-16 h-[calc(100%+128px)] w-[calc(100%+128px)] object-cover"
          style={{
            filter: background.mode === 'light-neutral'
              ? 'blur(30px) saturate(1.75) contrast(1.06) brightness(1.02)'
              : 'blur(34px) saturate(1.45) contrast(1.04) brightness(1.03)',
            mixBlendMode: background.mode === 'light-neutral' ? 'multiply' : undefined,
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
