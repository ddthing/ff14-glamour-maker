import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../glamour/stateFactory';
import type { AppState } from '../../types';
import { createStudioDraftRepository, studioDraftStorageConstants } from './draftStorage';

const IMAGE = 'data:image/png;base64,YWJj';
const CROPPED_IMAGE = 'data:image/jpeg;base64,ZGVm';

interface MemoryRequest<T = unknown> {
  result: T;
  error: DOMException | null;
  onsuccess: ((this: IDBRequest<T>, ev: Event) => unknown) | null;
  onerror: ((this: IDBRequest<T>, ev: Event) => unknown) | null;
  onupgradeneeded: ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => unknown) | null;
  onblocked: ((this: IDBOpenDBRequest, ev: Event) => unknown) | null;
}

class MemoryIndexedDb {
  readonly stores = new Map<string, Map<IDBValidKey, unknown>>();
  failWrites = false;
  failCommitAfterRequestSuccess = false;
  photoPuts = 0;

  open(): IDBOpenDBRequest {
    const request: MemoryRequest<IDBDatabase> = {
      result: undefined as unknown as IDBDatabase,
      error: null,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      onblocked: null,
    };
    queueMicrotask(() => {
      const database = new MemoryDatabase(this);
      request.result = database as unknown as IDBDatabase;
      request.onupgradeneeded?.call(request as unknown as IDBOpenDBRequest, new Event('upgradeneeded') as IDBVersionChangeEvent);
      request.onsuccess?.call(request as unknown as IDBOpenDBRequest, new Event('success'));
    });
    return request as unknown as IDBOpenDBRequest;
  }
}

class MemoryDatabase {
  private readonly owner: MemoryIndexedDb;

  constructor(owner: MemoryIndexedDb) {
    this.owner = owner;
  }

  get objectStoreNames(): DOMStringList {
    return {
      contains: (name: string) => this.owner.stores.has(name),
      item: (index: number) => [...this.owner.stores.keys()][index] ?? null,
      length: this.owner.stores.size,
      [Symbol.iterator]: function* () { yield* []; },
    } as DOMStringList;
  }

  createObjectStore(name: string): IDBObjectStore {
    if (!this.owner.stores.has(name)) this.owner.stores.set(name, new Map());
    return {} as IDBObjectStore;
  }

  transaction(storeNames: string | string[], mode: IDBTransactionMode): IDBTransaction {
    return new MemoryTransaction(this.owner, Array.isArray(storeNames) ? storeNames : [storeNames], mode) as unknown as IDBTransaction;
  }

  close(): void {}
}

class MemoryTransaction {
  oncomplete: ((this: IDBTransaction, ev: Event) => unknown) | null = null;
  onabort: ((this: IDBTransaction, ev: Event) => unknown) | null = null;
  onerror: ((this: IDBTransaction, ev: Event) => unknown) | null = null;
  error: DOMException | null = null;
  private pending = 0;
  private failed = false;
  private readonly owner: MemoryIndexedDb;
  private readonly storeNames: string[];
  private readonly mode: IDBTransactionMode;

  constructor(
    owner: MemoryIndexedDb,
    storeNames: string[],
    mode: IDBTransactionMode,
  ) {
    this.owner = owner;
    this.storeNames = storeNames;
    this.mode = mode;
  }

  objectStore(name: string): IDBObjectStore {
    if (!this.storeNames.includes(name)) throw new Error(`Store ${name} is outside the transaction`);
    const store = this.owner.stores.get(name);
    if (!store) throw new Error(`Store ${name} does not exist`);
    return {
      get: (key: IDBValidKey) => this.request(() => store.get(key)),
      put: (value: unknown) => {
        if (name === studioDraftStorageConstants.photosStore) this.owner.photoPuts += 1;
        return this.request(() => {
          const key = (value as { id: IDBValidKey }).id;
          store.set(key, value);
          return key;
        });
      },
      delete: (key: IDBValidKey) => this.request(() => {
        store.delete(key);
        return undefined;
      }),
    } as unknown as IDBObjectStore;
  }

