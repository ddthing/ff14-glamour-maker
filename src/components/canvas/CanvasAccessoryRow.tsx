import { useTranslation } from 'react-i18next';
import type { FashionAccessorySelection } from '../../types';
import { ItemIcon } from './ItemIcon';

interface CanvasAccessoryRowProps {
  accessory: FashionAccessorySelection;
  sizeMode: 'comfortable' | 'balanced' | 'compact';
}

export function CanvasAccessoryRow({ accessory, sizeMode }: CanvasAccessoryRowProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const name = language.startsWith('en')
    ? accessory.nameEn || accessory.nameKo || accessory.nameJa
    : language.startsWith('ja')
      ? accessory.nameJa || accessory.nameKo || accessory.nameEn
      : accessory.nameKo || accessory.nameEn || accessory.nameJa;
  const sizes = {
    comfortable: { icon: 48, font: '1.15rem', padding: '8px 0' },
    balanced: { icon: 42, font: '1.05rem', padding: '6px 0' },
    compact: { icon: 36, font: '0.95rem', padding: '5px 0' },
  };
  const size = sizes[sizeMode];

  return (
    <div data-canvas-row="fashion-accessory" className="flex items-center gap-3" style={{ padding: size.padding }}>
      <div
        className="shrink-0 overflow-hidden"
        style={{
          width: size.icon,
          height: size.icon,
          borderRadius: 2,
          background: 'var(--card-chip-bg)',
          border: '1px solid var(--card-chip-border)',
        }}
      >
        <ItemIcon
          nameKo={accessory.nameKo}
          iconPath={accessory.iconPath ?? ''}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <span className="mb-1 block text-[0.56rem] font-bold uppercase tracking-[0.16em] text-[var(--card-text-muted)]">
          {t('slots.fashionAccessory', '패션 소품')}
        </span>
        <span className="block truncate font-extrabold leading-tight text-[var(--card-text-primary)]" style={{ fontSize: size.font }}>
          {name}
        </span>
      </div>
    </div>
  );
}
