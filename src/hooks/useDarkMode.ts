import { useState, useEffect } from 'react';

/**
 * Persisted dark-mode hook.
 * - Reads initial value from localStorage, falls back to system preference.
 * - Toggles the `.dark` class on <html> so CSS variables in :root.dark apply.
 * - Saves preference to localStorage on every change.
 */
export function useDarkMode(): [boolean, () => void] {
    const [isDark, setIsDark] = useState<boolean>(() => {
        const saved = localStorage.getItem('theme');
        if (saved !== null) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggle = () => setIsDark(d => !d);

    return [isDark, toggle];
}
