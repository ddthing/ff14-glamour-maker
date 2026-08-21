import { describe, expect, it } from 'vitest';
import { mergeLocalizedItems, parseEquipSlotCsv, parseItemCsv } from './itemData.mjs';

describe('item data generation', () => {
  it('joins languages by ID and preserves missing-language records', () => {
    const en = parseItemCsv('#,Name,Icon,ItemUICategory,EquipSlotCategory\n1,Shield,20001,11,2\n2,Sword,20002,2,1');
    const ko = parseItemCsv('key,0,1,2,3\n#,Name,Icon,ItemUICategory,EquipSlotCategory\nint32,str,int32,int32,int32\n1,방패,20001,11,2');
    const slots = parseEquipSlotCsv('#,MainHand,OffHand,Head,Body\n1,1,0,0,0\n2,0,1,0,0');
    const result = mergeLocalizedItems({ en, ko }, slots);

    expect(result['1']).toMatchObject({ ko: '방패', en: 'Shield', equipSlots: ['offhand'] });
    expect(result['2']).toMatchObject({ en: 'Sword', equipSlots: ['mainhand'] });
  });

  it('does not treat a negative offhand occupation flag as an offhand item', () => {
    const slots = parseEquipSlotCsv('#,MainHand,OffHand,Head,Body\n13,1,-1,0,0');
    expect(slots.get(13)).toEqual(['mainhand']);
  });

  it('keeps regional-only records explicit and applies stable asset overrides', () => {
    const ko = parseItemCsv('key,0,1,2,3\n#,Name,Icon,ItemUICategory,EquipSlotCategory\nint32,str,int32,int32,int32\n3,한국 전용 장비,30003,34,3');
    const en = parseItemCsv('#,Name,Icon,ItemUICategory,EquipSlotCategory\n3,,30003,34,3');
    const slots = parseEquipSlotCsv('#,MainHand,OffHand,Head,Body\n3,0,0,1,0');
    const result = mergeLocalizedItems({ en, ko }, slots, {
      3: { iconAssetKey: 'ko/3' },
    });

    expect(result['3']).toMatchObject({
      ko: '한국 전용 장비',
      translationStatus: 'kr-only',
      iconAssetKey: 'ko/3',
    });
  });
});
