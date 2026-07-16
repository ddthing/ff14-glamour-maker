import { describe, expect, it } from 'vitest';
import { INITIAL_STATE } from '../../constants/initialState';
import { decodeStateHash } from './stateCodec';
import { createShareUrl } from './shareUrl';

describe('createShareUrl', () => {
  it('uses the latest state instead of a stale browser hash', () => {
    const state = { ...INITIAL_STATE, title: '방금 변경한 투영 세트' };
    const url = createShareUrl(state, {
      origin: 'https://example.com',
      pathname: '/maker',
      search: '?from=profile',
    });
    const parsed = new URL(url);

    expect(`${parsed.origin}${parsed.pathname}${parsed.search}`).toBe(
      'https://example.com/maker?from=profile',
    );
    expect(decodeStateHash(parsed.hash).state.title).toBe('방금 변경한 투영 세트');
  });
});
