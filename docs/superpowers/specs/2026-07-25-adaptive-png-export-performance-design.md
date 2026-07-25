# Adaptive PNG Export Performance Design

## Context

The application exports a fixed 1080×900 DOM canvas through `html-to-image`.
The current fixed `pixelRatio: 3` produces a 3240×2700 bitmap on every device.
Before rendering, every image element is fetched, converted to a Blob and then
to a data URL in one unbounded `Promise.all`.

This preserves output quality, but it creates avoidable preparation work and a
large memory peak on mobile devices:

- repeated image URLs are fetched and encoded more than once;
- existing `data:` and `blob:` URLs are fetched and encoded again;
- all remote images are prepared concurrently;
- the 3× render allocates roughly 35 MB for raw RGBA pixels before browser and
  encoder overhead.

The next refactor will reduce export latency and out-of-memory risk without
changing the canvas layout, desktop output quality, download flow, or share
fallback behavior.

## Goals

1. Keep 3× PNG output on ordinary desktop environments.
2. Use 2× output on mobile, coarse-pointer, or low-memory environments.
3. Fetch and encode each unique remote image source once per export.
4. Limit image preparation concurrency to four unique remote sources.
5. Preserve the existing stage notifications, retry UI, sharing, and download
   behavior.
6. Restore every live DOM image source on all success and failure paths.
7. Add deterministic tests and before/after measurements.

## Non-goals

- Moving DOM capture to a Web Worker or `OffscreenCanvas`.
- Replacing `html-to-image`.
- Adding user-selectable quality controls.
- Changing the 1080×900 canvas composition.
- Recompressing or resizing uploaded source files.
- Redesigning the export controls or status messages.

## Chosen Approach

Use an adaptive pixel-ratio policy together with a deduplicated, bounded image
preparation pipeline.

The alternatives were rejected for this phase:

- A fixed 2× ratio reduces memory consistently but unnecessarily lowers desktop
  output quality.
- Keeping 3× everywhere while only deduplicating images leaves the largest
  mobile allocation unchanged.
- A Worker cannot capture the live DOM and would add a second rendering system
  without removing the `html-to-image` main-thread step.

## Architecture

### Export quality policy

Add a pure `selectExportPixelRatio(environment)` function. The environment is
read at export time and injected in tests.

The policy returns:

- `2` when any of the following is true:
  - the primary pointer is coarse;
  - the viewport width is 820 CSS pixels or less;
  - `navigator.deviceMemory` is available and is 4 GB or less;
- `3` otherwise.

Unsupported `deviceMemory` is treated as unknown, not as low memory. The
function will never return a ratio below 2 or above 3.

For the fixed canvas this yields:

- desktop: 3240×2700, approximately 8.75 million pixels;
- constrained environment: 2160×1800, approximately 3.89 million pixels.

### Image source classification

Each image snapshot records the image element and its original `src` attribute.
The preparation pipeline classifies its effective source,
`currentSrc || src`, as follows:

- empty source: leave unchanged;
- `data:` or `blob:` source: already local, leave unchanged;
- other source: include in the unique remote-source preparation map.

The map preserves first-seen order. Each unique remote source is fetched and
converted once, even when multiple image elements use it.

### Bounded preparation

Prepare unique remote sources with a small internal concurrency runner capped
at four active tasks. This avoids adding a dependency and keeps the behavior
testable as a pure scheduling boundary.

Each task:

1. fetches the source with the existing cache policy;
2. ignores non-success responses;
3. converts the Blob to one data URL;
4. records that data URL for every matching image.

After preparation completes, successful replacements are applied to the live
images. Image decoding may run in parallel because network and encoding work
has already been bounded.

### Rendering and restoration

After preparation:

1. emit the existing `rendering` stage;
2. call `html-to-image` with the selected pixel ratio;
3. return the generated PNG data URL;
4. restore each original `src` attribute in `finally`.

Restoration must preserve the difference between a missing `src` attribute and
an empty or populated attribute. A failed preparation does not remove or
replace the original source.

## Data Flow

1. `useExport` locates `#glamour-canvas`.
2. It dynamically imports the export feature as it does today.
3. `exportCanvasElement` snapshots images and selects the pixel ratio.
4. Unique remote sources are prepared with concurrency four.
5. Successful data URLs are applied and decoded.
6. The element is rendered at 2× or 3×.
7. Original sources are restored.
8. The existing mobile share attempt runs, followed by download fallback.

No new state is added to React components. The public `useExport` return shape
and the existing `preparing` and `rendering` stages remain unchanged.

## Error Handling

- An individual fetch, Blob conversion, or decode failure is recoverable. The
  affected images retain their original URLs and rendering continues.
- A renderer failure is propagated to `useExport`, which keeps the existing
  retryable error state.
- A user-cancelled native share remains non-fatal.
- The concurrency runner must settle all started work and must not leave the
  live DOM partially mutated.
- Original image attributes are restored in `finally` even when rendering
  throws.

## Testing

### Unit tests

Add or extend tests to prove:

- desktop environments select ratio 3;
- coarse-pointer, narrow-viewport, and low-memory environments select ratio 2;
- an unsupported memory API does not force ratio 2 by itself;
- duplicate remote sources are fetched and encoded once;
- active remote preparation never exceeds four tasks;
- `data:` and `blob:` sources are not fetched;
- failed preparation retains the original source;
- render receives the selected ratio;
- all original `src` attributes are restored after success and failure;
- stage ordering remains `preparing` then `rendering`.

### Integration and performance verification

Use a representative canvas containing:

- one character image reused as the photo and blurred background;
- several equipment icons;
- text and dye markers.

Record:

- preparation duration;
- total export duration;
- selected pixel ratio;
- output dimensions;
- unique fetch count;
- peak active preparation count where observable;
- successful PNG generation and browser console errors.

The same fixture and browser viewport must be used for before/after comparison.

## Acceptance Criteria

1. Desktop export remains 3240×2700.
2. Mobile, coarse-pointer, or low-memory export is 2160×1800.
3. No unique remote source is fetched more than once per export.
4. No more than four remote preparations run concurrently.
5. Existing local `data:` and `blob:` images are not fetched.
6. A single image preparation failure does not fail the export.
7. Renderer failure restores every original image source and remains retryable.
8. Existing share and download behavior is unchanged.
9. Full tests, lint, and production build pass.
10. Unrelated user files remain untouched.