  private request<T>(operation: () => T): IDBRequest<T> {
    const request: MemoryRequest<T> = {
      result: undefined as T,
      error: null,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      onblocked: null,
    };
    this.pending += 1;
    queueMicrotask(() => {
      if (this.mode === 'readwrite' && this.owner.failWrites) {
        this.fail(request);
      } else {
        request.result = operation();
        request.onsuccess?.call(request as unknown as IDBRequest<T>, new Event('success'));
        if (this.mode === 'readwrite' && this.owner.failCommitAfterRequestSuccess) {
          this.abortAfterSuccess();
        }
      }
      this.pending -= 1;
      if (this.pending === 0 && !this.failed) {
        queueMicrotask(() => this.oncomplete?.call(this as unknown as IDBTransaction, new Event('complete')));
      }
    });
    return request as unknown as IDBRequest<T>;
  }

  private fail<T>(request: MemoryRequest<T>): void {
    if (this.failed) return;
    this.failed = true;
    this.error = new DOMException('write rejected', 'UnknownError');
    request.error = this.error;
    request.onerror?.call(request as unknown as IDBRequest<T>, new Event('error'));
    this.onerror?.call(this as unknown as IDBTransaction, new Event('error'));
    this.onabort?.call(this as unknown as IDBTransaction, new Event('abort'));
  }

  private abortAfterSuccess(): void {
    if (this.failed) return;
    this.failed = true;
    this.error = new DOMException('commit rejected', 'UnknownError');
    this.onerror?.call(this as unknown as IDBTransaction, new Event('error'));
    this.onabort?.call(this as unknown as IDBTransaction, new Event('abort'));
  }
}

function createFactory(memoryDb: MemoryIndexedDb): IDBFactory {
  return { open: () => memoryDb.open() } as unknown as IDBFactory;
}

function readStored(memoryDb: MemoryIndexedDb, store: string, key: string): unknown {
  return memoryDb.stores.get(store)?.get(key);
}

let memoryDb: MemoryIndexedDb;

beforeEach(() => {
  memoryDb = new MemoryIndexedDb();
});

