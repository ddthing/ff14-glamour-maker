import { describe, expect, it } from 'vitest';
import type { FF14Item } from './types';
import { isMatchingSlot, searchItems } from './searchItems';

function makeItem(id: number, name: string, uiCategory: number): FF14Item {
  return {
    id,
    name,
    nameEn: name,
    nameJa: name,
    uiCategory,
    source: 'item',
  };
}

describe('item slot classification', () => {
  it('classifies Reaper category 108 as a weapon, never as Facewear', () => {
    const reaperWeapon = makeItem(34060, '죽음낫', 108);

    expect(isMatchingSlot(reaperWeapon, 'mainhand')).toBe(true);
    expect(isMatchingSlot(reaperWeapon, 'face')).toBe(false);
  });

  it('does not classify category 83 materia as a weapon', () => {
    const materia = makeItem(8145, '전투력의 데미마테리아', 83);

    expect(isMatchingSlot(materia, 'mainhand')).toBe(false);
  });

  it('only accepts the dedicated Facewear source for the face slot', () => {
    const head = makeItem(1, '머리 장비 안경', 34);
    const facewear: FF14Item = {
      ...makeItem(2, '클래식 안경', 0),
      source: 'facewear',
    };

    expect(isMatchingSlot(head, 'face')).toBe(false);
    expect(isMatchingSlot(facewear, 'face')).toBe(true);
  });
});

describe('searchItems', () => {
  it('filters by slot before applying the result limit', () => {
    const irrelevant = Array.from({ length: 250 }, (_, index) =>
      makeItem(index, `공용의 머리 ${index}`, 34),
    );
    const body = Array.from({ length: 225 }, (_, index) =>
      makeItem(1000 + index, `공용의 상의 ${index}`, 35),
    );

    const results = searchItems([...irrelevant, ...body], '공용의', {
      slot: 'body',
      limit: 200,
    });

    expect(results).toHaveLength(200);
    expect(results.every(item => item.uiCategory === 35)).toBe(true);
  });

  it('ranks exact and prefix matches before substring matches', () => {
    const results = searchItems([
      makeItem(1, '고대 죽음낫 모형', 108),
      makeItem(2, '죽음낫 복제품', 108),
      makeItem(3, '죽음낫', 108),
    ], '죽음낫', { slot: 'mainhand' });

    expect(results.map(item => item.id)).toEqual([3, 2, 1]);
  });

  it('searches Korean, English, and Japanese names without translating them', () => {
    const item: FF14Item = {
      id: 34060,
      name: '죽음낫',
      nameEn: 'Death Sickle',
      nameJa: 'デスシックル',
      uiCategory: 108,
      source: 'item',
    };

    expect(searchItems([item], 'death sickle', { slot: 'mainhand' })).toEqual([item]);
    expect(searchItems([item], 'デスシックル', { slot: 'mainhand' })).toEqual([item]);
  });
});
