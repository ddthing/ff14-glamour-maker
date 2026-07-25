# Offline Search Performance Implementation Plan

**Design:** `docs/superpowers/specs/2026-07-25-offline-search-performance-design.md`

## 1. Build the generated-data contract

- Add failing generator tests for deterministic slot grouping, shared slot
  datasets, multilingual normalized keys, duplicate-key removal, and unsupported
  record exclusion.
- Implement a reusable search-data generator and CLI.
- Generate the checked-in slot assets from canonical item and facewear data.
- Integrate regeneration with the existing item update workflow.

## 2. Replace the all-equipment runtime loader

- Add failing loader tests for slot-to-asset mapping, shared Promise caches,
  retry after failure, and no-slot de-duplication.
- Replace the canonical all-equipment URL import with generated asset URLs.
- Keep asset content lazy and reset only failed cache entries.

## 3. Remove per-query normalization and sorting

- Add failing search tests for generated keys, stable three-bucket ranking, and
  zero/negative limits.
- Use generated keys when present and a compatibility fallback for fixtures.
- Replace full result sorting with exact, prefix, and substring buckets.

## 4. Reduce interaction and rendering cost

- Change the search debounce from 800 ms to 200 ms.
- Change the editor result limit from 200 to 50.
- Remove duplicate Combobox slot filtering.
- Update hook and component tests to lock the new timing and result cap.

## 5. Enforce data and bundle budgets

- Verify generated records against canonical source records.
- Verify every generated asset remains below 500 KB gzip.
- Verify the production build no longer emits the canonical all-equipment JSON.
- Verify no dropdown renders more than 50 options.

## 6. Verify behavior and performance

- Run targeted tests after each implementation boundary.
- Run the complete test suite, ESLint, and production build.
- Measure a broad search in the production preview.
- Compare delay, option count, image count, and emitted asset sizes with the
  recorded baseline.
- Inspect the final diff and preserve unrelated user files.
