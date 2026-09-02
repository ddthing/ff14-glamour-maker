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

  it('keeps every dye name in the script of its locale', () => {
    for (const dye of FF14_DYES) {
      expect(dye.name, `${dye.nameEn} Korean name`).not.toMatch(/[A-Za-z\u3040-\u30ff]/u);
      expect(dye.nameEn, `${dye.name} English name`).not.toMatch(/[\uAC00-\uD7A3\u3040-\u30ff]/u);
      expect(dye.nameJa, `${dye.nameEn} Japanese name`).toBeTruthy();
      expect(dye.nameJa, `${dye.nameEn} Japanese name`).not.toMatch(/[A-Za-z\uAC00-\uD7A3]/u);
    }
  });
});
