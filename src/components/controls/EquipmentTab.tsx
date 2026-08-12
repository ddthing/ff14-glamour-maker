import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown01Icon, Cancel01Icon, InformationCircleIcon, RefreshIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { AppState, EquipmentPart, EquipItem, FashionAccessorySelection } from '../../types';
import { ItemSearchInput } from './ItemSearchInput';
import { DyeSearchInput } from './DyeSearchInput';
import { SlotButton } from './SlotButton';
import { SectionLabel } from '../ui/SectionLabel';
import { SLOT_ORDER } from '../../constants/slots';
import { getLocalizedItemNames } from '../../utils/formatters';
import { FashionAccessorySearchInput } from './FashionAccessorySearchInput';

interface EquipmentTabProps {
    items: AppState['items'];
    onUpdateItem: (part: EquipmentPart, updates: Partial<EquipItem>) => void;
    onResetItems: () => void;
    fashionAccessory: FashionAccessorySelection | null;
    onFashionAccessoryChange: (accessory: FashionAccessorySelection | null) => void;
}

export function EquipmentTab({
    items,
    onUpdateItem,
    onResetItems,
    fashionAccessory,
    onFashionAccessoryChange,
}: EquipmentTabProps) {
    const { t, i18n } = useTranslation();
    const [activeSlot, setActiveSlot] = useState<EquipmentPart>('head');
    const [isAccessoryOpen, setIsAccessoryOpen] = useState(Boolean(fashionAccessory));

    useEffect(() => {
        if (fashionAccessory) setIsAccessoryOpen(true);
    }, [fashionAccessory]);

    const activeItem = items[activeSlot];
    const activeItemName = getLocalizedItemNames(activeItem, i18n.language).main;

    const updateItem = (updates: Partial<EquipItem>) => {
        onUpdateItem(activeSlot, updates);
    };

    return (
        <section className="min-h-0 overflow-y-auto" style={{ padding: '16px 20px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Section header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionLabel
                    style={{ marginBottom: 0 }}
                    icon={<HugeiconsIcon icon={InformationCircleIcon} size={13} strokeWidth={1.8} />}
                >
                    {t('common.info_entry')}
                </SectionLabel>
                <button
                    type="button"
                    className="btn-ghost"
                    onClick={onResetItems}
                    style={{ marginBottom: 0 }}
                >
                    <HugeiconsIcon icon={RefreshIcon} size={13} strokeWidth={1.8} aria-hidden="true" />
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
                            <span className="text-xs font-medium text-[var(--foreground)] truncate max-w-[200px]">
                                {activeItemName}
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
                        <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.8} aria-hidden="true" />
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
                        updateItem({
                            name: item.name,
                            nameKo: item.name,
                            nameEn: item.nameEn,
                            nameJa: item.nameJa,
                            iconPath: item.iconPath || '',
                            error: ''
                        });
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
                        item={items[part]}
                        isActive={activeSlot === part}
                        onClick={() => setActiveSlot(part)}
                    />
                ))}
            </div>

            <div className="mt-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-3.5 text-[var(--card-foreground)]">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        aria-expanded={isAccessoryOpen}
                        className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 rounded-[var(--radius-md)] text-left transition-colors hover:bg-[var(--accent)]"
                        onClick={() => setIsAccessoryOpen(open => !open)}
                    >
                        <span className="min-w-0">
                            <span className="block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                                {t('common.optional_items')}
                            </span>
                            <span className="mt-0.5 block truncate text-sm font-semibold">
                                {fashionAccessory
                                    ? i18n.language.startsWith('en')
                                        ? fashionAccessory.nameEn || fashionAccessory.nameKo
                                        : i18n.language.startsWith('ja')
                                          ? fashionAccessory.nameJa || fashionAccessory.nameKo
                                          : fashionAccessory.nameKo || fashionAccessory.nameEn
                                    : t('slots.fashionAccessory')}
                            </span>
                        </span>
                        <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            size={18}
                            strokeWidth={1.7}
                            className={`shrink-0 text-[var(--muted-foreground)] transition-transform ${isAccessoryOpen ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                        />
                    </button>
                    {fashionAccessory ? (
                        <button
                            type="button"
                            aria-label={t('common.clear_fashion_accessory')}
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-md)] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                            onClick={() => onFashionAccessoryChange(null)}
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={17} strokeWidth={1.8} aria-hidden="true" />
                        </button>
                    ) : null}
                </div>

                {isAccessoryOpen ? (
                    <div className="mt-3 border-t border-[var(--border)] pt-3">
                        <FashionAccessorySearchInput
                            onSelect={item => onFashionAccessoryChange({
                                id: item.id,
                                nameKo: item.name,
                                nameEn: item.nameEn,
                                nameJa: item.nameJa,
                                iconPath: item.iconPath,
                            })}
                        />
                    </div>
                ) : null}
            </div>
        </section>
    );
}
