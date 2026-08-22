import { useState, useEffect } from 'react';
import { getSafeStorage, readStorage, writeStorage } from '../utils/safeStorage';

/**
 * Persisted dark-mode hook.
 * - Reads initial value from localStorage, falls back to system preference.
 * - Toggles the `.dark` class on <html> so CSS variables in :root.dark apply.
 * - Saves preference to localStorage on every change.
 */
export function useDarkMode(): [boolean, () => void] {
    const [isDark, setIsDark] = useState<boolean>(() => {
        const saved = readStorage(getSafeStorage('local'), 'theme');
        if (saved !== null) return saved === 'dark';
        return typeof window !== 'undefined'
            && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        writeStorage(getSafeStorage('local'), 'theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggle = () => setIsDark(d => !d);

    return [isDark, toggle];
}
