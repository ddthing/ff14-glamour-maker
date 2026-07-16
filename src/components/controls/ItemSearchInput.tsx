import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../../hooks/useDebounce';
import type { FF14Item } from '../../hooks/useFF14Search';
import { useFF14Search } from '../../hooks/useFF14Search';
import { isMatchingSlot } from '../../domain/itemCategories';
import type { EquipmentPart } from '../../types';
import { ItemIcon } from '../canvas/ItemIcon';
import { Search, AlertCircle, Loader2 } from 'lucide-react';

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
    const { t } = useTranslation();
    const { results, isLoading, error, searchItems, clearResults } = useFF14Search();

    const [localValue, setLocalValue] = useState(value);
    const [open, setOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const debouncedQuery = useDebounce(localValue, 800);
    const containerRef = useRef<HTMLDivElement>(null);
    const isProgrammaticRef = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const listboxId = useId();

    const isFirstMount = useRef(true);

    // Sync from props and handle slot changes (Auto Advance / Manual Click)
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            isProgrammaticRef.current = true;
            setLocalValue(value);
            return;
        }

        // When currentSlot changes (e.g. Auto Advance or manual slot change)
        // 1. Reset search state
        // 2. Guarantee focus for continuous typing
        isProgrammaticRef.current = true;
        setLocalValue(value); // Sync with parent's empty value
        clearResults();
        setOpen(false);
        setSelectedIndex(-1);
        
        if (inputRef.current && window.matchMedia('(pointer: fine)').matches) {
            // Slight delay ensures React has finished updating the DOM for the new slot
            setTimeout(() => {
                inputRef.current?.focus();
            }, 10);
        }
    }, [currentSlot, value, clearResults]);

    useEffect(() => {
        if (!isFocused || isProgrammaticRef.current) return;
        if (debouncedQuery.trim().length >= 1) {
            searchItems(debouncedQuery, currentSlot);
            setOpen(true);
            setSelectedIndex(-1);
            onNameChange(debouncedQuery);
        } else {
            clearResults();
            setOpen(false);
            setSelectedIndex(-1);
            if (debouncedQuery === '') {
                onNameChange('');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQuery, searchItems, clearResults, isFocused, currentSlot]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (item: FF14Item) => {
        isProgrammaticRef.current = true;
        setLocalValue('');
        onSelect(item);
        setOpen(false);
        // keep focus on the input if it was active
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (localValue !== value) {
            onNameChange(localValue);
        }
    };

    const filteredResults = currentSlot
        ? results.filter(item => isMatchingSlot(item, currentSlot))
        : results;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setOpen(false);
            setSelectedIndex(-1);
            return;
        }
        if (!open || filteredResults.length === 0) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
                handleSelect(filteredResults[selectedIndex]);
            } else if (filteredResults.length > 0) {
                // If nothing is selected but results exist, select the first one
                handleSelect(filteredResults[0]);
            }
        }
    };

    const shouldShowDropdown = open && (filteredResults.length > 0 || isLoading || (debouncedQuery.trim().length >= 1 && (filteredResults.length === 0 || !!error)));

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
                        w-full h-full bg-[var(--surface-100)] border rounded-lg px-4 pl-10 text-sm 
                        focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-[border-color,box-shadow,background-color]
                        ${hasError ? 'border-[var(--error)] bg-[var(--error)]/5' : 'border-[var(--border)]'}
                    `}
                    placeholder={t('common.search_item')}
                    value={localValue}
                    onChange={e => {
                        isProgrammaticRef.current = false;
                        setLocalValue(e.target.value);
                        if (!e.target.value) { clearResults(); setOpen(false); }
                    }}
                    onFocus={() => {
                        setIsFocused(true);
                        if (localValue.trim().length >= 1) setOpen(true);
                    }}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                />
                <Search size={14} className="absolute left-3 text-[var(--text-muted)] pointer-events-none" aria-hidden="true" />
                {isLoading && (
                    <Loader2 size={14} className="absolute right-3 text-[var(--accent)] animate-spin" aria-hidden="true" />
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
                            <Loader2 size={14} className="animate-spin text-[var(--accent)]" aria-hidden="true" />
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
                            <AlertCircle size={14} aria-hidden="true" />
                            {error}
                        </div>
                    )}

                    {/* Results List */}
                    {filteredResults.map((item, index) => (
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
                                <div className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)]">
                                    {item.name}
                                </div>
                                {item.nameEn && (
                                    <div className="text-xs text-[var(--text-muted)] truncate">
                                        {item.nameEn}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
