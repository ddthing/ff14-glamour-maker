import { describe, expect, it } from 'vitest';
import { getLocalizedItemNames } from './formatters';

const item = {
  name: '타원형 안경',
  nameKo: '타원형 안경',
  nameEn: 'Oval Spectacles',
  nameJa: 'オーバルグラス',
};

describe('getLocalizedItemNames', () => {
  it('uses the active language as the main name', () => {
    expect(getLocalizedItemNames(item, 'ko-KR')).toEqual({
      main: '타원형 안경',
      sub: 'Oval Spectacles / オーバルグラス',
    });
    expect(getLocalizedItemNames(item, 'en-US')).toEqual({
      main: 'Oval Spectacles',
      sub: '타원형 안경 / オーバルグラス',
    });
    expect(getLocalizedItemNames(item, 'ja-JP')).toEqual({
      main: 'オーバルグラス',
      sub: '타원형 안경 / Oval Spectacles',
    });
  });

  it('falls back to the Korean name when a translation is missing', () => {
    expect(getLocalizedItemNames({ name: '안경', nameKo: '안경' }, 'en')).toEqual({
      main: '안경',
      sub: '',
    });
  });
});
