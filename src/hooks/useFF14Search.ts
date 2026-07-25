import { useCallback, useRef, useState } from 'react';
import { loadSearchItems } from '../features/search/loadSearchItems';
import { searchItems as findItems } from '../features/search/searchItems';
import type { FF14Item } from '../features/search/types';
import type { EquipmentPart } from '../types';

export type { FF14Item } from '../features/search/types';

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
      const searchableItems = await loadSearchItems(currentSlot);
      const nextResults = findItems(searchableItems, trimmedQuery, {
        slot: currentSlot === 'offhand' ? currentSlot : undefined,
        limit: 50,
      });

      if (generation === requestGeneration.current) {
        setResults(nextResults);
      }
    } catch (caughtError: unknown) {
      console.error('[Search Error]', caughtError);
      if (generation === requestGeneration.current) {
        setError('search-failed');
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
