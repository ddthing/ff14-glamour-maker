import { describe, expect, it } from 'vitest';
import { FF14_DYES } from './dyes';

describe('localized dye names', () => {
  it('uses the correct Peacock Blue name in Korean, English, and Japanese', () => {
    const dye = FF14_DYES.find(candidate => candidate.nameEn === 'Peacock Blue');

    expect(dye).toMatchObject({
      name: '공작깃 파란색',
      nameEn: 'Peacock Blue',
      nameJa: 'ピーコックブルー',
    });
  });
});
