import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FF14_DYES } from '../../constants/dyes';

interface DyeSearchInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
}

/**
 * DyeSearchInput
 * Design Reference: Cursor Warm Minimalism - Compact search with color preview
 */
export function DyeSearchInput({ value, onChange, placeholder }: DyeSearchInputProps) {
    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    useEffect(() => {
        if (!open) setSearchTerm(value);
    }, [value, open]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearchTerm(value);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [value]);

    const term = searchTerm.toLowerCase();
    const filteredDyes = FF14_DYES.filter(d =>
        d.name.toLowerCase().includes(term) ||
        (d.nameEn ?? '').toLowerCase().includes(term) ||
        (d.nameJa ?? '').toLowerCase().includes(term)
    );

    const matchedDye = FF14_DYES.find(d => d.name === value);

    return (
        <div ref={wrapperRef} className="input-focus-shell relative flex-1 flex items-center bg-[var(--surface-100)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 h-[44px] gap-2 transition-[border-color,box-shadow]">
            {/* Color Swatch Preview */}
            <div 
                className="w-3.5 h-3.5 rounded-full border border-[var(--border)] shrink-0 transition-colors shadow-sm"
                style={{ 
                    background: matchedDye?.hex !== 'transparent' ? (matchedDye?.hex ?? 'transparent') : 'transparent',
                    opacity: matchedDye && matchedDye.hex !== 'transparent' ? 1 : 0.2
                }} 
            />

            {/* Input Field */}
            <input
                type="search"
                name={`dye-search-${placeholder}`}
                autoComplete="off"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-label={placeholder}
                className="input-focus-proxy w-full h-full bg-transparent border-none text-sm outline-none placeholder:text-[var(--text-muted)]"
                placeholder={placeholder}
                value={open ? searchTerm : value}
                onChange={e => {
                    setSearchTerm(e.target.value);
                    if (!open) setOpen(true);
                }}
                onFocus={() => {
                    setSearchTerm('');
                    setOpen(true);
                }}
                onKeyDown={event => {
                    if (event.key === 'Escape') {
                        setOpen(false);
                        setSearchTerm(value);
                    }
                }}
            />

            {/* Dropdown Menu */}
            {open && (
                <div id={listboxId} role="listbox" className="dropdown-menu absolute top-[calc(100%+6px)] left-0 right-0 z-[200] max-h-[220px] scrollbar-thin">
                    {filteredDyes.length === 0 ? (
                        <div className="p-3 text-center text-xs text-[var(--text-muted)]">
                            {t('common.no_results')}
                        </div>
                    ) : (
                        filteredDyes.map(dye => (
                            <button
                                type="button"
                                role="option"
                                aria-selected={dye.name === value}
                                key={dye.name}
                                className="w-full flex items-center gap-2.5 p-2 text-left hover:bg-[var(--surface-300)] transition-colors group"
                                onClick={() => {
                                    onChange(dye.name);
                                    setSearchTerm(dye.name);
                                    setOpen(false);
                                }}
                            >
                                <span 
                                    className="w-2.5 h-2.5 rounded-full border border-[var(--border)] shrink-0" 
                                    style={{ background: dye.hex !== 'transparent' ? dye.hex : 'transparent' }} 
                                />
                                <span className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent)]">
                                    {i18n.language.startsWith('ja') ? dye.nameJa : 
                                     i18n.language.startsWith('en') ? dye.nameEn : 
                                     dye.name}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
