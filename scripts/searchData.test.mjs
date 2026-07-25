import { describe, expect, it } from 'vitest';
import {
  buildSearchDatasets,
  normalizeSearchText,
} from './searchData.mjs';

describe('search data generation', () => {
  it('normalizes multilingual text deterministically', () => {
    expect(normalizeSearchText('  Ｄｅａｔｈ SICKLE  ')).toBe('deathsickle');
    expect(normalizeSearchText('친구 왕관')).toBe('친구왕관');
  });

  it('groups supported records into deterministic shared slot datasets', () => {
    const items = {
      3: {
        ko: '반지',
        en: 'Ring',
        ja: '指輪',
        iconPath: '/ring.png',
        equipSlots: ['rings', 'rings2'],
      },
      1: {
        ko: '검',
        en: 'Sword',
        ja: '剣',
        iconPath: '/sword.png',
        equipSlots: ['mainhand'],
      },
      2: {
        ko: '방패',
        en: 'Shield',
        ja: '盾',
        iconPath: '/shield.png',
        equipSlots: ['offhand'],
      },
      4: {
        ko: '재료',
        en: 'Material',
        ja: '素材',
        iconPath: '/material.png',
        equipSlots: [],
      },
    };
    const facewear = {
      10: {
        ko: '안경',
        en: 'Glasses',
        ja: '眼鏡',
        iconPath: '/glasses.png',
      },
    };

    const datasets = buildSearchDatasets(items, facewear);

    expect(datasets.weapon.map(item => item.id)).toEqual([1, 2]);
    expect(datasets.weapon.map(item => item.equipSlot)).toEqual(['mainhand', 'offhand']);
    expect(datasets.rings.map(item => item.id)).toEqual([3]);
    expect(datasets.face.map(item => item.id)).toEqual([10]);
    expect(Object.values(datasets).flat().some(item => item.id === 4)).toBe(false);
  });

  it('generates unique localized search keys in first-seen order', () => {
    const datasets = buildSearchDatasets({
      1: {
        ko: 'Friend Ring',
        en: 'Ｆｒｉｅｎｄ　Ｒｉｎｇ',
        ja: '友の指輪',
        equipSlots: ['rings'],
      },
    }, {});

    expect(datasets.rings[0]).toMatchObject({
      id: 1,
      name: 'Friend Ring',
      nameEn: 'Ｆｒｉｅｎｄ　Ｒｉｎｇ',
      nameJa: '友の指輪',
      source: 'item',
      searchKeys: ['friendring', '友の指輪'],
    });
  });

  it('returns every declared dataset even when inputs are empty', () => {
    expect(Object.keys(buildSearchDatasets({}, {}))).toEqual([
      'weapon',
      'head',
      'body',
      'hands',
      'legs',
      'feet',
      'ears',
      'neck',
      'wrists',
      'rings',
      'face',
    ]);
  });
});
