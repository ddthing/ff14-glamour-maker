import { describe, expect, it } from 'vitest';
import { INITIAL_STATE } from '../../constants/initialState';
import {
  decodeStateValue,
} from './stateCodec';

describe('stateCodec', () => {
  it('migrates an unversioned preset and adds a safe offhand default', () => {
    const result = decodeStateValue({
      title: '여름 투영',
      creator: '테스터',
      items: {
        mainhand: {
          id: 'mainhand',
          label: '',
          name: '죽음낫',
          nameKo: '죽음낫',
          nameEn: 'Death Sickle',
          nameJa: 'デスシックル',
        },
      },
    });

    expect(result.status).toBe('valid');
    expect(result.state.title).toBe('여름 투영');
    expect(result.state.items.mainhand.nameJa).toBe('デスシックル');
    expect(result.state.items.offhand).toEqual({
      id: 'offhand',
      label: '',
      name: '',
    });
  });

  it('recovers safely from malformed fields and unknown slots', () => {
    const result = decodeStateValue({
      title: 123,
      items: {
        head: { name: 999, nameEn: 'Valid fallback' },
        exploit: { name: 'not a slot' },
      },
    });

    expect(result.status).toBe('recovered');
    expect(result.state.title).toBe(INITIAL_STATE.title);
    expect(result.state.items.head.name).toBe('');
    expect('exploit' in result.state.items).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('ignores obsolete photo and crop fields in legacy preset values', () => {
    const result = decodeStateValue({
      title: 'Legacy preset',
      creator: '@legacy',
      imageSrc: 'data:image/png;base64,legacy',
      croppedImageSrc: 'blob:legacy-photo',
      crop: { x: 'bad', y: 20 },
      zoom: 'huge',
      items: {},
    });

    expect(result.status).toBe('valid');
    expect(result.state.title).toBe('Legacy preset');
    expect(result.state.creator).toBe('@legacy');
    expect(result.state).not.toHaveProperty('imageSrc');
    expect(result.state).not.toHaveProperty('crop');
    expect(result.state).not.toHaveProperty('zoom');
    expect(result.state.croppedImageSrc).toBeNull();
  });

  it('returns the initial state for a broken preset value', () => {
    const result = decodeStateValue('not-an-object');

    expect(result.status).toBe('invalid');
    expect(result.state).toEqual(INITIAL_STATE);
  });

  it('migrates legacy preset values through the same validation path', () => {
    const result = decodeStateValue({
      title: '기존 프리셋',
      creator: '작성자',
      items: {
        body: { id: 'body', label: '', name: '2호 B형 전투복' },
      },
    });

    expect(result.state.items.body.name).toBe('2호 B형 전투복');
    expect(result.state.items.offhand.name).toBe('');
  });
});
