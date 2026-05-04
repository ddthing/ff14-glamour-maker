import type { EquipItem } from '../types';

/**
 * Returns localized names (main and sub) for an equipment item.
 * @param item The equipment item.
 * @param language The current i18n language string (e.g., 'ko', 'en', 'ja').
 */
export function getLocalizedItemNames(item: EquipItem, language: string) {
    if (language.startsWith('en')) {
        return {
            main: item.nameEn || item.name,
            sub: [item.nameKo, item.nameJa].filter(Boolean).join(' · '),
        };
    }
    if (language.startsWith('ja')) {
        return {
            main: item.nameJa || item.name,
            sub: [item.nameKo, item.nameEn].filter(Boolean).join(' · '),
        };
    }
    // 기본 한국어
    return {
        main: item.nameKo || item.name,
        sub: [item.nameEn, item.nameJa].filter(Boolean).join(' · '),
    };
}
