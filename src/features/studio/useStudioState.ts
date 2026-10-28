import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { createInitialState } from '../glamour/stateFactory';
import type { AppState } from '../../types';
import { createStudioDraftRepository, type StudioDraftRepository } from './draftStorage';

export type StudioDraftStatus = 'loading' | 'saving' | 'saved' | 'unavailable';

export interface UseStudioStateResult {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  draftStatus: StudioDraftStatus;
  retrySave: () => void;
}

interface HistoryState {
  past: AppState[];
  future: AppState[];
  lastTextChange: { key: string; at: number } | null;
}

const HISTORY_LIMIT = 50;
const TEXT_COALESCE_WINDOW_MS = 700;
const DRAFT_SAVE_DEBOUNCE_MS = 400;
export const STUDIO_HISTORY_PHOTO_MEMORY_LIMIT_BYTES = 64 * 1024 * 1024;

const COALESCIBLE_ITEM_FIELDS = new Set([
  'name', 'nameKo', 'nameEn', 'nameJa', 'dye1', 'dye2',
]);
const COALESCIBLE_ACCESSORY_FIELDS = new Set(['nameKo', 'nameEn', 'nameJa']);

function equalValues(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (typeof left !== 'object' || left === null || typeof right !== 'object' || right === null) {
    return false;
  }

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every(key => Object.hasOwn(right, key)
    && equalValues((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key]));
}

function collectChangedPaths(
  before: unknown,
  after: unknown,
  path: string[] = [],
  changes: string[] = [],
): string[] {
  if (Object.is(before, after)) return changes;

  if (typeof before !== 'object' || before === null || typeof after !== 'object' || after === null) {
    changes.push(path.join('.'));
    return changes;
  }

  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    if (!Object.hasOwn(before, key) || !Object.hasOwn(after, key)) {
      changes.push([...path, key].join('.'));
    } else {
      collectChangedPaths(
        (before as Record<string, unknown>)[key],
        (after as Record<string, unknown>)[key],
        [...path, key],
        changes,
      );
    }
    if (changes.length > 1) return changes;
  }
  return changes;
}

function getCoalescingKey(before: AppState, after: AppState): string | null {
  const paths = collectChangedPaths(before, after);
  if (paths.length !== 1) return null;

  const path = paths[0].split('.');
  if (path.length === 1 && (path[0] === 'title' || path[0] === 'creator')
    && typeof before[path[0]] === 'string' && typeof after[path[0]] === 'string') {
    return path[0];
  }
  if (path.length === 3 && path[0] === 'items' && COALESCIBLE_ITEM_FIELDS.has(path[2])) {
    const beforeItem = before.items[path[1] as keyof AppState['items']];
    const afterItem = after.items[path[1] as keyof AppState['items']];
    return typeof beforeItem?.[path[2] as keyof typeof beforeItem] === 'string'
      && typeof afterItem?.[path[2] as keyof typeof afterItem] === 'string'
      ? path.join('.')
      : null;
  }
  if (path.length === 2 && path[0] === 'fashionAccessory'
    && COALESCIBLE_ACCESSORY_FIELDS.has(path[1])) {
    const beforeAccessory = before.fashionAccessory;
    const afterAccessory = after.fashionAccessory;
    return beforeAccessory && afterAccessory
      && typeof beforeAccessory[path[1] as keyof typeof beforeAccessory] === 'string'
      && typeof afterAccessory[path[1] as keyof typeof afterAccessory] === 'string'
      ? path.join('.')
      : null;
  }
  return null;
}

function pushBounded(history: AppState[], snapshot: AppState): AppState[] {
  const next = [...history, snapshot];
  if (next.length > HISTORY_LIMIT) next.splice(0, next.length - HISTORY_LIMIT);
  return next;
}

