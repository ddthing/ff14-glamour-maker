# Preview Render Isolation Implementation Plan

**Design:** `docs/superpowers/specs/2026-07-25-preview-render-isolation-design.md`

## 1. Reproduce render propagation

- Add `src/components/canvas/PreviewCanvas.render.test.tsx`.
- Mock the photo and information panels with render counters.
- Provide deterministic `ResizeObserver` and animation-frame fakes.
- Assert the desired hover, equipment, and photo render boundaries.
- Run the focused test and confirm the current implementation fails.

## 2. Localize photo hover state

- Move the hover boolean and mouse handlers from `PreviewCanvas` into
  `PhotoPanel`.
- Remove hover-related props from the public `PhotoPanel` interface.
- Preserve visible overlay and keyboard behavior.

## 3. Add targeted memo boundaries

- Export `PhotoPanel` through `memo`.
- Replace `InfoPanel`'s complete `AppState` prop with `title`, `creator`,
  `items`, and `bgSrc`.
- Export `InfoPanel` through `memo`.
- Add a stable `openFilePicker` callback in `PreviewCanvas`.

## 4. Verify the focused contract

- Run the render-isolation test.
- Confirm hover re-renders only the photo region.
- Confirm equipment changes re-render only the information region.
- Confirm photo changes re-render both regions.

## 5. Full verification

- Run all Vitest tests.
- Run ESLint.
- Run the manifest-gated production build.
- Run `git diff --check`.
- Confirm no diagnostic harness or `[DEBUG-...]` instrumentation remains.

## 6. Commit

- Stage only the plan, component changes, and focused test.
- Commit with the root cause: transient hover ownership invalidated the full
  preview subtree.
