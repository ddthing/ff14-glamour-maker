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

interface EquipmentListSpacing {
  gap: number;
  paddingBlock: number;
}

function getEquipmentListSpacing(filledCount: number): EquipmentListSpacing {
  if (filledCount <= 6) return { gap: 10, paddingBlock: 20 };
  if (filledCount <= 9) return { gap: 7, paddingBlock: 14 };
  if (filledCount <= 12) return { gap: 4, paddingBlock: 8 };
  return { gap: 2, paddingBlock: 4 };
}

export function EquipmentList({ items, fashionAccessory, emptyTitle, emptySteps }: EquipmentListProps) {
  const filledSlots = SLOT_ORDER.filter(id => Boolean(items[id]?.name));
  const filledCount = filledSlots.length + (fashionAccessory ? 1 : 0);
  const sizeMode = filledCount <= 6 ? 'comfortable' : filledCount <= 9 ? 'balanced' : 'compact';
  const spacing = getEquipmentListSpacing(filledCount);

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {filledCount > 0 ? (
        <div
          data-canvas-list="equipment"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${spacing.gap}px`,
            paddingBlock: `${spacing.paddingBlock}px`,
          }}
        >
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
