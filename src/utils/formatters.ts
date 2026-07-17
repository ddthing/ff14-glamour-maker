import type { EquipItem } from '../types';

type LocalizedItem = Pick<EquipItem, 'name' | 'nameKo' | 'nameEn' | 'nameJa'>;

/**
 * Returns localized names (main and sub) for an equipment item.
 * @param item The equipment item.
 * @param language The current i18n language string (e.g., 'ko', 'en', 'ja').
 */
export function getLocalizedItemNames(item: LocalizedItem, language: string) {
    const ko = item.nameKo || item.name || '';
    const en = item.nameEn || '';
    const ja = item.nameJa || '';
    const formatNames = (main: string, secondary: string[]) => ({
        main,
        sub: [...new Set(secondary.filter(name => name && name !== main))].join(' / '),
    });

    if (language.startsWith('en')) {
        return formatNames(en || ko || ja, [ko, ja]);
    }
    if (language.startsWith('ja')) {
        return formatNames(ja || ko || en, [ko, en]);
    }
    // Default to Korean
    return formatNames(ko || en || ja, [en, ja]);
}
