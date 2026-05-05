import type { EquipItem } from '../types';

/**
 * Returns localized names (main and sub) for an equipment item.
 * @param item The equipment item.
 * @param language The current i18n language string (e.g., 'ko', 'en', 'ja').
 */
export function getLocalizedItemNames(item: EquipItem, language: string) {
    const ko = item.nameKo || item.name || '';
    const en = item.nameEn || '';
    const ja = item.nameJa || '';

    if (language.startsWith('en')) {
        const subParts = [ko, ja].filter(Boolean);
        return {
            main: en || ko,
            sub: subParts.join(' / '),
        };
    }
    if (language.startsWith('ja')) {
        const subParts = [ko, en].filter(Boolean);
        return {
            main: ja || ko,
            sub: subParts.join(' / '),
        };
    }
    // Default to Korean
    const subParts = [en, ja].filter(Boolean);
    return {
        main: ko,
        sub: subParts.join(' / '),
    };
}