function estimateUniquePhotoBytes(states: readonly AppState[]): number {
  const photos = new Set<string>();
  for (const snapshot of states) {
    if (snapshot.imageSrc) photos.add(snapshot.imageSrc);
    if (snapshot.croppedImageSrc) photos.add(snapshot.croppedImageSrc);
  }

  let bytes = 0;
  for (const photo of photos) bytes += photo.length * 2;
  return bytes;
}

function trimPhotoHistory(history: HistoryState, current: AppState): void {
  const currentPhotoBytes = estimateUniquePhotoBytes([current]);
  const estimate = () => estimateUniquePhotoBytes([current, ...history.past, ...history.future]);
  let retainedPhotoBytes = estimate();

  // Remove the oldest undo snapshots first; when already undone, preserve the
  // nearest redo steps and discard the farthest ones only if still necessary.
  while (retainedPhotoBytes > STUDIO_HISTORY_PHOTO_MEMORY_LIMIT_BYTES
    && retainedPhotoBytes > currentPhotoBytes && history.past.length > 0) {
    history.past.shift();
    retainedPhotoBytes = estimate();
  }
  while (retainedPhotoBytes > STUDIO_HISTORY_PHOTO_MEMORY_LIMIT_BYTES
    && retainedPhotoBytes > currentPhotoBytes && history.future.length > 0) {
    history.future.shift();
    retainedPhotoBytes = estimate();
  }
}

