# Bounded Vite Preload Recovery Implementation Plan

**Design:** `docs/superpowers/specs/2026-07-25-bounded-vite-preload-recovery-design.md`

## 1. Establish the failing behavior

- Add `src/features/runtime/vitePreloadRecovery.test.ts`.
- Model a minimal event target, storage, and reload callback.
- Assert the desired contract:
  - only `vite:preloadError` is subscribed;
  - the first unique payload is prevented and reloads;
  - repeated and persisted payloads do not reload;
  - storage failure falls back to the in-memory guard;
  - uninstall removes the listener.
- Run the focused test and confirm it fails because the module is absent.

## 2. Implement bounded recovery

- Add `src/features/runtime/vitePreloadRecovery.ts`.
- Define narrow interfaces for the event, event target, and storage.
- Create a deterministic payload fingerprint.
- Check the in-memory set and session storage before recovery.
- Record the first failure, call `preventDefault()`, and reload.
- Return an uninstall callback.

## 3. Integrate at the application entry

- Remove the captured global `error` listener from `src/main.tsx`.
- Install the Vite preload recovery before rendering.
- Access `sessionStorage` defensively so restricted browsers still start.

## 4. Regression verification

- Run the focused runtime recovery test.
- Run all unit/component tests.
- Run ESLint.
- Run the production build.
- Inspect built entry code to ensure the generic resource-error handler is gone
  and the `vite:preloadError` listener remains.
- Run `git diff --check` and inspect the exact staged scope.

## 5. Commit

- Stage only the runtime recovery module, its tests, `main.tsx`, and this plan.
- Commit with a message that records the root cause: the generic resource
  handler could reload indefinitely for unrelated external failures.
