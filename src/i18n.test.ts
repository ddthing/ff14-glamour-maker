import { describe, expect, it } from 'vitest';
import i18n from './i18n';

const languages = ['ko', 'en', 'ja'] as const;

describe('translation resources', () => {
  it('keeps the same common and slot keys in every language', () => {
    const reference = i18n.getResourceBundle('ko', 'translation');

    for (const language of languages.slice(1)) {
      const resources = i18n.getResourceBundle(language, 'translation');
      expect(Object.keys(resources.common).sort()).toEqual(Object.keys(reference.common).sort());
      expect(Object.keys(resources.slots).sort()).toEqual(Object.keys(reference.slots).sort());
      expect(Object.keys(resources.crop).sort()).toEqual(Object.keys(reference.crop).sort());
    }
  });

  it('uses the intended localized labels for off-hand and the Japanese brand', () => {
    expect(i18n.getResource('ko', 'translation', 'slots.offhand')).toBe('보조무기');
    expect(i18n.getResource('en', 'translation', 'slots.offhand')).toBe('Off Hand');
    expect(i18n.getResource('ja', 'translation', 'slots.offhand')).toBe('副武器');
    expect(i18n.getResource('ja', 'translation', 'common.title_brand')).toBe('FFXIV ミラプリセットメーカー');
  });
});
