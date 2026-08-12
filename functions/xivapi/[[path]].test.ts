import { describe, expect, it, vi } from 'vitest';
import { createXivApiProxyHandler } from './[[path]]';

const ENDPOINT = 'https://example.com/xivapi/api/asset?path=ui/icon/1/2.tex';

describe('XIVAPI proxy', () => {
  it('requests the fixed upstream with GET and no client headers or body', async () => {
    const fetchUpstream = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('image', {
        status: 200,
        headers: { 'Content-Type': 'image/png', 'Set-Cookie': 'secret=1' },
      }),
    );
    const handle = createXivApiProxyHandler({ fetchUpstream });

    const response = await handle(new Request(ENDPOINT, {
      method: 'GET',
      headers: { Cookie: 'private=1', Authorization: 'Bearer secret' },
    }));

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('image');
    expect(response.headers.get('Set-Cookie')).toBeNull();
    expect(fetchUpstream).toHaveBeenCalledOnce();
    const [url, init] = fetchUpstream.mock.calls[0];
    expect(String(url)).toBe('https://v2.xivapi.com/api/asset?path=ui/icon/1/2.tex');
    expect(init).toMatchObject({ method: 'GET' });
    expect(init?.headers).toBeUndefined();
    expect(init?.body).toBeUndefined();
  });

  it('rejects non-GET requests before contacting the upstream', async () => {
    const fetchUpstream = vi.fn<typeof fetch>();
    const handle = createXivApiProxyHandler({ fetchUpstream });

    const response = await handle(new Request(ENDPOINT, {
      method: 'POST',
      body: 'unexpected',
    }));

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET');
    expect(fetchUpstream).not.toHaveBeenCalled();
  });

  it('returns a generic error when the upstream request fails', async () => {
    const fetchUpstream = vi.fn<typeof fetch>().mockRejectedValue(new Error('offline'));
    const handle = createXivApiProxyHandler({ fetchUpstream });

    const response = await handle(new Request(ENDPOINT));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'upstream-unavailable' });
  });
});
