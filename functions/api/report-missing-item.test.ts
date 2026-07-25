import { describe, expect, it, vi } from 'vitest';
import { createReportMissingItemHandler } from './report-missing-item';

const ENDPOINT = 'https://example.com/api/report-missing-item';
const ENVIRONMENT = { DISCORD_WEBHOOK_URL: 'https://discord.invalid/webhook' };

function request(
  body: unknown = { itemName: '투영 장비' },
  init: RequestInit = {},
): Request {
  return new Request(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://example.com',
      ...init.headers,
    },
    body: JSON.stringify(body),
    ...init,
  });
}

describe('report-missing-item Pages Function', () => {
  it('accepts a valid report and forwards only a generated payload', async () => {
    const fetchDiscord = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, { status: 204 }),
    );
    const handle = createReportMissingItemHandler({ fetchDiscord });

    const response = await handle(request(), ENVIRONMENT);

    expect(response.status).toBe(204);
    expect(fetchDiscord).toHaveBeenCalledOnce();
    const [url, init] = fetchDiscord.mock.calls[0];
    expect(url).toBe(ENVIRONMENT.DISCORD_WEBHOOK_URL);
    expect(init).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(init?.headers).not.toHaveProperty('Cookie');
    expect(init?.headers).not.toHaveProperty('Authorization');
    expect(String(init?.body)).toContain('투영 장비');
  });

  it.each([
    ['wrong method', request(undefined, { method: 'GET', body: null }), 405],
    [
      'wrong content type',
      request(undefined, {
        headers: { 'Content-Type': 'text/plain', Origin: 'https://example.com' },
      }),
      415,
    ],
    [
      'cross-origin request',
      request(undefined, {
        headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.example' },
      }),
      403,
    ],
    ['array body', request([]), 400],
    ['extra body fields', request({ itemName: 'Item', extra: true }), 400],
    ['empty item name', request({ itemName: '   ' }), 400],
    ['control characters', request({ itemName: 'bad\nname' }), 400],
    ['long item name', request({ itemName: '가'.repeat(121) }), 400],
  ])('rejects %s', async (_name, invalidRequest, status) => {
    const fetchDiscord = vi.fn<typeof fetch>();
    const handle = createReportMissingItemHandler({ fetchDiscord });

    const response = await handle(invalidRequest, ENVIRONMENT);

    expect(response.status).toBe(status);
    expect(fetchDiscord).not.toHaveBeenCalled();
  });

  it('rejects malformed and oversized bodies', async () => {
    const fetchDiscord = vi.fn<typeof fetch>();
    const handle = createReportMissingItemHandler({ fetchDiscord });
    const malformed = new Request(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });
    const oversized = request({ itemName: 'x', padding: 'x'.repeat(2_000) });

    expect((await handle(malformed, ENVIRONMENT)).status).toBe(400);
    expect((await handle(oversized, ENVIRONMENT)).status).toBe(400);
    expect(fetchDiscord).not.toHaveBeenCalled();
  });

  it('returns 503 when the server binding is absent', async () => {
    const handle = createReportMissingItemHandler({ fetchDiscord: vi.fn() });

    const response = await handle(request(), {});

    expect(response.status).toBe(503);
  });

  it('maps Discord rejection and network failure to 502', async () => {
    const rejected = createReportMissingItemHandler({
      fetchDiscord: vi.fn<typeof fetch>().mockResolvedValue(
        new Response(null, { status: 429 }),
      ),
    });
    const failed = createReportMissingItemHandler({
      fetchDiscord: vi.fn<typeof fetch>().mockRejectedValue(new Error('offline')),
    });

    expect((await rejected(request(), ENVIRONMENT)).status).toBe(502);
    expect((await failed(request(), ENVIRONMENT)).status).toBe(502);
  });
});
