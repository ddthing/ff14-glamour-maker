import { describe, expect, it } from 'vitest';
import { INITIAL_STATE } from '../../constants/initialState';
import {
  CURRENT_STATE_VERSION,
  decodeStateHash,
  decodeStateValue,
  encodeStateHash,
} from './stateCodec';

function encodeLegacy(value: object): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return `#data=${btoa(binary)}`;
}

describe('stateCodec', () => {
  it('migrates an unversioned link and adds a safe offhand default', () => {
    const hash = encodeLegacy({
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

    const result = decodeStateHash(hash);

    expect(result.status).toBe('valid');
    expect(result.state.title).toBe('여름 투영');
    expect(result.state.items.mainhand.nameJa).toBe('デスシックル');
    expect(result.state.items.offhand).toEqual({
      id: 'offhand',
      label: '',
      name: '',
    });
  });

  it('round-trips Unicode without serializing uploaded images', () => {
    const state = {
      ...INITIAL_STATE,
      title: '星빛 Glamour',
      creator: '제작자',
      imageSrc: 'data:image/png;base64,large',
      croppedImageSrc: 'data:image/png;base64,cropped',
      items: {
        ...INITIAL_STATE.items,
        head: {
          ...INITIAL_STATE.items.head,
          name: '안경',
          nameKo: '안경',
          nameEn: 'Glasses',
          nameJa: '眼鏡',
        },
      },
    };

    const hash = encodeStateHash(state);
    const decodedJson = new TextDecoder().decode(
      Uint8Array.from(atob(hash.slice('#data='.length)), char => char.charCodeAt(0)),
    );

    expect(JSON.parse(decodedJson).version).toBe(CURRENT_STATE_VERSION);
    expect(decodedJson).not.toContain('data:image');
    expect(decodeStateHash(hash).state).toMatchObject({
      title: '星빛 Glamour',
      creator: '제작자',
      imageSrc: null,
      croppedImageSrc: null,
    });
  });

  it('recovers safely from malformed fields and unknown slots', () => {
    const hash = encodeLegacy({
      title: 123,
      zoom: 'huge',
      crop: { x: 'bad', y: 20 },
      items: {
        head: { name: 999, nameEn: 'Valid fallback' },
        exploit: { name: 'not a slot' },
      },
    });

    const result = decodeStateHash(hash);

    expect(result.status).toBe('recovered');
    expect(result.state.title).toBe(INITIAL_STATE.title);
    expect(result.state.zoom).toBe(INITIAL_STATE.zoom);
    expect(result.state.crop).toEqual({ x: 0, y: 20 });
    expect(result.state.items.head.name).toBe('');
    expect('exploit' in result.state.items).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('returns the initial state for a broken hash', () => {
    const result = decodeStateHash('#data=not-valid-base64');

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
