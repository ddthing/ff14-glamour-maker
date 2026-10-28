import { CURRENT_STATE_VERSION, decodeStateValue } from '../glamour/stateCodec';
import type { AppState } from '../../types';
import { isSupportedImageMimeType } from '../../constants/imageFormats';

const DATABASE_NAME = 'ff14-glamour-studio';
const DATABASE_VERSION = 1;
const DRAFTS_STORE = 'drafts';
const PHOTOS_STORE = 'photos';
const DRAFT_ID = 'current';
const PHOTO_IDS = ['imageSrc', 'croppedImageSrc'] as const;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 64;
const OPEN_TIMEOUT_MS = 5_000;
const IMAGE_DATA_URL = /^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/]*={0,2})$/i;

type PhotoId = (typeof PHOTO_IDS)[number];

interface StoredDraftRecord {
  id: typeof DRAFT_ID;
  schemaVersion: number;
  photoRevision: number;
  state: unknown;
}

interface StoredPhotoRecord {
  id: PhotoId;
  value: unknown;
}

export type StudioDraftLoadResult =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'valid' | 'recovered'; state: AppState };

export interface StudioDraftRepository {
  load: () => Promise<StudioDraftLoadResult>;
  save: (state: AppState) => Promise<void>;
}

function getIndexedDb(): IDBFactory | undefined {
  if (typeof globalThis === 'undefined' || !('indexedDB' in globalThis)) return undefined;
  return globalThis.indexedDB;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSafeImageDataUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > MAX_DATA_URL_LENGTH) return false;

  const match = IMAGE_DATA_URL.exec(value);
  if (!match || !isSupportedImageMimeType(match[1])) return false;

  const base64 = match[2];
  if (base64.length === 0 || base64.length % 4 !== 0) return false;
  const paddingLength = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  const byteLength = (base64.length / 4) * 3 - paddingLength;
  return byteLength > 0 && byteLength <= MAX_IMAGE_BYTES;
}

function validatePhoto(value: unknown): value is string | null {
  return value === null || isSafeImageDataUrl(value);
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'));
  });
}

function openDatabase(factory: IDBFactory | undefined): Promise<IDBDatabase> {
  if (!factory) return Promise.reject(new Error('IndexedDB is unavailable'));

  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('IndexedDB open timed out'));
    }, OPEN_TIMEOUT_MS);
    let request: IDBOpenDBRequest;
    try {
      request = factory.open(DATABASE_NAME, DATABASE_VERSION);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
      return;
    }

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(DRAFTS_STORE)) {
        database.createObjectStore(DRAFTS_STORE, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(PHOTOS_STORE)) {
        database.createObjectStore(PHOTOS_STORE, { keyPath: 'id' });
      }
    };
    request.onblocked = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(new Error('IndexedDB upgrade is blocked'));
    };
    request.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(request.error ?? new Error('Could not open IndexedDB'));
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      if (settled) {
        database.close();
        return;
      }
      settled = true;
      clearTimeout(timeout);
      resolve(database);
    };
  });
}

function readPhotoValue(value: unknown, id: PhotoId): unknown {
  if (value === undefined) return null;
  if (!isRecord(value) || value.id !== id || !Object.hasOwn(value, 'value')) return value;
  return value.value;
}

function getPhotoRevision(value: unknown): number | null {
  if (!isRecord(value) || value.id !== DRAFT_ID || value.schemaVersion !== DATABASE_VERSION) {
    return null;
  }
  // Records created before photo revisions were introduced are revision zero.
  if (value.photoRevision === undefined) return 0;
  return typeof value.photoRevision === 'number'
    && Number.isSafeInteger(value.photoRevision)
    && value.photoRevision >= 0
    ? value.photoRevision
    : null;
}

function decodeStoredDraft(
  draftValue: unknown,
  imageValue: unknown,
  croppedValue: unknown,
): StudioDraftLoadResult {
  if (draftValue === undefined) return { status: 'empty' };
  if (!isRecord(draftValue) || draftValue.id !== DRAFT_ID) return { status: 'invalid' };
  if (draftValue.schemaVersion !== DATABASE_VERSION || getPhotoRevision(draftValue) === null
    || !('state' in draftValue)) {
    return { status: 'invalid' };
  }

  const decoded = decodeStateValue(draftValue.state);
  if (decoded.status === 'invalid') return { status: 'invalid' };

  const warnings = [...decoded.warnings];
  const imageSrc = validatePhoto(imageValue) ? imageValue : null;
  const croppedImageSrc = validatePhoto(croppedValue) ? croppedValue : null;
  if (imageValue !== null && imageSrc === null) warnings.push('imageSrc was not a safe local image');
  if (croppedValue !== null && croppedImageSrc === null) {
    warnings.push('croppedImageSrc was not a safe local image');
  }

  return {
    status: warnings.length > 0 ? 'recovered' : 'valid',
    state: { ...decoded.state, imageSrc, croppedImageSrc },
  };
}

function createDraftRecord(state: AppState, photoRevision: number): StoredDraftRecord {
  const safeState = decodeStateValue({
    ...state,
    imageSrc: null,
    croppedImageSrc: null,
    version: CURRENT_STATE_VERSION,
  });
  if (safeState.status === 'invalid') throw new Error('The glamour draft is invalid');
  return {
    id: DRAFT_ID,
    schemaVersion: DATABASE_VERSION,
    photoRevision,
    state: safeState.state,
  };
}