export function useStudioState(): UseStudioStateResult {
  const [state, setReactState] = useState<AppState>(createInitialState);
  const stateRef = useRef(state);
  const historyRef = useRef<HistoryState>({ past: [], future: [], lastTextChange: null });
  const [historyCounts, setHistoryCounts] = useState({ past: 0, future: 0 });
  const [draftStatus, setDraftStatus] = useState<StudioDraftStatus>('loading');
  const [hydrated, setHydrated] = useState(false);
  const [saveRevision, setSaveRevision] = useState(0);
  const hydratedRef = useRef(false);
  const hasUserEditedRef = useRef(false);
  const retryRequestedDuringLoadRef = useRef(false);
  const repairDraftRef = useRef(false);
  const saveRequestIdRef = useRef(0);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const repositoryRef = useRef<StudioDraftRepository | null>(null);

  if (repositoryRef.current === null) repositoryRef.current = createStudioDraftRepository();

  const commit = useCallback((
    nextState: AppState,
    historyMode: 'record' | 'preserve' | 'reset',
    shouldSave: boolean,
  ) => {
    if (historyMode === 'reset') {
      historyRef.current = { past: [], future: [], lastTextChange: null };
      setHistoryCounts({ past: 0, future: 0 });
    }
    const previous = stateRef.current;
    if (equalValues(previous, nextState)) return;

    if (historyMode === 'record') {
      const history = historyRef.current;
      const now = Date.now();
      const coalescingKey = getCoalescingKey(previous, nextState);
      const canCoalesce = coalescingKey !== null
        && history.lastTextChange?.key === coalescingKey
        && now - history.lastTextChange.at <= TEXT_COALESCE_WINDOW_MS;

      history.past = canCoalesce ? history.past : pushBounded(history.past, previous);
      history.future = [];
      history.lastTextChange = coalescingKey === null ? null : { key: coalescingKey, at: now };
      trimPhotoHistory(history, nextState);
      setHistoryCounts({ past: history.past.length, future: 0 });
    }

    stateRef.current = nextState;
    setReactState(nextState);
    if (shouldSave) {
      hasUserEditedRef.current = true;
      if (hydratedRef.current) setSaveRevision(value => value + 1);
    }
  }, []);

  const setState = useCallback<Dispatch<SetStateAction<AppState>>>((next) => {
    const current = stateRef.current;
    const resolved = typeof next === 'function'
      ? (next as (previous: AppState) => AppState)(current)
      : next;
    commit(resolved, 'record', true);
  }, [commit]);

  const undo = useCallback(() => {
    const history = historyRef.current;
    const previous = history.past.pop();
    if (!previous) return;
    history.future.push(stateRef.current);
    history.lastTextChange = null;
    commit(previous, 'preserve', true);
    setHistoryCounts({ past: history.past.length, future: history.future.length });
  }, [commit]);

  const redo = useCallback(() => {
    const history = historyRef.current;
    const next = history.future.pop();
    if (!next) return;
    history.past = pushBounded(history.past, stateRef.current);
    history.lastTextChange = null;
    commit(next, 'preserve', true);
    setHistoryCounts({ past: history.past.length, future: history.future.length });
  }, [commit]);

  const retrySave = useCallback(() => {
    if (hydratedRef.current) {
      setDraftStatus('saving');
      setSaveRevision(value => value + 1);
    } else {
      retryRequestedDuringLoadRef.current = true;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const repository = repositoryRef.current;
    if (!repository) return undefined;

    void repository.load().then(result => {
      if (cancelled) return;

      const returnedToInitial = hasUserEditedRef.current
        && equalValues(stateRef.current, createInitialState());
      if (returnedToInitial) {
        hasUserEditedRef.current = false;
        commit(stateRef.current, 'reset', false);
      }
      const preserveLocalEdits = hasUserEditedRef.current;
      const retryRequested = retryRequestedDuringLoadRef.current;
      retryRequestedDuringLoadRef.current = false;

      if (result.status === 'valid' || result.status === 'recovered') {
        if (!preserveLocalEdits) {
          commit(result.state, 'reset', false);
          if (result.status === 'recovered') {
            repairDraftRef.current = true;
            setSaveRevision(value => value + 1);
            setDraftStatus('saving');
          } else {
            setDraftStatus('saved');
            if (retryRequested) setSaveRevision(value => value + 1);
          }
        } else {
          setSaveRevision(value => value + 1);
        }
      } else if (result.status === 'empty') {
        setDraftStatus('saved');
        if (preserveLocalEdits || retryRequested) setSaveRevision(value => value + 1);
      } else {
        setDraftStatus('unavailable');
        if (preserveLocalEdits || retryRequested) setSaveRevision(value => value + 1);
      }
    }).catch(() => {
      if (!cancelled) {
        const returnedToInitial = hasUserEditedRef.current
          && equalValues(stateRef.current, createInitialState());
        if (returnedToInitial) {
          hasUserEditedRef.current = false;
          commit(stateRef.current, 'reset', false);
        }
        const preserveLocalEdits = hasUserEditedRef.current;
        const retryRequested = retryRequestedDuringLoadRef.current;
        retryRequestedDuringLoadRef.current = false;
        setDraftStatus('unavailable');
        if (preserveLocalEdits || retryRequested) setSaveRevision(value => value + 1);
      }
    }).finally(() => {
      if (!cancelled) {
        hydratedRef.current = true;
        setHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [commit]);

  useEffect(() => {
    if (!hydrated || (saveRevision === 0 && !repairDraftRef.current)) return undefined;
    let cancelled = false;
    const requestId = ++saveRequestIdRef.current;
    setDraftStatus('saving');

    const timeout = window.setTimeout(() => {
      const snapshot = stateRef.current;
      const repository = repositoryRef.current;
      if (!repository) {
        if (!cancelled && requestId === saveRequestIdRef.current) setDraftStatus('unavailable');
        return;
      }

      const task = saveQueueRef.current
        .catch(() => undefined)
        .then(() => repository.save(snapshot));
      saveQueueRef.current = task;
      void task.then(() => {
        if (cancelled || requestId !== saveRequestIdRef.current) return;
        repairDraftRef.current = false;
        setDraftStatus('saved');
      }).catch(() => {
        if (!cancelled && requestId === saveRequestIdRef.current) setDraftStatus('unavailable');
      });
    }, DRAFT_SAVE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [hydrated, saveRevision]);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: historyCounts.past > 0,
    canRedo: historyCounts.future > 0,
    draftStatus,
    retrySave,
  };
}
