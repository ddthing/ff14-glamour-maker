import { useTranslation } from 'react-i18next';
import { 
    Sword, Crown, Shirt, Hand, SquareSplitVertical, Footprints, 
    Ear, Gem, Watch, Circle, Glasses, Plus 
} from 'lucide-react';
import type { EquipmentPart, EquipItem } from '../../types';
import { ItemIcon } from '../canvas/ItemIcon';

interface SlotButtonProps {
    part: EquipmentPart;
    item: EquipItem;
    isActive: boolean;
    onClick: () => void;
}

/**
 * Slot Icon Mapping
 */
const SLOT_ICONS: Record<EquipmentPart, React.ReactNode> = {
    mainhand: <Sword size={12} />,
    head: <Crown size={12} />,
    body: <Shirt size={12} />,
    hands: <Hand size={12} />,
    legs: <SquareSplitVertical size={12} />,
    feet: <Footprints size={12} />,
    ears: <Ear size={12} />,
    neck: <Gem size={12} />,
    wrists: <Watch size={12} />,
    rings: <Circle size={12} />,
    face: <Glasses size={12} />
};

/**
 * SlotButton
 * Design Reference: Cursor Warm Minimalism - Pill/Card hybrid
 */
export function SlotButton({ part, item, isActive, onClick }: SlotButtonProps) {
    const { t } = useTranslation();
    const isFilled = !!item.name;

    return (
        <button
            onClick={onClick}
            className={`
                group relative flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border transition-all duration-150
                ${isActive
                    ? 'bg-[var(--surface-300)] border-[var(--border-medium)] ring-1 ring-[var(--border-medium)]'
                    : 'bg-[var(--surface-100)] border-[var(--border)] hover:border-[var(--border-medium)] hover:bg-[var(--surface-200)] hover:scale-[1.02]'
                }
                ${isFilled && !isActive ? 'border-[var(--border-medium)]' : ''}
                min-h-[76px] w-full cursor-pointer touch-manipulation active:scale-[0.97]
            `}
        >
            {/* Label & Icon */}
            <span className={`
                flex items-center gap-1 text-xs font-bold uppercase tracking-wider
                ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}
            `}>
                {SLOT_ICONS[part]}
                {t(`slots.${part}`)}
            </span>

            {/* Content Area */}
            <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                {item.nameKo || item.iconPath ? (
                    <ItemIcon
                        iconPath={item.iconPath || ''}
                        nameKo={item.nameKo || ''}
                        enableWebhook={true}
                        className="w-full h-full rounded-md object-cover border border-[var(--border)]"
                    />
                ) : (
                    <div className={`
                        w-full h-full rounded-md flex items-center justify-center transition-colors
                        ${isActive ? 'bg-[var(--surface-400)]' : 'bg-[var(--surface-200)]'}
                    `}>
                        <Plus size={14} className="opacity-30" />
                    </div>
                )}
            </div>

            {/* Filled Indicator */}
            {isFilled && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_rgba(245,78,0,0.4)]" />
            )}
        </button>
    );
}
