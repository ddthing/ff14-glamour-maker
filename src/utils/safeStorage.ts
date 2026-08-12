export type StorageArea = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type StorageKind = 'local' | 'session';

export function getSafeStorage(kind: StorageKind): StorageArea | null {
  try {
    if (typeof window === 'undefined') return null;
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStorage(storage: StorageArea | null, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStorage(
  storage: StorageArea | null,
  key: string,
  value: string,
): boolean {
  try {
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(storage: StorageArea | null, key: string): boolean {
  try {
    if (!storage) return false;
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
