import { useCallback, useEffect, useRef, useState } from 'react';
import { createShareUrl } from '../features/glamour/shareUrl';
import type { AppState } from '../types';

export type ShareStatus = 'idle' | 'copied' | 'error';

export function useShareLink(state: AppState) {
  const [status, setStatus] = useState<ShareStatus>('idle');
  const resetTimeoutRef = useRef<number | null>(null);

  const copyLink = useCallback(async () => {
    if (resetTimeoutRef.current !== null) window.clearTimeout(resetTimeoutRef.current);

    try {
      await navigator.clipboard.writeText(createShareUrl(state, window.location));
      setStatus('copied');
      resetTimeoutRef.current = window.setTimeout(() => setStatus('idle'), 2_000);
    } catch (error: unknown) {
      console.error('[useShareLink] Copy failed', error);
      setStatus('error');
    }
  }, [state]);

  useEffect(() => () => {
    if (resetTimeoutRef.current !== null) window.clearTimeout(resetTimeoutRef.current);
  }, []);

  return { status, copyLink };
}
