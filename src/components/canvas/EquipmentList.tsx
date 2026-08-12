import type { AppState, EquipmentPart } from '../../types';
import { CanvasItemRow } from './CanvasItemRow';
import { CanvasAccessoryRow } from './CanvasAccessoryRow';

interface EquipmentListProps {
  items: AppState['items'];
  fashionAccessory: AppState['fashionAccessory'];
  emptyTitle: string;
  emptySteps: [string, string, string];
}

const SLOT_ORDER: EquipmentPart[] = [
  'mainhand', 'offhand', 'head', 'body', 'hands', 'legs',
  'feet', 'ears', 'neck', 'wrists', 'rings', 'rings2', 'face',
];

export function EquipmentList({ items, fashionAccessory, emptyTitle, emptySteps }: EquipmentListProps) {
  const filledSlots = SLOT_ORDER.filter(id => Boolean(items[id]?.name));
  const filledCount = filledSlots.length + (fashionAccessory ? 1 : 0);
  const sizeMode = filledCount <= 6 ? 'comfortable' : filledCount <= 9 ? 'balanced' : 'compact';

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {filledCount > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {filledSlots.map((id, index) => (
            <CanvasItemRow
              key={id}
              item={items[id]}
              sizeMode={sizeMode}
              showDivider={index < filledSlots.length - 1 || Boolean(fashionAccessory)}
            />
          ))}
          {fashionAccessory ? (
            <CanvasAccessoryRow accessory={fashionAccessory} sizeMode={sizeMode} />
          ) : null}
        </div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '24px', height: '100%', opacity: 0.8,
        }}>
          <span style={{
            fontSize: '1.2rem', fontWeight: 800, color: 'var(--card-text-primary)', letterSpacing: '0.05em',
          }}>
            {emptyTitle}
          </span>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '14px', width: '100%',
            maxWidth: '320px', marginTop: '8px',
          }}>
            {emptySteps.map((step, index) => (
              <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', background: 'var(--card-chip-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem',
                  fontWeight: 'bold', color: 'var(--card-text-primary)', flexShrink: 0,
                }}>
                  {index + 1}
                </div>
                <span style={{
                  fontSize: '0.85rem', color: 'var(--card-text-secondary)', lineHeight: 1.4, fontWeight: 500,
                }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
