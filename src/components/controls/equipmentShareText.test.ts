import { describe, expect, it } from 'vitest';
import { createInitialState } from '../../features/glamour/stateFactory';
import { buildEquipmentShareText } from './equipmentShareText';

describe('buildEquipmentShareText', () => {
  it('includes localized equipment, selected dyes, and a fashion accessory', () => {
    const state = createInitialState();
    state.title = 'Moonlit look';
    state.creator = '@gpose';
    state.items.mainhand = {
      ...state.items.mainhand,
      name: 'Paladin weapon',
      nameKo: '나이트 무기',
      nameEn: 'Paladin Weapon',
      nameJa: 'ナイト武器',
      dye1: 'Snow White',
      dye2: 'None',
    };
    state.fashionAccessory = {
      id: 1,
      nameKo: '패션 소품',
      nameEn: 'Fashion Accessory',
      nameJa: 'ファッションアクセサリー',
    };

    const text = buildEquipmentShareText(state, 'en', {
      title: 'Character Glamour',
      creator: 'Creator',
      dye: 'Dye',
      slot: part => part === 'mainhand' ? 'Main Hand' : 'Fashion Accessory',
    });

    expect(text).toBe([
      'Moonlit look',
      'Creator: @gpose',
      '',
      'Main Hand: Paladin Weapon (Dye 1: Snow White)',
      'Fashion Accessory: Fashion Accessory',
    ].join('\n'));
  });
});
