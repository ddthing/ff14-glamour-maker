import type { AppState } from '../../types';
import { encodeStateHash } from './stateCodec';

export interface ShareLocation {
  origin: string;
  pathname: string;
  search: string;
}

export function createShareUrl(state: AppState, location: ShareLocation): string {
  return `${location.origin}${location.pathname}${location.search}${encodeStateHash(state)}`;
}
