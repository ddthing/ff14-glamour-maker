# Lazy Feature Chunk Isolation Implementation Plan

**Design:** `docs/superpowers/specs/2026-07-25-lazy-feature-chunk-isolation-design.md`

## 1. Add a deterministic manifest checker

- Add `scripts/checkLazyChunkIsolation.mjs`.
- Export pure helpers for manifest parsing and dependency traversal.
- Require the initial, crop, and export manifest entries.
- Remove dependencies already reachable from the initial entry.
- Fail with the overlapping lazy-only manifest keys.

## 2. Prove the current coupling

- Build with `--manifest` using the current configuration.
- Run the checker directly.
- Confirm it fails because both dynamic entries reach `vendor-canvas`.

## 3. Restore natural lazy boundaries

- Remove only the `vendor-canvas` manual chunk from `vite.config.ts`.
- Repair the adjacent malformed UI comment without changing its chunk policy.
- Enable `build.manifest`.
- Append the checker to the standard `npm run build` command.

## 4. Verify the new output

- Run the standard production build and confirm the checker passes.
- Confirm no `vendor-canvas` asset is emitted.
- Confirm crop and export remain dynamic manifest entries.
- Measure the raw and gzip size of each isolated interaction path.
- Compare both paths with the 12,152-byte gzip shared baseline.

## 5. Regression verification

- Run all Vitest tests.
- Run ESLint.
- Run the standard production build again after the final edit.
- Run `git diff --check`.
- Inspect staged scope and preserve unrelated untracked files.

## 6. Commit

- Stage only `vite.config.ts`, `package.json`, the checker, and this plan.
- Commit with the root cause: manual chunking coupled independent lazy features.
