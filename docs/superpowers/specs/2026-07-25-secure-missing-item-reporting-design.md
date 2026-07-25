# Secure Missing-Item Reporting Design

**Date:** 2026-07-25
**Status:** Approved for implementation planning

## Objective

Keep the existing automatic missing-item icon report while removing the Discord
webhook credential from browser code. Reports must travel through a constrained
same-origin Cloudflare Pages Function, and failures must not break item rendering
or prevent a later retry.

## Scope

This change covers only missing-item reporting:

- replace the browser-visible Discord webhook with a same-origin API call;
- add a Cloudflare Pages Function that validates and forwards reports;
- preserve client-side duplicate suppression;
- add request validation and rate-limiting controls;
- add focused regression tests and secret-scanning verification.

Search, image export, XIVAPI proxy hardening, state boundaries, and bundle
restructuring remain separate follow-up refactors.

## Architecture

### Browser

`ItemIcon` continues to invoke the missing-item reporter only after all image
fallbacks fail and `enableWebhook` is enabled. The reporter sends:

```json
{ "itemName": "localized item name" }
```

to `POST /api/report-missing-item`.

The browser never receives or constructs a Discord URL. A report is marked as
sent in the in-memory and session-level duplicate stores only after the API
returns a successful status. Concurrent calls for the same item share an
in-flight request so they cannot produce duplicate submissions.

Reporting is best-effort. Network failures, rejected validation, and upstream
Discord failures are handled without throwing into React rendering code.

### Cloudflare Pages Function

Add `functions/api/report-missing-item.ts`. It:

1. accepts `POST` requests only;
2. requires `Content-Type: application/json`;
3. rejects request bodies larger than the configured small payload limit;
4. accepts exactly one non-empty `itemName` string after trimming;
5. limits the normalized name to 120 Unicode code points;
6. rejects requests whose `Origin`, when present, does not match the request
   origin;
7. reads `DISCORD_WEBHOOK_URL` from the server environment;
8. sends a server-generated Discord message containing the item name;
9. returns a generic response without exposing Discord response bodies or the
   webhook URL.

The function forwards no browser cookies, authorization headers, or arbitrary
request headers to Discord.

## Rate Limiting

Two layers are used:

- Browser duplicate suppression prevents repeated reports for the same item
  during one session.
- The production Cloudflare route must have an edge rate-limit rule for
  `/api/report-missing-item`, keyed by client IP.

Application code must remain correct when the edge rule is absent in local
development. The function therefore also enforces strict request size and input
validation, but it does not pretend that an in-memory per-isolate map is a
durable distributed rate limiter.

Deployment documentation will specify the required Cloudflare rule. Deployment
is not considered complete until that rule and the server-only
`DISCORD_WEBHOOK_URL` binding are configured.

## Response Contract

| Condition | Status | Body |
| --- | ---: | --- |
| Accepted by Discord | `204` | Empty |
| Wrong method | `405` | Generic JSON error |
| Unsupported content type | `415` | Generic JSON error |
| Invalid body or item name | `400` | Generic JSON error |
| Cross-origin request | `403` | Generic JSON error |
| Rate-limited at edge | `429` | Cloudflare-controlled response |
| Missing server binding | `503` | Generic JSON error |
| Discord failure | `502` | Generic JSON error |

All non-204 responses are safe to surface only as internal diagnostic status;
the normal UI remains unchanged.

## Environment and Migration

- Stop using `VITE_DISCORD_WEBHOOK_URL`.
- Add `DISCORD_WEBHOOK_URL` as a server-only Cloudflare Pages environment
  binding.
- Revoke the webhook credential that has already appeared in a browser bundle,
  then create a replacement.
- Do not copy the replacement into `.env` under a `VITE_` prefix.
- Local tests inject the webhook dependency or function environment and never
  require a real credential.

## Error Handling

- Client failure leaves the item eligible for a later retry.
- A successful report updates both the in-memory and `sessionStorage` guards.
- `sessionStorage` access is isolated so restricted-storage browsers still
  report safely.
- Function parsing errors return `400`, never an uncaught exception.
- Discord timeouts or non-success responses return `502`.
- Logs contain status and request diagnostics but never the webhook URL.

## Testing

### Client tests

- sends only the item name to the same-origin endpoint;
- suppresses duplicate successful reports;
- coalesces concurrent reports for the same item;
- retries after network or non-success responses;
- remains functional when `sessionStorage` throws.

### Function tests

- rejects wrong methods, content types, cross-origin requests, malformed JSON,
  oversized bodies, and invalid names;
- returns `503` when the binding is absent;
- forwards a sanitized server-generated payload;
- maps Discord success and failure to the documented statuses;
- never forwards browser request headers.

### Verification gates

- `npm.cmd run test`
- `npm.cmd run lint`
- `npm.cmd run build`
- search source and built assets for `VITE_DISCORD_WEBHOOK_URL`,
  `discord.com/api/webhooks`, and the revoked credential; all must be absent
  from client assets.

## Rollout and Rollback

Deploy the server binding and rate-limit rule before deploying client code that
targets the new endpoint. The client reporter is best-effort, so an unavailable
endpoint does not affect the editor.

Rollback consists of disabling `enableWebhook` at the `ItemIcon` call site or
returning `503` from the reporting function. The webhook credential must never
be restored to client code.
