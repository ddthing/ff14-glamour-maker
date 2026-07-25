import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMissingItemReporter } from './reportMissingItem';

function okResponse(): Response {
  return new Response(null, { status: 204 });
}

describe('createMissingItemReporter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends only the trimmed item name to the same-origin API', async () => {
    const fetchReport = vi.fn<typeof fetch>().mockResolvedValue(okResponse());
    const storage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    };
    const report = createMissingItemReporter({ fetchReport, storage });

    await report('  투영 장비  ');

    expect(fetchReport).toHaveBeenCalledOnce();
    expect(fetchReport).toHaveBeenCalledWith('/api/report-missing-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemName: '투영 장비' }),
    });
    expect(storage.setItem).toHaveBeenCalledWith('reported_missing_투영 장비', '1');
  });

  it('suppresses later reports after a successful response', async () => {
    const fetchReport = vi.fn<typeof fetch>().mockResolvedValue(okResponse());
    const report = createMissingItemReporter({
      fetchReport,
      storage: { getItem: () => null, setItem: () => undefined },
    });

    await report('Item');
    await report('Item');

    expect(fetchReport).toHaveBeenCalledOnce();
  });

  it('coalesces concurrent reports for the same item', async () => {
    let resolveResponse: ((response: Response) => void) | undefined;
    const fetchReport = vi.fn<typeof fetch>().mockImplementation(
      () => new Promise(resolve => {
        resolveResponse = resolve;
      }),
    );
    const report = createMissingItemReporter({
      fetchReport,
      storage: { getItem: () => null, setItem: () => undefined },
    });

    const first = report('Item');
    const second = report('Item');
    resolveResponse?.(okResponse());
    await Promise.all([first, second]);

    expect(fetchReport).toHaveBeenCalledOnce();
  });

  it('retries after network and non-success responses', async () => {
    const fetchReport = vi.fn<typeof fetch>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(new Response(null, { status: 502 }))
      .mockResolvedValueOnce(okResponse());
    const report = createMissingItemReporter({
      fetchReport,
      storage: { getItem: () => null, setItem: () => undefined },
    });

    await report('Item');
    await report('Item');
    await report('Item');

    expect(fetchReport).toHaveBeenCalledTimes(3);
  });

  it('continues safely when session storage is unavailable', async () => {
    const fetchReport = vi.fn<typeof fetch>().mockResolvedValue(okResponse());
    const report = createMissingItemReporter({
      fetchReport,
      storage: {
        getItem: () => {
          throw new DOMException('blocked');
        },
        setItem: () => {
          throw new DOMException('blocked');
        },
      },
    });

    await expect(report('Item')).resolves.toBeUndefined();
    await report('Item');

    expect(fetchReport).toHaveBeenCalledOnce();
  });
});
