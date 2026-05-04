import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../../hooks/useDebounce';
import type { FF14Item } from '../../hooks/useFF14Search';
import { useFF14Search } from '../../hooks/useFF14Search';
import { ItemIcon } from '../canvas/ItemIcon';
import { Search, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
    value: string;
    hasError?: boolean;
    currentSlot?: string;
    onNameChange: (name: string) => void;
    onSelect: (item: FF14Item) => void;
}

const SLOT_CATEGORY_MAP: Record<string, number | 'weapon'> = {
    head: 34,
    body: 35,
    legs: 36,
    hands: 37,
    feet: 38,
    neck: 40,
    ears: 41,
    wrists: 42,
    rings: 43,
    face: 108,
    mainhand: 'weapon', 
};

const WEAPON_UI_CATEGORIES = [
    ...Array.from({ length: 33 }, (_, i) => i + 1),
    83, 84, 87, 88, 89, 96, 97, 98, 105, 106, 107
];

function isMatchingSlot(item: FF14Item, currentSlot: string): boolean {
    if (item.uiCategory === undefined) return true;
    if (currentSlot === 'face') return item.uiCategory === 108 || item.uiCategory === 34;
    const expected = SLOT_CATEGORY_MAP[currentSlot];
    if (expected === undefined) return true;
    if (expected === 'weapon') return WEAPON_UI_CATEGORIES.includes(item.uiCategory);
    return item.uiCategory === expected;
}

/**
 * ItemSearchInput
 * Design Reference: Cursor Warm Minimalism - Floating dropdown with warm borders
 */
export function ItemSearchInput({ value, hasError, currentSlot, onNameChange, onSelect }: Props) {
    const { t } = useTranslation();
    const { results, isLoading, error, searchItems, clearResults } = useFF14Search();

    const [open, setOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const debouncedQuery = useDebounce(value, 800);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isFocused) return;
        if (debouncedQuery.trim().length >= 1) {
            searchItems(debouncedQuery);
            setOpen(true);
        } else {
            clearResults();
            setOpen(false);
        }
    }, [debouncedQuery, searchItems, clearResults, isFocused]);

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
        onSelect(item);
        setOpen(false);
    };

    const filteredResults = currentSlot
        ? results.filter(item => isMatchingSlot(item, currentSlot))
        : results;

    const shouldShowDropdown = open && (filteredResults.length > 0 || isLoading || (debouncedQuery.trim().length >= 1 && (filteredResults.length === 0 || !!error)));

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Input Area */}
            <div className="relative flex items-center h-[44px]">
                <input
                    className={`
                        w-full h-full bg-[var(--surface-100)] border rounded-lg px-4 pl-10 text-[0.9375rem] 
                        focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all
                        ${hasError ? 'border-[var(--error)] bg-[var(--error)]/5' : 'border-[var(--border)]'}
                    `}
                    placeholder={t('common.search_item')}
                    value={value}
                    onChange={e => {
                        onNameChange(e.target.value);
                        if (!e.target.value) { clearResults(); setOpen(false); }
                    }}
                    onFocus={() => {
                        setIsFocused(true);
                        if (value.trim().length >= 1) setOpen(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                />
                <Search size={14} className="absolute left-3 text-[var(--text-muted)] pointer-events-none" />
                {isLoading && (
                    <Loader2 size={14} className="absolute right-3 text-[var(--accent)] animate-spin" />
                )}
            </div>

            {/* Dropdown Area */}
            {shouldShowDropdown && (
                <div className="dropdown-menu absolute top-[calc(100%+6px)] left-0 right-0 z-[200] max-h-[260px] scrollbar-thin">
                    
                    {/* Loading State */}
                    {isLoading && filteredResults.length === 0 && (
                        <div className="p-4 flex items-center justify-center gap-2 text-[0.8rem] text-[var(--text-muted)]">
                            <Loader2 size={14} className="animate-spin text-[var(--accent)]" />
                            {t('common.loading')}
                        </div>
                    )}

                    {/* No Results State */}
                    {!isLoading && debouncedQuery.trim().length >= 1 && filteredResults.length === 0 && !error && (
                        <div className="p-4 text-center text-[0.8rem] text-[var(--text-muted)]">
                            {t('common.no_results')}
                        </div>
                    )}

                    {/* Error State */}
                    {!!error && (
                        <div className="p-4 flex items-center gap-2 text-[0.8rem] text-[var(--error)] font-medium bg-[var(--error)]/5">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    {/* Results List */}
                    {filteredResults.map(item => (
                        <button
                            key={item.id}
                            onMouseDown={e => { e.preventDefault(); handleSelect(item); }}
                            className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-[var(--surface-300)] transition-colors group"
                        >
                            <div className="w-8 h-8 rounded shrink-0 overflow-hidden border border-[var(--border)] bg-[var(--surface-100)]">
                                <ItemIcon
                                    iconPath={item.iconPath || ''}
                                    nameKo={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[0.85rem] font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)]">
                                    {item.name}
                                </div>
                                {item.nameEn && (
                                    <div className="text-[0.65rem] text-[var(--text-muted)] truncate">
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
