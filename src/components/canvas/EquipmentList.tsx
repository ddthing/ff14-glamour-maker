import type { AppState, EquipmentPart } from '../../types';
import { CanvasItemRow } from './CanvasItemRow';

interface EquipmentListProps {
  items: AppState['items'];
  emptyTitle: string;
  emptySteps: [string, string, string];
}

const SLOT_ORDER: EquipmentPart[] = [
  'mainhand', 'head', 'body', 'hands', 'legs',
  'feet', 'ears', 'neck', 'wrists', 'rings', 'rings2', 'face',
];

export function EquipmentList({ items, emptyTitle, emptySteps }: EquipmentListProps) {
  const filledCount = SLOT_ORDER.reduce(
    (count, id) => count + (items[id]?.name ? 1 : 0),
    0,
  );
  const sizeMode = filledCount <= 6 ? 'comfortable' : filledCount <= 9 ? 'balanced' : 'compact';

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {filledCount > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {SLOT_ORDER.map(id => (
            <CanvasItemRow key={id} item={items[id]} sizeMode={sizeMode} />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '24px', height: '100%', opacity: 0.8,
        }}>
          <span style={{
            fontSize: '1.2rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em',
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
                  width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem',
                  fontWeight: 'bold', color: 'rgba(255,255,255,0.9)', flexShrink: 0,
                }}>
                  {index + 1}
                </div>
                <span style={{
                  fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, fontWeight: 500,
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
