import { useState, useCallback } from 'react';

// 1. 로컬에 저장된 다국어 items 데이터 불러오기
// 구조: { "1": { "en": "Gil", "ko": "길" }, "28974": { "ko": "신 이슈가르드..." } }
import itemsData from '../data/items.json';

/**
 * Represents a localized Final Fantasy XIV item.
 * 
 * This model contains the essential metadata for an item, allowing UI components
 * to determine the correct equipment slot and display name.
 */
export interface FF14Item {
    /** The unique identifier for the item in the FFXIV database. */
    id: number;
    /** The localized Korean name of the item. */
    name: string;
    /** The localized English name of the item. */
    nameEn: string;
    /** The localized Japanese name of the item. */
    nameJa: string;
    /** XIVAPI icon path derived from the datamining CSV (e.g. '/i/065000/060128.png') */
    iconPath?: string;
    /** The category ID used to map the item to a specific equipment slot. */
    uiCategory?: number;
}

interface LocalItemData {
    en?: string;
    ja?: string;
    ko?: string;
    uiCategory?: number | null;
    iconPath?: string;
}

type ItemDataMap = Record<string, LocalItemData>;

const typedItemsData = itemsData as ItemDataMap;

/**
 * A hook that provides offline search capabilities for FFXIV items.
 * 
 * It performs a substring match against the Korean localized names from a 
 * local database, returning a limited set of results for optimal performance.
 */
export function useFF14Search() {
    const [results, setResults] = useState<FF14Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const searchItems = useCallback(async (query: string) => {
        const q = query.trim().toLowerCase();
        const safeKeyword = q.replace(/\s+/g, '');
        
        if (!safeKeyword) { 
            setResults([]); 
            return; 
        }

        setIsLoading(true);
        setError('');

        try {
            // Ensure the UI remains responsive during large dataset iteration
            await new Promise(resolve => setTimeout(resolve, 0));

            const matchedItems: FF14Item[] = [];
            const MAX_RESULTS = 50; 
            
            for (const [idStr, langs] of Object.entries(typedItemsData)) {
                const koName = (langs.ko || '').toLowerCase().replace(/\s+/g, '');
                const enName = (langs.en || '').toLowerCase().replace(/\s+/g, '');
                const jaName = (langs.ja || '').toLowerCase().replace(/\s+/g, '');

                if (
                    koName.includes(safeKeyword) || 
                    enName.includes(safeKeyword) || 
                    jaName.includes(safeKeyword)
                ) {
                    const id = Number(idStr);
                    
                    matchedItems.push({
                        id: id,
                        name: langs.ko || langs.en || langs.ja || 'Unknown Item',
                        nameEn: langs.en || '',
                        nameJa: langs.ja || '',
                        uiCategory: langs.uiCategory ?? undefined,
                        iconPath: langs.iconPath || undefined,
                    });

                    if (matchedItems.length >= MAX_RESULTS) {
                        break;
                    }
                }
            }

            setResults(matchedItems);
        } catch (err: unknown) {
            console.error('[Search Error]', err);
            setError('검색 처리 중 오류가 발생했습니다.');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearResults = useCallback(() => setResults([]), []);

    return { results, isLoading, error, searchItems, clearResults };
}
