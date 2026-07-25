# Secure Missing-Item Reporting Implementation Plan

**Design:** `docs/superpowers/specs/2026-07-25-secure-missing-item-reporting-design.md`

## 1. Lock the client contract with tests

- Add focused tests for the missing-item reporter.
- Assert that it calls only the same-origin API with an item name.
- Assert successful duplicate suppression and concurrent request coalescing.
- Assert retries after network and non-success responses.
- Assert restricted `sessionStorage` access cannot break reporting.

## 2. Replace the browser-visible webhook

- Remove all `import.meta.env.VITE_DISCORD_WEBHOOK_URL` usage.
- Send reports to `POST /api/report-missing-item`.
- Mark reports as sent only after a successful response.
- Keep reporting best-effort so icon rendering never depends on telemetry.

## 3. Lock the server contract with tests

- Add tests for method, content type, origin, body size, JSON shape, and item-name
  validation.
- Assert missing environment binding and upstream Discord failures map to safe
  status codes.
- Assert only a generated Discord payload is forwarded.

## 4. Add the Cloudflare Pages Function

- Add `functions/api/report-missing-item.ts`.
- Read only the server-side `DISCORD_WEBHOOK_URL` binding.
- Apply the approved validation and response contract.
- Forward no browser headers, cookies, or authorization values.
- Bound the upstream request with a timeout.

## 5. Document deployment controls

- Document webhook rotation and the server-only environment binding.
- Document the required Cloudflare edge rate-limit rule.
- Make clear that the old `VITE_` variable must not be configured.

## 6. Verify before continuing

- Run the focused reporter and Function tests.
- Run the complete test suite and ESLint.
- Run the production build.
- Scan client source and built assets for Discord webhook URLs and the old
  client environment-variable reference.
- Inspect the diff and preserve unrelated user files.