export function createStudioDraftRepository(
  factory: IDBFactory | undefined = getIndexedDb(),
): StudioDraftRepository {
  // Keep the last stored values so repeated metadata edits do not copy the
  // (potentially 20 MB) uploaded photo into IndexedDB on every keystroke.
  let lastStoredPhotos: Record<PhotoId, unknown> = {
    imageSrc: undefined,
    croppedImageSrc: undefined,
  };
  let lastStoredPhotoWasValidated: Record<PhotoId, boolean> = {
    imageSrc: false,
    croppedImageSrc: false,
  };
  let hasLoadedPhotos = false;
  let lastKnownPhotoRevision: number | null = null;

  return {
    async load() {
      const database = await openDatabase(factory);
      try {
        const transaction = database.transaction([DRAFTS_STORE, PHOTOS_STORE], 'readonly');
        const draftStore = transaction.objectStore(DRAFTS_STORE);
        const photoStore = transaction.objectStore(PHOTOS_STORE);
        const done = transactionComplete(transaction);
        const [draftValue, imageRecord, croppedRecord] = await Promise.all([
          requestResult(draftStore.get(DRAFT_ID)),
          requestResult(photoStore.get('imageSrc')),
          requestResult(photoStore.get('croppedImageSrc')),
          done,
        ]);

        const imageValue = readPhotoValue(imageRecord, 'imageSrc');
        const croppedValue = readPhotoValue(croppedRecord, 'croppedImageSrc');
        lastStoredPhotos = { imageSrc: imageValue, croppedImageSrc: croppedValue };
        lastStoredPhotoWasValidated = {
          imageSrc: validatePhoto(imageValue),
          croppedImageSrc: validatePhoto(croppedValue),
        };
        lastKnownPhotoRevision = getPhotoRevision(draftValue);
        hasLoadedPhotos = true;
        return decodeStoredDraft(draftValue, imageValue, croppedValue);
      } finally {
        database.close();
      }
    },

    async save(state) {
      const photos: Record<PhotoId, string | null> = {
        imageSrc: state.imageSrc,
        croppedImageSrc: state.croppedImageSrc,
      };
      for (const id of PHOTO_IDS) {
        const unchangedAndKnownSafe = hasLoadedPhotos
          && Object.is(photos[id], lastStoredPhotos[id])
          && lastStoredPhotoWasValidated[id];
        if (!unchangedAndKnownSafe && !validatePhoto(photos[id])) {
          throw new Error(`Cannot save an unsafe local photo (${id})`);
        }
      }

      const metadataRecord = createDraftRecord(state, 0);
      const database = await openDatabase(factory);
      try {
        const transaction = database.transaction([DRAFTS_STORE, PHOTOS_STORE], 'readwrite');
        const draftStore = transaction.objectStore(DRAFTS_STORE);
        const photoStore = transaction.objectStore(PHOTOS_STORE);
        const done = transactionComplete(transaction);

        // Read the current revision from inside this readwrite transaction. A
        // stale tab must restore the photo snapshot that accompanies its full
        // AppState save, even when that tab's local photo string did not change.
        const currentDraftRequest = draftStore.get(DRAFT_ID);
        let committedPhotoRevision: number | null = null;
        currentDraftRequest.onsuccess = () => {
          const currentPhotoRevision = getPhotoRevision(currentDraftRequest.result);
          const photosChangedLocally = !hasLoadedPhotos
            || PHOTO_IDS.some(id => !Object.is(photos[id], lastStoredPhotos[id]));
          const photoRevisionIsStale = currentPhotoRevision === null
            || lastKnownPhotoRevision === null
            || currentPhotoRevision !== lastKnownPhotoRevision;
          const shouldWritePhotos = photosChangedLocally || photoRevisionIsStale;
          const nextPhotoRevision = Math.max(currentPhotoRevision ?? 0, lastKnownPhotoRevision ?? 0)
            + (shouldWritePhotos ? 1 : 0);

          draftStore.put({ ...metadataRecord, photoRevision: nextPhotoRevision });
          if (shouldWritePhotos) {
            for (const id of PHOTO_IDS) {
              if (photos[id] === null) photoStore.delete(id);
              else photoStore.put({ id, value: photos[id] } satisfies StoredPhotoRecord);
            }
          }
          committedPhotoRevision = nextPhotoRevision;
        };
        await done;
        if (committedPhotoRevision === null) throw new Error('Could not read the current draft revision');
        lastStoredPhotos = { ...photos };
        lastStoredPhotoWasValidated = { imageSrc: true, croppedImageSrc: true };
        lastKnownPhotoRevision = committedPhotoRevision;
        hasLoadedPhotos = true;
      } finally {
        database.close();
      }
    },
  };
}

export const studioDraftStorageConstants = {
  databaseName: DATABASE_NAME,
  databaseVersion: DATABASE_VERSION,
  draftsStore: DRAFTS_STORE,
  photosStore: PHOTOS_STORE,
} as const;
