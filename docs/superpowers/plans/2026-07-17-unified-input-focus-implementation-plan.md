# Unified Input Focus Implementation Plan

## Scope

Unify the general, item, and dye input focus treatments without changing
layout, field dimensions, search behavior, or keyboard navigation.

## Steps

1. Add a focused regression test for the standalone item input and compound
   dye input boundaries.
2. Add shared CSS focus classes based on the existing `input-base` border,
   outline, and `--shadow-focus` treatment.
3. Replace the item search component's opaque Tailwind ring with the shared
   focus class.
4. Apply the shared shell focus class to dye search and suppress the inner
   input's duplicate outline.
5. Run the focused test, full test suite, lint, and production build.
6. Compare computed focus styles in the running app for general, item, and dye
   inputs.
