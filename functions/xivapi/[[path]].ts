interface XivApiProxyContext {
  request: Request;
}

interface XivApiProxyDependencies {
  fetchUpstream?: typeof fetch;
}

const UPSTREAM_ORIGIN = 'https://v2.xivapi.com';
const PROXY_PREFIX = '/xivapi';
const UPSTREAM_TIMEOUT_MS = 8_000;

function errorResponse(status: number, code: string): Response {
  return Response.json({ error: code }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function createTimeoutController(): {
  controller: AbortController;
  timeout: ReturnType<typeof setTimeout>;
} {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  return { controller, timeout };
}

function createTargetUrl(request: Request): URL | null {
  const requestUrl = new URL(request.url);
  const targetPath = requestUrl.pathname.slice(PROXY_PREFIX.length) || '/';
  const targetUrl = new URL(`${targetPath}${requestUrl.search}`, UPSTREAM_ORIGIN);
  return targetUrl.origin === UPSTREAM_ORIGIN ? targetUrl : null;
}

export function createXivApiProxyHandler(
  dependencies: XivApiProxyDependencies = {},
) {
  const fetchUpstream = dependencies.fetchUpstream ?? fetch;

  return async function handleXivApiProxy(request: Request): Promise<Response> {
    if (request.method !== 'GET') {
      return new Response(null, {
        status: 405,
        headers: { Allow: 'GET', 'Cache-Control': 'no-store' },
      });
    }

    const targetUrl = createTargetUrl(request);
    if (!targetUrl) return errorResponse(400, 'invalid-upstream-path');

    const { controller, timeout } = createTimeoutController();
    try {
      const upstream = await fetchUpstream(targetUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      const headers = new Headers();
      const contentType = upstream.headers.get('Content-Type');
      if (contentType) headers.set('Content-Type', contentType);
      const cacheControl = upstream.headers.get('Cache-Control');
      headers.set('Cache-Control', cacheControl ?? 'public, max-age=3600');

      return new Response(upstream.body, {
        status: upstream.status,
        headers,
      });
    } catch {
      return errorResponse(502, 'upstream-unavailable');
    } finally {
      clearTimeout(timeout);
    }
  };
}

const handleXivApiProxy = createXivApiProxyHandler();

export const onRequest = (context: XivApiProxyContext): Promise<Response> =>
  handleXivApiProxy(context.request);
