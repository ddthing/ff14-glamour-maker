import { useTranslation } from 'react-i18next';
import type { FF14Item } from '../../hooks/useFF14Search';
import type { EquipmentPart } from '../../types';
import { ItemIcon } from '../canvas/ItemIcon';
import { AlertCircleIcon, Loading03Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useItemSearchCombobox } from '../../features/search/useItemSearchCombobox';
import { getLocalizedItemNames } from '../../utils/formatters';

interface Props {
    value: string;
    hasError?: boolean;
    /** The slot to filter results by. Must be a valid EquipmentPart. */
    currentSlot?: EquipmentPart;
    onNameChange: (name: string) => void;
    onSelect: (item: FF14Item) => void;
}


/**
 * ItemSearchInput
 * Design Reference: Cursor Warm Minimalism - Floating dropdown with warm borders
 */
export function ItemSearchInput({ value, hasError, currentSlot, onNameChange, onSelect }: Props) {
    const { t, i18n } = useTranslation();
    const search = useItemSearchCombobox({ value, currentSlot, onNameChange, onSelect });
    const {
        containerRef, inputRef, listboxId, localValue, debouncedQuery, filteredResults,
        selectedIndex, isLoading, error, shouldShowDropdown, handleChange, handleFocus,
        handleBlur, handleKeyDown, handleSelect, preload, setSelectedIndex,
    } = search;

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Input Area */}
            <div className="relative flex items-center h-[44px]">
                <input
                    ref={inputRef}
                    type="search"
                    name={`item-search-${currentSlot ?? 'all'}`}
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={shouldShowDropdown}
                    aria-controls={listboxId}
                    aria-activedescendant={selectedIndex >= 0 ? `${listboxId}-option-${selectedIndex}` : undefined}
                    aria-label={`${currentSlot ? t(`slots.${currentSlot}`) : ''} ${t('common.search_item')}`.trim()}
                    className={`
                        input-focus-control w-full h-full bg-[var(--surface-100)] border rounded-[var(--radius-sm)] px-4 pl-10 text-sm
                        outline-none transition-[border-color,box-shadow,background-color]
                        ${hasError ? 'border-[var(--error)] bg-[var(--error)]/5' : 'border-[var(--border)]'}
                    `}
                    placeholder={t('common.search_item')}
                    value={localValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onMouseEnter={() => void preload()}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                />
                <HugeiconsIcon icon={Search01Icon} size={15} strokeWidth={1.7} className="absolute left-3 text-[var(--text-muted)] pointer-events-none" aria-hidden="true" />
                {isLoading && (
                    <HugeiconsIcon icon={Loading03Icon} size={15} strokeWidth={1.7} className="absolute right-3 text-[var(--foreground)] animate-spin" aria-hidden="true" />
                )}
            </div>

            {/* Dropdown Area */}
            {shouldShowDropdown && (
                <div
                    id={listboxId}
                    role="listbox"
                    className="dropdown-menu absolute top-[calc(100%+6px)] left-0 right-0 z-[200] max-h-[260px] scrollbar-thin"
                >
                    
                    {/* Loading State */}
                    {isLoading && filteredResults.length === 0 && (
                        <div className="p-4 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]" aria-live="polite">
                            <HugeiconsIcon icon={Loading03Icon} size={15} strokeWidth={1.7} className="animate-spin text-[var(--foreground)]" aria-hidden="true" />
                            {t('common.loading')}
                        </div>
                    )}

                    {/* No Results State */}
                    {!isLoading && debouncedQuery.trim().length >= 1 && filteredResults.length === 0 && !error && (
                        <div className="p-4 text-center text-xs text-[var(--text-muted)]" aria-live="polite">
                            {t('common.no_results')}
                        </div>
                    )}

                    {/* Error State */}
                    {!!error && (
                        <div className="p-4 flex items-center gap-2 text-xs text-[var(--error)] font-medium bg-[var(--error)]/5" role="alert">
                            <HugeiconsIcon icon={AlertCircleIcon} size={15} strokeWidth={1.8} aria-hidden="true" />
                            {t('common.search_failed')}
                        </div>
                    )}

                    {/* Results List */}
                    {filteredResults.map((item, index) => {
                        const { main, sub } = getLocalizedItemNames(item, i18n.language);
                        return (
                        <button
                            id={`${listboxId}-option-${index}`}
                            type="button"
                            role="option"
                            aria-selected={index === selectedIndex}
                            key={item.id}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`w-full flex items-center gap-3 p-2.5 text-left transition-colors group ${
                                index === selectedIndex ? 'bg-[var(--surface-300)]' : 'hover:bg-[var(--surface-300)]'
                            }`}
                        >
                            <div className="w-8 h-8 rounded shrink-0 overflow-hidden border border-[var(--border)] bg-[var(--surface-100)]">
                                <ItemIcon
                                    iconPath={item.iconPath || ''}
                                    nameKo={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--foreground)]">
                                    {main}
                                </div>
                                {sub && (
                                    <div className="text-xs text-[var(--text-muted)] truncate">
                                        {sub}
                                    </div>
                                )}
                            </div>
                        </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
