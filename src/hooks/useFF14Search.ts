import { useCallback, useRef, useState } from 'react';
import itemsData from '../data/items.json';
import facewearData from '../data/facewear.json';
import { searchItems as findItems } from '../features/search/searchItems';
import type { FF14Item } from '../features/search/types';
import type { EquipmentPart } from '../types';

export type { FF14Item } from '../features/search/types';

interface LocalItemData {
  en?: string;
  ja?: string;
  ko?: string;
  uiCategory?: number | null;
  iconPath?: string;
}

type ItemDataMap = Record<string, LocalItemData>;

const searchableItems: FF14Item[] = Object.entries(itemsData as ItemDataMap).map(
  ([id, item]) => ({
    id: Number(id),
    name: item.ko || item.en || item.ja || 'Unknown Item',
    nameEn: item.en || '',
    nameJa: item.ja || '',
    uiCategory: item.uiCategory ?? undefined,
    iconPath: item.iconPath || undefined,
    source: 'item',
  }),
);

searchableItems.push(...Object.entries(facewearData as ItemDataMap).map(
  ([id, item]) => ({
    id: Number(id),
    name: item.ko || item.en || item.ja || 'Unknown Facewear',
    nameEn: item.en || '',
    nameJa: item.ja || '',
    iconPath: item.iconPath || undefined,
    source: 'facewear' as const,
  }),
));

export function useFF14Search() {
  const [results, setResults] = useState<FF14Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const requestGeneration = useRef(0);

  const searchItems = useCallback(async (query: string, currentSlot?: EquipmentPart) => {
    const trimmedQuery = query.trim();
    const generation = ++requestGeneration.current;

    if (!trimmedQuery) {
      setResults([]);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await new Promise<void>(resolve => window.setTimeout(resolve, 0));
      const nextResults = findItems(searchableItems, trimmedQuery, {
        slot: currentSlot,
        limit: 200,
      });

      if (generation === requestGeneration.current) {
        setResults(nextResults);
      }
    } catch (caughtError: unknown) {
      console.error('[Search Error]', caughtError);
      if (generation === requestGeneration.current) {
        setError('검색 중 오류가 발생했습니다. 다시 시도해 주세요.');
        setResults([]);
      }
    } finally {
      if (generation === requestGeneration.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const clearResults = useCallback(() => {
    requestGeneration.current += 1;
    setResults([]);
    setIsLoading(false);
    setError('');
  }, []);

  return { results, isLoading, error, searchItems, clearResults };
}
