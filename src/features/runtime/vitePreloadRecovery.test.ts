import { describe, expect, it, vi } from 'vitest';
import {
  installVitePreloadRecovery,
  preloadRecoveryStorageKey,
} from './vitePreloadRecovery';

function createPreloadError(payload: unknown): Event & { payload: unknown } {
  const event = new Event('vite:preloadError', { cancelable: true }) as Event & {
    payload: unknown;
  };
  event.payload = payload;
  return event;
}

function createStorage() {
  const values = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
  };
}

describe('installVitePreloadRecovery', () => {
  it('ignores ordinary resource errors', () => {
    const eventTarget = new EventTarget();
    const reload = vi.fn();

    installVitePreloadRecovery({ eventTarget, storage: createStorage(), reload });
    eventTarget.dispatchEvent(new Event('error', { cancelable: true }));

    expect(reload).not.toHaveBeenCalled();
  });

  it('prevents and reloads once for the first preload failure', () => {
    const eventTarget = new EventTarget();
    const storage = createStorage();
    const reload = vi.fn();
    const payload = new TypeError(
      'Failed to fetch dynamically imported module: /assets/Guide-old.js',
    );
    const event = createPreloadError(payload);

    installVitePreloadRecovery({ eventTarget, storage, reload });
    eventTarget.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(
      preloadRecoveryStorageKey(payload),
      '1',
    );
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not suppress or reload a repeated failure', () => {
    const eventTarget = new EventTarget();
    const reload = vi.fn();
    const payload = new TypeError(
      'Failed to fetch dynamically imported module: /assets/Guide-old.js',
    );

    installVitePreloadRecovery({
      eventTarget,
      storage: createStorage(),
      reload,
    });
    eventTarget.dispatchEvent(createPreloadError(payload));

    const repeatedEvent = createPreloadError(payload);
    eventTarget.dispatchEvent(repeatedEvent);

    expect(repeatedEvent.defaultPrevented).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('uses persisted failures to block a reload after reinstall', () => {
    const storage = createStorage();
    const payload = new Error(
      'Failed to fetch dynamically imported module: /assets/About-old.js',
    );

    const firstTarget = new EventTarget();
    installVitePreloadRecovery({
      eventTarget: firstTarget,
      storage,
      reload: vi.fn(),
    });
    firstTarget.dispatchEvent(createPreloadError(payload));

    const nextTarget = new EventTarget();
    const nextReload = vi.fn();
    installVitePreloadRecovery({
      eventTarget: nextTarget,
      storage,
      reload: nextReload,
    });
    const repeatedEvent = createPreloadError(payload);
    nextTarget.dispatchEvent(repeatedEvent);

    expect(repeatedEvent.defaultPrevented).toBe(false);
    expect(nextReload).not.toHaveBeenCalled();
  });

  it('falls back to memory when storage access throws', () => {
    const eventTarget = new EventTarget();
    const reload = vi.fn();
    const storage = {
      getItem: vi.fn(() => {
        throw new Error('storage blocked');
      }),
      setItem: vi.fn(() => {
        throw new Error('storage blocked');
      }),
    };
    const payload = 'chunk-load-failed';

    installVitePreloadRecovery({ eventTarget, storage, reload });
    eventTarget.dispatchEvent(createPreloadError(payload));
    eventTarget.dispatchEvent(createPreloadError(payload));

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('removes its listener when uninstalled', () => {
    const eventTarget = new EventTarget();
    const reload = vi.fn();
    const uninstall = installVitePreloadRecovery({
      eventTarget,
      storage: createStorage(),
      reload,
    });

    uninstall();
    eventTarget.dispatchEvent(createPreloadError('chunk-load-failed'));

    expect(reload).not.toHaveBeenCalled();
  });
});