describe('studio draft storage', () => {
  it('round-trips validated app metadata and photo data through separate IndexedDB stores', async () => {
    const repository = createStudioDraftRepository(createFactory(memoryDb));
    const state: AppState = {
      ...createInitialState(),
      title: 'Moonlight set',
      imageSrc: IMAGE,
      croppedImageSrc: CROPPED_IMAGE,
    };

    await repository.save(state);

    expect(readStored(memoryDb, studioDraftStorageConstants.draftsStore, 'current')).toMatchObject({
      state: { title: 'Moonlight set', imageSrc: null, croppedImageSrc: null },
    });
    expect(readStored(memoryDb, studioDraftStorageConstants.photosStore, 'imageSrc'))
      .toEqual({ id: 'imageSrc', value: IMAGE });
    expect(memoryDb.photoPuts).toBe(2);

    const restored = await createStudioDraftRepository(createFactory(memoryDb)).load();
    expect(restored).toMatchObject({
      status: 'valid',
      state: { title: 'Moonlight set', imageSrc: IMAGE, croppedImageSrc: CROPPED_IMAGE },
    });
  });

  it('does not rewrite large photo payloads when only metadata changes', async () => {
    const repository = createStudioDraftRepository(createFactory(memoryDb));
    const first = { ...createInitialState(), imageSrc: IMAGE, croppedImageSrc: CROPPED_IMAGE };
    await repository.save(first);
    const second = { ...first, title: 'Changed title' };

    await repository.save(second);

    expect(memoryDb.photoPuts).toBe(2);
    expect(readStored(memoryDb, studioDraftStorageConstants.draftsStore, 'current'))
      .toMatchObject({ state: { title: 'Changed title' } });
  });

  it('keeps metadata and photo snapshots aligned when another tab changed the photo', async () => {
    const firstTab = createStudioDraftRepository(createFactory(memoryDb));
    const secondTab = createStudioDraftRepository(createFactory(memoryDb));
    const original = {
      ...createInitialState(),
      imageSrc: IMAGE,
      croppedImageSrc: CROPPED_IMAGE,
    };
    await firstTab.save(original);
    const loadedInSecondTab = await secondTab.load();
    expect(loadedInSecondTab.status).toBe('valid');

    await firstTab.save({
      ...original,
      imageSrc: 'data:image/png;base64,aW1n',
      croppedImageSrc: 'data:image/jpeg;base64,Y3JvcA==',
    });
    if (loadedInSecondTab.status !== 'valid') throw new Error('Expected a valid draft');
    await secondTab.save({ ...loadedInSecondTab.state, title: 'Second tab title' });

    const restored = await createStudioDraftRepository(createFactory(memoryDb)).load();
    expect(restored).toMatchObject({
      status: 'valid',
      state: {
        title: 'Second tab title',
        imageSrc: IMAGE,
        croppedImageSrc: CROPPED_IMAGE,
      },
    });
  });

  it('drops malformed locally stored photos and rewrites them safely', async () => {
    const repository = createStudioDraftRepository(createFactory(memoryDb));
    await repository.save({ ...createInitialState(), imageSrc: IMAGE, croppedImageSrc: CROPPED_IMAGE });
    memoryDb.stores.get(studioDraftStorageConstants.photosStore)?.set('imageSrc', {
      id: 'imageSrc', value: 'data:image/svg+xml,<svg onload=alert(1) />',
    });

    const restored = await repository.load();
    expect(restored.status).toBe('recovered');
    if (restored.status !== 'recovered') throw new Error('Expected a recovered draft');
    expect(restored.state.imageSrc).toBeNull();
    expect(restored.state.croppedImageSrc).toBe(CROPPED_IMAGE);

    await repository.save(restored.state);
    expect(readStored(memoryDb, studioDraftStorageConstants.photosStore, 'imageSrc')).toBeUndefined();
  });

  it('rejects unsafe photo values and waits for transaction completion before resolving saves', async () => {
    const repository = createStudioDraftRepository(createFactory(memoryDb));
    await expect(repository.save({ ...createInitialState(), imageSrc: 'https://example.com/photo.png' }))
      .rejects.toThrow('unsafe local photo');

    memoryDb.failWrites = true;
    await expect(repository.save({ ...createInitialState(), imageSrc: IMAGE }))
      .rejects.toThrow('write rejected');

    memoryDb.failWrites = false;
    memoryDb.failCommitAfterRequestSuccess = true;
    await expect(repository.save({ ...createInitialState(), imageSrc: IMAGE }))
      .rejects.toThrow('commit rejected');
  });

  it('reports an unavailable database rather than returning a saved draft', async () => {
    const repository = createStudioDraftRepository(undefined);
    await expect(repository.load()).rejects.toThrow('IndexedDB is unavailable');
    await expect(repository.save(createInitialState())).rejects.toThrow('IndexedDB is unavailable');
  });

  it('fails a blocked database open instead of leaving hydration pending', async () => {
    const factory = {
      open: () => {
        const request: MemoryRequest<IDBDatabase> = {
          result: undefined as unknown as IDBDatabase,
          error: null,
          onsuccess: null,
          onerror: null,
          onupgradeneeded: null,
          onblocked: null,
        };
        queueMicrotask(() => {
          request.onblocked?.call(request as unknown as IDBOpenDBRequest, new Event('blocked'));
        });
        return request as unknown as IDBOpenDBRequest;
      },
    } as unknown as IDBFactory;

    await expect(createStudioDraftRepository(factory).load()).rejects.toThrow('blocked');
  });
});
