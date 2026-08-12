import { describe, expect, it, vi } from 'vitest';
import { createMissingItemReporter } from './reportMissingItem';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('missing-item reporter', () => {
  it('sends only the normalized item name to the same-origin endpoint', async () => {
    const fetchReport = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, { status: 204 }),
    );
    const report = createMissingItemReporter({ fetchReport, storage: createStorage() });

    await report('  투영 장비  ');

    expect(fetchReport).toHaveBeenCalledWith('/api/report-missing-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemName: '투영 장비' }),
    });
  });

  it('suppresses duplicate successful reports in memory and storage', async () => {
    const fetchReport = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, { status: 204 }),
    );
    const report = createMissingItemReporter({ fetchReport, storage: createStorage() });

    await report('Missing item');
    await report('Missing item');

    expect(fetchReport).toHaveBeenCalledOnce();
  });

  it('coalesces concurrent reports for the same item', async () => {
    let resolveRequest: ((response: Response) => void) | undefined;
    const fetchReport = vi.fn<typeof fetch>().mockReturnValue(
      new Promise(resolve => { resolveRequest = resolve; }),
    );
    const report = createMissingItemReporter({ fetchReport, storage: createStorage() });

    const first = report('Missing item');
    const second = report('Missing item');
    resolveRequest?.(new Response(null, { status: 204 }));
    await Promise.all([first, second]);

    expect(fetchReport).toHaveBeenCalledOnce();
  });

  it('allows a later retry after a failed request', async () => {
    const fetchReport = vi.fn<typeof fetch>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const report = createMissingItemReporter({ fetchReport, storage: createStorage() });

    await report('Missing item');
    await report('Missing item');

    expect(fetchReport).toHaveBeenCalledTimes(2);
  });

  it('continues when browser storage is unavailable', async () => {
    const fetchReport = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, { status: 204 }),
    );
    const storage = {
      getItem: () => { throw new Error('storage denied'); },
      setItem: () => { throw new Error('storage denied'); },
      removeItem: () => { throw new Error('storage denied'); },
    };
    const report = createMissingItemReporter({ fetchReport, storage });

    await report('Missing item');

    expect(fetchReport).toHaveBeenCalledOnce();
  });
});
