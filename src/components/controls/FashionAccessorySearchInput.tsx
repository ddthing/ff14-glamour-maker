import { Search01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadFashionAccessories } from '../../features/search/loadSearchItems';
import type { FF14Item } from '../../features/search/types';
import { useDebounce } from '../../hooks/useDebounce';
import { ItemIcon } from '../canvas/ItemIcon';

interface FashionAccessorySearchInputProps {
  onSelect: (item: FF14Item) => void;
}

const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, '');

export function FashionAccessorySearchInput({ onSelect }: FashionAccessorySearchInputProps) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<readonly FF14Item[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 250);
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const preload = async () => {
    if (items.length > 0 || loading) return;
    setLoading(true);
    try {
      setItems(await loadFashionAccessories());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = normalize(debouncedQuery);
    if (!normalizedQuery) return [];
    return items.filter(item => [item.name, item.nameEn, item.nameJa]
      .some(name => normalize(name).includes(normalizedQuery))).slice(0, 80);
  }, [debouncedQuery, items]);

  useEffect(() => {
    setSelectedIndex(0);
    setOpen(Boolean(debouncedQuery.trim()));
  }, [debouncedQuery]);

  const select = (item: FF14Item) => {
    onSelect(item);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex h-11 items-center">
        <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 text-[var(--muted-foreground)]" size={16} strokeWidth={1.7} />
        <input
          type="search"
          role="combobox"
          aria-label={t('common.search_fashion_accessory')}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={open && results[selectedIndex] ? `${listboxId}-${selectedIndex}` : undefined}
          autoComplete="off"
          value={query}
          placeholder={t('common.search_fashion_accessory')}
          className="input-focus-control h-full w-full rounded-[var(--radius-md)] border border-[var(--input)] bg-[var(--background)] px-9 text-sm text-[var(--foreground)]"
          onFocus={() => { void preload(); if (query.trim()) setOpen(true); }}
          onMouseEnter={() => void preload()}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Escape') setOpen(false);
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setSelectedIndex(index => Math.min(results.length - 1, index + 1));
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setSelectedIndex(index => Math.max(0, index - 1));
            }
            if (event.key === 'Enter' && results[selectedIndex]) {
              event.preventDefault();
              select(results[selectedIndex]);
            }
          }}
        />
        {loading ? <HugeiconsIcon icon={SparklesIcon} className="absolute right-3 animate-pulse text-[var(--muted-foreground)]" size={16} strokeWidth={1.7} /> : null}
      </div>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          className="dropdown-menu absolute inset-x-0 top-[calc(100%+6px)] z-[220] max-h-64 overflow-y-auto p-1"
        >
          {results.length > 0 ? results.map((item, index) => {
            const name = i18n.language.startsWith('en')
              ? item.nameEn || item.name
              : i18n.language.startsWith('ja') ? item.nameJa || item.name : item.name;
            return (
              <button
                key={item.id}
                id={`${listboxId}-${index}`}
                type="button"
                role="option"
                aria-selected={index === selectedIndex}
                className="flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-sm)] px-2.5 text-left hover:bg-[var(--accent)]"
                onMouseDown={event => event.preventDefault()}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => select(item)}
              >
                <span className="h-8 w-8 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)]">
                  <ItemIcon
                    nameKo={item.name}
                    iconPath={item.iconPath ?? ''}
                    iconAssetKey={item.iconAssetKey}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="min-w-0 truncate text-sm font-semibold">{name}</span>
              </button>
            );
          }) : (
            <p className="px-3 py-4 text-center text-xs text-[var(--muted-foreground)]">
              {loading ? t('common.loading') : t('common.no_results')}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
