interface ReportMissingItemEnvironment {
  DISCORD_WEBHOOK_URL?: string;
}

interface ReportMissingItemDependencies {
  fetchDiscord?: typeof fetch;
}

interface ReportMissingItemContext {
  request: Request;
  env: ReportMissingItemEnvironment;
}

const MAX_BODY_BYTES = 1_024;
const MAX_ITEM_NAME_LENGTH = 120;
const DISCORD_TIMEOUT_MS = 5_000;

function errorResponse(status: number, code: string): Response {
  return Response.json({ error: code }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function hasJsonContentType(request: Request): boolean {
  return request.headers.get('Content-Type')
    ?.split(';', 1)[0]
    .trim()
    .toLowerCase() === 'application/json';
}

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasControlCharacters(value: string): boolean {
  return [...value].some(character => {
    const codePoint = character.codePointAt(0);
    return codePoint !== undefined && (codePoint <= 31 || codePoint === 127);
  });
}

function parseItemName(value: unknown): string | null {
  if (!isRecord(value) || Object.keys(value).length !== 1) return null;
  if (typeof value.itemName !== 'string') return null;

  const itemName = value.itemName.trim().normalize('NFC');
  if (!itemName || [...itemName].length > MAX_ITEM_NAME_LENGTH) return null;
  if (hasControlCharacters(itemName)) return null;
  return itemName;
}

function escapeDiscordText(value: string): string {
  return value.replace(/[\\`*_{}[\]()#+\-.!|>~]/g, '\\$&');
}

async function readReportBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new Error('body-too-large');
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    throw new Error('body-too-large');
  }
  return JSON.parse(body) as unknown;
}

export function createReportMissingItemHandler(
  dependencies: ReportMissingItemDependencies = {},
) {
  const fetchDiscord = dependencies.fetchDiscord ?? fetch;

  return async function handleReportMissingItem(
    request: Request,
    environment: ReportMissingItemEnvironment,
  ): Promise<Response> {
    if (request.method !== 'POST') {
      return errorResponse(405, 'method-not-allowed');
    }
    if (!hasJsonContentType(request)) {
      return errorResponse(415, 'unsupported-media-type');
    }
    if (!isSameOriginRequest(request)) {
      return errorResponse(403, 'forbidden');
    }

    let body: unknown;
    try {
      body = await readReportBody(request);
    } catch {
      return errorResponse(400, 'invalid-request');
    }

    const itemName = parseItemName(body);
    if (!itemName) {
      return errorResponse(400, 'invalid-request');
    }

    const webhookUrl = environment.DISCORD_WEBHOOK_URL?.trim();
    if (!webhookUrl) {
      return errorResponse(503, 'reporting-unavailable');
    }

    try {
      const response = await fetchDiscord(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 **Missing item image**\n- Item: ${escapeDiscordText(itemName)}`,
        }),
        signal: AbortSignal.timeout(DISCORD_TIMEOUT_MS),
      });
      if (!response.ok) {
        return errorResponse(502, 'upstream-failed');
      }
    } catch {
      return errorResponse(502, 'upstream-failed');
    }

    return new Response(null, {
      status: 204,
      headers: { 'Cache-Control': 'no-store' },
    });
  };
}

const handleReportMissingItem = createReportMissingItemHandler();

export const onRequest = (context: ReportMissingItemContext): Promise<Response> =>
  handleReportMissingItem(context.request, context.env);
