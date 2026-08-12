# Stability, Security, and Maintainability Refactor Design

**Date:** 2026-08-13  
**Status:** Approved for implementation planning

## Objective

Review and incrementally refactor the FF14 Glamour Maker codebase with the
following priority order:

1. security;
2. runtime stability;
3. maintainability.

Existing user-facing behavior and visual design must remain unchanged unless a
security fix requires a transport or configuration change. Existing working
tree changes must be preserved.

## Current Baseline and Findings

- Repository: `ddthing/ff14-glamour-maker`.
- Working branch: `codex/production-item-update`.
- Baseline: ESLint passes; 21 Vitest files and 52 tests pass.
- `src/utils/reportMissingItem.ts` reads a `VITE_`-prefixed Discord webhook
  URL, which makes the webhook address part of the browser bundle.
- The local `.env` is not tracked, but any credential that has appeared in a
  client bundle must be considered compromised and rotated outside this code
  change.
- `functions/xivapi/[[path]].ts` forwards incoming headers, methods, and
  request bodies to the upstream API without an allowlist.
- Browser storage access and image-file loading have failure modes that can
  affect app availability in restricted-storage or high-memory conditions.

## Scope

### In scope

- Move missing-item reporting to a same-origin, server-only Pages Function.
- Validate the report request and keep the webhook credential server-side.
- Harden the XIVAPI proxy to the minimum required read-only behavior.
- Add safe browser-storage access and strengthen state boundaries.
- Add bounded image upload handling.
- Review static security headers and GitHub Actions permissions/dependency
  pinning where changes are low-risk and behavior-preserving.
- Add focused regression tests and verify the production bundle.

### Out of scope

- Visual redesign or changes to `DESIGN.md`.
- Replacing the existing React state model with Zustand.
- Refreshing item data or changing search ranking semantics.
- Rotating Discord or Cloudinary credentials automatically.
- Deploying, changing Cloudflare bindings, or configuring an edge rate-limit
  rule without explicit confirmation.

## Architecture and Data Flow

### Missing-item reporting

`ItemIcon` continues to report only after its image fallbacks fail. The browser
reporter sends `{ itemName }` to `POST /api/report-missing-item`; it never reads
or constructs a Discord URL. Successful reports are recorded in memory and
`sessionStorage`, while concurrent requests for the same item share one
in-flight promise. Failed requests remain retryable and never affect rendering.

The Pages Function accepts `POST` with JSON only, rejects malformed or oversized
bodies, accepts exactly one bounded `itemName` string, rejects cross-origin
requests when an `Origin` header is present, and reads `DISCORD_WEBHOOK_URL`
only from the server environment. It sends a server-generated payload to
Discord and never forwards browser cookies, authorization headers, or arbitrary
request headers. It returns generic status responses without upstream details.

### XIVAPI proxy

The proxy will accept only the read-only request methods required by the client
(currently `GET`). It will construct the fixed upstream URL from the existing
route, omit client headers and bodies, use a bounded timeout, and return only
the upstream response data needed by the image client. The upstream hostname
remains fixed; no user-controlled host is introduced.

### State and browser capabilities

Storage reads/writes will be isolated behind small safe helpers so browsers that
deny storage do not crash initialization or persistence. State entering from
presets or encoded values will be cloned/sanitized at the boundary before being
installed in application state. Image uploads will reject unsupported or
oversized files before reading them into memory and handle reader failures as a
recoverable UI path.

## Security Controls

- Remove `VITE_DISCORD_WEBHOOK_URL` from application code and document the
  server-only `DISCORD_WEBHOOK_URL` binding.
- Add a secret-scan verification for client source and production assets.
- Keep credential rotation as a user-confirmed operational action.
- Add safe baseline headers such as `Referrer-Policy` and an appropriate
  `Permissions-Policy`; evaluate CSP compatibility with existing ads, fonts,
  images, and inline metadata before enforcing it.
- Reduce workflow permissions to the job that needs them and pin third-party
  action references when the exact versions are confirmed.
- Do not introduce an in-memory rate limiter that would falsely claim to be
  distributed. Document the required Cloudflare edge rate-limit configuration
  separately.

## Testing and Verification

Add tests for:

- same-origin report request shape, duplicate suppression, retry behavior, and
  restricted storage;
- report-function method, content-type, origin, size, input, secret-binding,
  and upstream failure handling;
- proxy method/header/body restrictions and upstream failures;
- storage failures, state boundary cloning, and upload validation.

Before claiming completion, run:

- `npm.cmd run lint`
- `npm.cmd test -- --run`
- `npm.cmd run build`
- a source and built-asset scan for the old webhook variable, Discord webhook
  URL patterns, and accidental credential material.

## Confirmation Gates

The following require explicit user confirmation before execution:

- rotating or revoking Discord/Cloudinary credentials;
- changing Cloudflare Pages environment bindings or edge rate limits;
- deploying or pushing changes;
- any behavior change beyond the approved security, stability, and
  maintainability scope.
