import { useEffect, useRef, useState } from 'react';
import { decodeStateHash, encodeStateHash } from '../features/glamour/stateCodec';
import type { AppState } from '../types';

export function useUrlState(): [AppState, React.Dispatch<React.SetStateAction<AppState>>] {
  const [state, setState] = useState<AppState>(() => {
    const result = decodeStateHash(window.location.hash);
    if (result.warnings.length > 0) {
      console.warn('[useUrlState] Recovered URL state', result.warnings);
    }
    return result.state;
  });

  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.history.replaceState(null, '', encodeStateHash(state));
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [state]);

  return [state, setState];
}
