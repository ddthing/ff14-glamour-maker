import { useEffect, useState, useRef } from 'react';
import type { AppState } from '../types';
import { INITIAL_STATE } from '../constants/initialState';

/**
 * Unicode-safe Base64 encoding
 */
function encodeData(data: object): string {
    const json = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(json)));
}

/**
 * Unicode-safe Base64 decoding
 */
function decodeData(encoded: string): any {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
}

export function useUrlState() {
    const [state, setState] = useState<AppState>(() => {
        try {
            const hash = window.location.hash;
            if (hash && hash.startsWith('#data=')) {
                const encoded = hash.replace('#data=', '');
                const parsed = decodeData(encoded);
                
                // Deep merge with INITIAL_STATE to ensure all required fields exist
                const mergedItems = { ...INITIAL_STATE.items };
                if (parsed.items) {
                    Object.keys(parsed.items).forEach((key) => {
                        const k = key as keyof typeof INITIAL_STATE.items;
                        mergedItems[k] = { ...INITIAL_STATE.items[k], ...parsed.items[k] };
                    });
                }
                
                return { ...INITIAL_STATE, ...parsed, items: mergedItems };
            }
        } catch (e) {
            console.error('Failed to parse URL state. Falling back to default.', e);
        }
        return INITIAL_STATE;
    });

    const isFirstMount = useRef(true);

    useEffect(() => {
        // Skip URL update on initial mount to prevent unnecessary history replacement
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }

        // Debounce the heavy JSON stringification and Base64 encoding to prevent typing lag
        const timeoutId = setTimeout(() => {
            try {
                // Remove error states and empty fields to keep URL compact
                const cleanState = JSON.parse(JSON.stringify(state));
                
                // Clean up items to minimize JSON size
                if (cleanState.items) {
                    Object.keys(cleanState.items).forEach(key => {
                        const item = cleanState.items[key];
                        Object.keys(item).forEach(prop => {
                            if (item[prop] === '' || prop === 'error') {
                                delete item[prop];
                            }
                        });
                    });
                }
                
                // Generate encoded string
                const encoded = encodeData(cleanState);
                
                // Update URL hash without adding to history (to avoid breaking back button)
                window.history.replaceState(null, '', `#data=${encoded}`);
            } catch (e) {
                console.error('Failed to encode URL state', e);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [state]);

    return [state, setState] as const;
}
