interface ReportStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

interface MissingItemReporterDependencies {
    fetchReport?: typeof fetch;
    storage?: ReportStorage | null;
}

const REPORT_ENDPOINT = '/api/report-missing-item';
const SESSION_KEY_PREFIX = 'reported_missing_';

function getDefaultStorage(): ReportStorage | null {
    try {
        return typeof sessionStorage === 'undefined' ? null : sessionStorage;
    } catch {
        return null;
    }
}

function hasStoredReport(storage: ReportStorage | null, key: string): boolean {
    try {
        return storage?.getItem(key) !== null;
    } catch {
        return false;
    }
}

function storeSuccessfulReport(storage: ReportStorage | null, key: string): void {
    try {
        storage?.setItem(key, '1');
    } catch {
        // Restricted-storage browsers still retain the in-memory guard.
    }
}

export function createMissingItemReporter(
    dependencies: MissingItemReporterDependencies = {},
) {
    const fetchReport = dependencies.fetchReport ?? fetch;
    const storage = dependencies.storage === undefined
        ? getDefaultStorage()
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
                // Reporting is best-effort and must not affect icon rendering.
            }
        })().finally(() => {
            inFlight.delete(itemName);
        });

        inFlight.set(itemName, request);
        return request;
    };
}

export const reportMissingItem = createMissingItemReporter();

