import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, RotateCcw, X } from 'lucide-react';
import type { AppState, EquipmentPart, EquipItem } from '../../types';
import { ItemSearchInput } from './ItemSearchInput';
import { DyeSearchInput } from './DyeSearchInput';
import { SlotButton } from './SlotButton';
import { SectionLabel } from '../ui/SectionLabel';
import { SLOT_ORDER } from '../../constants/slots';

interface EquipmentTabProps {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    onResetItems: () => void;
}

export function EquipmentTab({ state, setState, onResetItems }: EquipmentTabProps) {
    const { t } = useTranslation();
    const [activeSlot, setActiveSlot] = useState<EquipmentPart>('head');
    const [justAutoAdvancedTo, setJustAutoAdvancedTo] = useState<EquipmentPart | null>(null);

    useEffect(() => {
        if (!justAutoAdvancedTo) return;
        const timeoutId = window.setTimeout(() => setJustAutoAdvancedTo(null), 800);
        return () => window.clearTimeout(timeoutId);
    }, [justAutoAdvancedTo]);

    const activeItem = state.items[activeSlot];

    const updateItem = (updates: Partial<EquipItem>) => {
        setState(s => ({
            ...s,
            items: { ...s.items, [activeSlot]: { ...s.items[activeSlot], ...updates } }
        }));
    };

    return (
        <section style={{ padding: '16px 20px 8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Section header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionLabel icon={<Info size={12} />}>{t('common.info_entry')}</SectionLabel>
                <button
                    type="button"
                    className="btn-ghost"
                    onClick={onResetItems}
                    style={{ marginBottom: '10px' }}
                >
                    <RotateCcw size={12} strokeWidth={2.5} aria-hidden="true" />
                    {t('common.reset')}
                </button>
            </div>

            {/* Active slot editor */}
            <div style={{
                background: 'var(--surface-100)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
            }}>
                {/* Slot name + clear */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    paddingBottom: '10px',
                    borderBottom: '1px solid var(--border)',
                }}>
                    <div className="flex flex-col gap-1">
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: 'var(--text-primary)',
                        }}>
                            {t(`slots.${activeSlot}`)}
                        </span>
                        {activeItem.name && (
                            <span className="text-xs font-medium text-[var(--accent)] truncate max-w-[200px]">
                                {activeItem.name}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        aria-label={`${t('common.clear_slot')}: ${t(`slots.${activeSlot}`)}`}
                        onClick={() => updateItem({ name: '', dye1: '', dye2: '', iconPath: '', nameKo: '', nameEn: '', nameJa: '' })}
                        style={{
                            color: 'var(--text-muted)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '3px',
                            borderRadius: '4px',
                            display: 'flex',
                            transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                        <X size={13} aria-hidden="true" />
                    </button>
                </div>

                <ItemSearchInput
                    value={""} // Search box remains empty (Command Palette style)
                    currentSlot={activeSlot}
                    hasError={!!activeItem.error}
                    onNameChange={() => {
                        // We only want to update if they are typing directly and hit blur without select,
                        // but since value is always empty, typing will only update local search state.
                        // So we don't update item name on every keystroke anymore to preserve the blank search field.
                    }}
                    onSelect={item => {
                        const wasEmpty = !activeItem.name;
                        
                        updateItem({
                            name: item.name,
                            nameKo: item.name,
                            nameEn: item.nameEn,
                            nameJa: item.nameJa,
                            iconPath: item.iconPath || '',
                            error: ''
                        });

                        // Smart Auto-Advance: Only advance if the slot was originally empty
                        if (wasEmpty) {
                            const currentIndex = SLOT_ORDER.indexOf(activeSlot);
                            if (currentIndex >= 0 && currentIndex < SLOT_ORDER.length - 1) {
                                const nextSlot = SLOT_ORDER[currentIndex + 1];
                                setActiveSlot(nextSlot);
                                setJustAutoAdvancedTo(nextSlot);
                            }
                        }
                    }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <DyeSearchInput
                        value={activeItem.dye1 || ''}
                        onChange={v => updateItem({ dye1: v })}
                        placeholder={`${t('common.search_dye')} 1`}
                    />
                    <DyeSearchInput
                        value={activeItem.dye2 || ''}
                        onChange={v => updateItem({ dye2: v })}
                        placeholder={`${t('common.search_dye')} 2`}
                    />
                </div>
            </div>

            {/* Slot grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {SLOT_ORDER.map(part => (
                    <SlotButton
                        key={part}
                        part={part}
                        item={state.items[part]}
                        isActive={activeSlot === part}
                        isHighlighted={justAutoAdvancedTo === part}
                        onClick={() => setActiveSlot(part)}
                    />
                ))}
            </div>
        </section>
    );
}
