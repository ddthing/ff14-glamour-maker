# Offline Search Performance Design

**Date:** 2026-07-25
**Status:** Approved for implementation planning

## Objective

Preserve fully offline-capable Korean, English, and Japanese item search while
removing the 12.98 MB all-equipment download and the repeated full-dataset
normalization, sorting, DOM creation, and image loading performed by each
search.

The optimized search must preserve exact, prefix, and substring matching in all
three languages and must not depend on a runtime search service.

## Current Baseline

- Equipment source: 50,743 records, 12.98 MB formatted JSON, approximately
  1.67 MB gzip in the production build.
- First observed browser result: approximately 980 ms, including the configured
  800 ms debounce.
- Broad one-character result: 190 option nodes, 190 image nodes, and a 10,640 px
  result container.
- Every query normalizes as many as three localized names per candidate and
  sorts all matching records before slicing the result.

These figures are the comparison baseline for the implementation.

## Chosen Approach

Generate checked-in, slot-specific static search assets with normalized search
keys at data-maintenance time. Load and cache only the asset required by the
active equipment slot.

This approach is preferred over:

- a Web Worker operating on the complete dataset, because it would retain the
  large download and parse cost; and
- an IndexedDB search index, because it would introduce schema migration and
  recovery complexity without removing first-use generation work.

## Generated Data Architecture

### Source of truth

`src/data/items.json` and `src/data/facewear.json` remain the canonical,
human-inspectable generated datasets. Search assets are derived data and must
never be edited manually.

### Generator

Add a reusable generator module and a CLI entry point under `scripts/`:

- the reusable module owns text normalization, slot grouping, record mapping,
  deterministic ordering, and validation;
- the CLI reads the two canonical source files and writes the generated assets;
- `makeKoItems.mjs` invokes the same generator after refreshing item data;
- a package script allows regeneration without downloading upstream CSV files.

The generator writes JSON deterministically with a trailing newline so
unchanged inputs produce unchanged output.

### Dataset keys

The following ten equipment assets are generated:

- `weapon` for `mainhand` and `offhand`;
- `head`;
- `body`;
- `hands`;
- `legs`;
- `feet`;
- `ears`;
- `neck`;
- `wrists`;
- `rings` for `rings` and `rings2`.

Facewear remains a separate asset and maps only to `face`.

Records unsupported by the editor are excluded from generated search assets.
An equipment item can be present in more than one asset when its canonical
`equipSlots` data explicitly supports more than one editor slot.

### Search record contract

Each generated record contains:

- numeric item ID;
- Korean, English, and Japanese display names when available;
- icon path when available;
- source discriminator;
- normalized, non-empty search keys for all available localized names.

Search keys use the current matching semantics:

1. Unicode NFKC normalization;
2. locale-independent lowercase conversion;
3. removal of all whitespace.

Duplicate normalized keys within one record are removed without changing their
first-seen order.

## Runtime Loading

`loadSearchItems` maps each editor slot to one generated asset URL:

- `mainhand` and `offhand` share `weapon`;
- `rings` and `rings2` share `rings`;
- `face` uses the facewear asset.

Each unique asset has one module-level cached Promise. Concurrent preload and
search calls share the Promise. A failed request removes only that asset's
cache entry so a later request can retry.

The existing no-slot API remains supported for tests and future consumers. It
loads all unique assets in parallel and de-duplicates records by source and ID.
The editor itself must always request a specific slot.

Vite may know all generated asset URLs at build time, but asset content must
remain network-lazy. The canonical all-equipment JSON must not appear in
production `dist/assets`.

## Search Algorithm

The query is normalized once. Each candidate uses its generated normalized
keys; legacy in-memory fixtures without keys may fall back to one-time name
normalization for test and API compatibility.

Instead of collecting and sorting all matches, one pass fills three stable
buckets:

1. exact matches;
2. prefix matches;
3. substring matches.

Each item enters only its best matching bucket. Bucket insertion preserves
source order. Collection stops for a bucket after the requested result limit,
but the candidate scan continues because a later item can have a higher-priority
match.

The final result concatenates the three buckets and slices to the requested
limit. Slot filtering remains available in the pure search function for
compatibility, but the normal editor path receives an already partitioned
dataset and does not filter the result a second time.

## Interaction and Rendering

- Change the editor search limit from 200 to 50.
- Change the input debounce from 800 ms to 200 ms.
- Retain focus and pointer preload behavior.
- Remove the Combobox's duplicate `isMatchingSlot` filtering.
- Render at most 50 option and icon nodes.
- Preserve keyboard order, active-descendant behavior, selection behavior,
  localized display ordering, loading state, empty state, and error state.

Virtualization is intentionally deferred. Fifty fixed-size options are small
enough for the current UI and avoid adding scroll/keyboard coordination
complexity.

## Data Size Budgets

The current measured gzip estimates for minified slot data range from
approximately 29 KB to 233 KB before generated search keys. The implementation
must enforce:

- no individual generated asset larger than 500 KB gzip;
- no production all-equipment JSON asset;
- no search result list larger than 50 options.

If the weapon asset exceeds the budget after search keys are added, it may be
split by deterministic ID range while retaining one logical `weapon` loader.
This split is a contingency, not part of the initial implementation.

## Error Handling

- A missing or invalid generated asset produces the existing `search-failed`
  state.
- A failed cached request can be retried.
- Generator validation completes before any output write begins.
- Generated files are written through temporary sibling files before replacing
  their corresponding final assets. If a filesystem failure interrupts a
  multi-file replacement, the integrity test detects the mixed generation.
- Empty queries perform no search.
- A zero or negative result limit returns an empty result immediately.

## Testing

### Generator tests

- deterministic slot grouping and ordering;
- shared weapon and ring mappings;
- multilingual normalized-key generation;
- exclusion of unsupported records;
- duplicate-key removal;
- failure before replacement when validation fails.

### Runtime loader tests

- requested slot loads only its mapped asset;
- shared slots reuse one Promise;
- concurrent preload and load share a request;
- failed asset cache entries can retry;
- no-slot loading de-duplicates by source and ID.

### Search tests

- exact, prefix, and substring ranking remains stable;
- all available localized names remain searchable;
- generated keys avoid per-query name normalization;
- slot compatibility fallback remains correct;
- result limits are enforced before rendering.

### Integrity and performance tests

- every supported canonical item appears in every appropriate generated asset;
- every generated item resolves by each available full localized name;
- generated assets are current with canonical source data;
- each generated gzip asset remains under 500 KB;
- production build contains generated slot assets and excludes the canonical
  all-equipment asset.

### Browser verification

Repeat the baseline broad search in the production preview and record:

- time from input change to visible result;
- rendered option count;
- rendered image count;
- loaded equipment asset names and sizes when observable.

The acceptance target is at most 50 options and a perceived result delay close
to the 200 ms debounce on a warm local cache.

## Rollout and Rollback

Generated assets and loader changes deploy atomically with content-hashed Vite
URLs. The canonical source data remains available for immediate rollback.

Rollback restores the previous loader import and search limit without changing
the canonical datasets or public state shape. No preset or user-state migration
is required.
