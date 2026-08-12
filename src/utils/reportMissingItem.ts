import {
    getSafeStorage,
    readStorage,
    writeStorage,
    type StorageArea,
} from './safeStorage';

interface MissingItemReporterDependencies {
    fetchReport?: typeof fetch;
    storage?: StorageArea | null;
}

const REPORT_ENDPOINT = '/api/report-missing-item';
const SESSION_KEY_PREFIX = 'reported_missing_';

function hasStoredReport(storage: StorageArea | null, key: string): boolean {
    return readStorage(storage, key) !== null;
}

function storeSuccessfulReport(storage: StorageArea | null, key: string): void {
    writeStorage(storage, key, '1');
}

export function createMissingItemReporter(
    dependencies: MissingItemReporterDependencies = {},
) {
    const fetchReport = dependencies.fetchReport ?? fetch;
    const storage = dependencies.storage === undefined
        ? getSafeStorage('session')
        : dependencies.storage;
    const reportedInMemory = new Set<string>();
    const inFlight = new Map<string, Promise<void>>();

    return async function reportMissingItem(rawItemName: string): Promise<void> {
        const itemName = rawItemName?.trim();
        if (!itemName) return;

        const sessionKey = `${SESSION_KEY_PREFIX}${itemName}`;
        if (reportedInMemory.has(itemName) || hasStoredReport(storage, sessionKey)) {
            return;
        }

        const existingRequest = inFlight.get(itemName);
        if (existingRequest) return existingRequest;

        const request = (async () => {
            try {
                const response = await fetchReport(REPORT_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemName }),
                });
                if (!response.ok) return;

                reportedInMemory.add(itemName);
                storeSuccessfulReport(storage, sessionKey);
            } catch {
                // Missing-item reporting is best-effort and must not affect rendering.
            }
        })().finally(() => {
            inFlight.delete(itemName);
        });

        inFlight.set(itemName, request);
        return request;
    };
}

export const reportMissingItem = createMissingItemReporter();
