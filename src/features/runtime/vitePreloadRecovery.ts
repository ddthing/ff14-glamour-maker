interface RecoveryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface VitePreloadRecoveryOptions {
  eventTarget: EventTarget;
  storage?: RecoveryStorage | null;
  reload: () => void;
}

type VitePreloadErrorEvent = Event & {
  payload?: unknown;
};

const STORAGE_KEY_PREFIX = 'ff14:vite-preload-recovery:';

function describePayload(payload: unknown): string {
  if (payload instanceof Error) {
    return `${payload.name}:${payload.message}`;
  }

  if (typeof payload === 'string') return payload;

  try {
    return JSON.stringify(payload) ?? String(payload);
  } catch {
    return String(payload);
  }
}

function hashString(value: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36);
}

export function preloadRecoveryStorageKey(payload: unknown): string {
  return `${STORAGE_KEY_PREFIX}${hashString(describePayload(payload))}`;
}

function wasPersisted(storage: RecoveryStorage | null, key: string): boolean {
  try {
    return storage?.getItem(key) === '1';
  } catch {
    return false;
  }
}

function persistFailure(storage: RecoveryStorage | null, key: string): void {
  try {
    storage?.setItem(key, '1');
  } catch {
    // The in-memory guard still bounds recovery in restricted browsers.
  }
}

export function installVitePreloadRecovery({
  eventTarget,
  storage = null,
  reload,
}: VitePreloadRecoveryOptions): () => void {
  const recoveredInMemory = new Set<string>();

  const handlePreloadError: EventListener = rawEvent => {
    const event = rawEvent as VitePreloadErrorEvent;
    const key = preloadRecoveryStorageKey(event.payload);

    if (recoveredInMemory.has(key) || wasPersisted(storage, key)) {
      return;
    }

    recoveredInMemory.add(key);
    persistFailure(storage, key);
    event.preventDefault();
    reload();
  };

  eventTarget.addEventListener('vite:preloadError', handlePreloadError);

  return () => {
    eventTarget.removeEventListener('vite:preloadError', handlePreloadError);
  };
}
