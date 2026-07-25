# Bounded Vite Preload Recovery Design

## Context

The application currently listens for every captured `error` event and reloads
the page whenever the event target is a `<script>` or `<link>`. This is broader
than the stale-deployment failure it intends to recover:

- third-party scripts such as advertising can fail because of blockers or
  network policy;
- favicon, manifest, and stylesheet links can fail for unrelated reasons;
- repeated failures cause an unbounded reload loop;
- the handler cannot recover a failed entry script because it only exists after
  the application entry has loaded.

Vite exposes the dedicated `vite:preloadError` event for failed dynamic imports.
The event payload contains the original import error and `preventDefault()`
suppresses Vite's default throw.

## Goals

- Recover a stale lazy-loaded chunk with at most one automatic reload for the
  same failure in the current tab.
- Never reload for third-party scripts, ordinary resource errors, or unrelated
  `<link>` failures.
- Preserve the original error on a repeated preload failure so it remains
  observable.
- Remain safe when `sessionStorage` is unavailable.
- Keep recovery independent from React rendering.

## Non-goals

- Retrying arbitrary network requests.
- Adding a service worker or offline cache.
- Recovering an entry script that never loaded.
- Changing Vite chunk names or deployment retention policy.
- Adding a user-facing error boundary in this stage.

## Approaches considered

### 1. Dedicated Vite event with a per-failure guard — recommended

Listen only for `vite:preloadError`. Derive a stable fingerprint from the
payload, store it in `sessionStorage`, and reload only when the fingerprint has
not been seen in the current tab. Maintain an in-memory set as a fallback.

This directly matches Vite's failure signal, excludes unrelated resources, and
prevents a repeated stale reference from looping.

### 2. Filter the existing captured resource-error handler

Restrict the current handler to same-origin `/assets/` scripts and styles. This
still relies on DOM resource events rather than Vite's dynamic-import contract,
requires fragile URL and `rel` checks, and can misclassify failures.

### 3. Remove automatic recovery

This eliminates reload loops but leaves users with a broken lazy feature after a
deployment. It is safer than the current handler but provides a worse recovery
experience than the dedicated Vite event.

## Architecture

Create a small `installVitePreloadRecovery` module outside React.

The installer receives browser dependencies through narrow interfaces:

- an event target supporting `addEventListener` and `removeEventListener`;
- optional session-like storage;
- a reload callback.

It returns an uninstall function. Production code supplies `window`,
`sessionStorage`, and `window.location.reload`. Tests supply deterministic
fakes.

The module owns an in-memory `Set<string>` for the lifetime of the installation.
Storage keys use a fixed namespace plus a compact fingerprint derived from the
error payload. Error names and messages are sufficient because Vite's import
error includes the failed chunk URL; non-Error payloads use a safe string
fallback.

## Event flow

1. Vite emits `vite:preloadError`.
2. The handler fingerprints `event.payload`.
3. If the fingerprint exists in memory or storage, the handler returns without
   calling `preventDefault()` or reload. Vite's original failure remains
   visible.
4. Otherwise, the handler records the fingerprint in memory and storage.
5. The handler calls `preventDefault()` and reloads once.
6. If storage access throws, the in-memory guard still blocks duplicate events
   before navigation.

The legacy captured `error` listener is removed completely.

## Failure handling

- Storage read failure is treated as "not stored"; the in-memory set remains
  authoritative for the current document.
- Storage write failure does not block the first recovery.
- Reload exceptions are not swallowed; they remain observable.
- Repeated failures are not suppressed and do not trigger another reload.

## Testing

Unit tests must prove:

- ordinary `error` events and third-party resource failures are never handled;
- the first `vite:preloadError` is prevented, recorded, and reloads once;
- a repeated payload does not prevent or reload;
- a persisted fingerprint blocks reload after a simulated page reinstall;
- unavailable or throwing storage still permits one in-document recovery;
- uninstall removes the listener.

Full verification remains `npm run test`, `npm run lint`, and `npm run build`.

## Success criteria

- No generic captured resource-error reload handler remains.
- Only Vite preload failures can trigger automatic recovery.
- The same failure cannot cause an automatic reload loop in one browser tab.
- Existing lazy routes, crop loading, and export loading continue to build.
