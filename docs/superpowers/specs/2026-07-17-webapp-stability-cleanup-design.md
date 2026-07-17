# Web App Stability Cleanup

**Date:** 2026-07-17
**Status:** Approved for implementation planning

## Summary

Simplify the deployable Vite web application by removing the decorative header icon, consolidating icon usage around the new prism favicon, eliminating the link-sharing feature and its URL-state infrastructure, and resolving the nested-scroll complaint caused by mismatched preview and control-panel heights.

Stability takes priority over installability. This change does not add a PWA manifest, service worker, offline cache, or install prompt.

## Diagnosed Layout Problem

At a `1470 × 908` viewport, browser measurement produced:

- preview height: `790px`;
- control-panel height: `720px`;
- visible height mismatch: `70px`;
- control tab panel: `570px` client height and `586px` scroll height;
- control tab overflow mode: `auto`.

The mismatch is caused by the preview scaling from its `1080:900` aspect ratio while the control sidebar is independently capped at `720px`. The fixed sidebar height then forces the tab content into an internal scroll container.

## Goals

- Keep the header visually quiet and text-led.
- Use the approved prism artwork consistently for favicon/icon contexts.
- Remove nested scrolling from the editor controls.
- Align the control surface and preview at wide desktop sizes.
- Use one natural document scroll on smaller screens.
- Remove link sharing and all code that exists only to support shared URL state.
- Preserve upload, search, dye, preset, undo, theme, language, and export behavior.
- Preserve the internal `1080 × 900` exported-card layout.

## Non-Goals

- Adding PWA installation or offline behavior.
- Changing the social preview image (`og-image.png`), which is content artwork rather than an application icon.
- Redesigning the exported card.
- Deploying to a hosting provider as part of this code change.
- Refactoring unrelated informational pages.

## Header and Icon Design

The header removes the `<img>` prism mark entirely. The left side contains only the `GLAMOUR MAKER` wordmark and its compact FFXIV editor descriptor. The language selector and theme toggle remain on the right.

The small-screen rule that previously hid the wordmark is removed, because there is no longer an icon to serve as the brand anchor.

`public/favicon.svg` remains the single icon source referenced by `index.html`. No legacy favicon or touch-icon reference may point to a different asset. The repository currently has no web manifest or other app-icon set to synchronize.

`public/og-image.png` remains unchanged because it is used for Open Graph, Twitter, demo content, and structured-data imagery rather than browser or application chrome.

## Responsive Layout Design

### Wide desktop

At widths of `1400px` and above:

- the preview and controls use a two-column grid;
- both columns participate in one grid row and stretch to the same row height;
- the preview remains the flexible column;
- the controls remain `380–400px` wide;
- the sidebar no longer has a fixed `620px`, `680px`, or `720px` height;
- the sidebar no longer uses sticky positioning;
- the control panel fills the shared grid-row height.

The wide breakpoint is intentionally conservative. It ensures the aspect-ratio preview is tall enough to contain the full control experience without a nested scroll container.

### Smaller desktop, tablet, and mobile

Below `1400px`, preview and controls stack vertically. Both use natural content height and the document provides the only vertical scrolling surface. The control panel must not impose a fixed height or a viewport-derived maximum height.

### Control density

Vertical padding in the tab header, content sections, and export action area may be reduced slightly to keep the full equipment workflow within the wide-desktop preview height. Touch targets remain at least `44px` where practical.

## Control Panel and Export Action

The tab panel removes `overflow-y-auto` and `min-height: 0` behavior that creates an internal scroll container. Content remains visible in normal document flow.

The action area contains one full-width image-export button. Existing export loading stages, disabled state, retry behavior, and readiness emphasis remain.

Preset-storage errors, export errors, and undo feedback remain in `ControlStatus`. Copy-link status and copy failure handling are removed.

## Link-Sharing Removal

The following sharing-only behavior is removed:

- copy-link button and icon;
- copied and copy-failure UI states;
- `useShareLink`;
- `createShareUrl`;
- share URL tests;
- copy-link translation keys;
- URL hash serialization and deserialization;
- URL-state synchronization and its tests.

`App` changes from `useUrlState` to ordinary local React state initialized from a fresh copy of `INITIAL_STATE`. This prevents state changes from writing `#data=...` into browser history.

Existing shared links containing `#data=...` will no longer restore equipment or text state. This compatibility break is intentional and approved.

## State Initialization

A small local-state hook or initializer creates a fresh state object, including cloned crop and equipment item objects. This avoids accidental mutation of exported constants while keeping the existing `useGlamourActions` API unchanged.

Images continue to be session-local and are not persisted.

## Error Handling and Accessibility

- Export retry and error announcements remain.
- Preset-storage errors and undo announcements remain.
- The single export button keeps an accessible label and loading state.
- Removing link sharing must not leave empty live regions, dead translations, or unused clipboard access.
- Header controls retain keyboard access and visible focus.
- The wordmark remains visible at narrow widths without causing horizontal overflow.

## Verification

### Automated

- Run the full Vitest suite after removing obsolete sharing tests.
- Run ESLint.
- Run the TypeScript and Vite production build.
- Add or update component tests to assert that the copy-link action is absent and export remains available.
- Search the source tree for sharing symbols and translation keys after deletion.

### Browser

At `1470 × 908`:

- preview and control-panel top and bottom edges differ by no more than `1px`;
- the control tab panel reports no nested vertical scrolling;
- only one image-export action is present;
- no copy-link action is present.

At representative tablet and mobile widths:

- preview and controls stack;
- the control panel uses natural height;
- the document has no horizontal overflow;
- the header wordmark remains visible.

Verify light and dark modes and confirm there are no browser console errors or warnings.

## Acceptance Criteria

- Header prism image is absent.
- Every browser/app icon reference uses the approved prism favicon source.
- The wide-desktop preview and control panel are visually equal in height.
- The editor has no nested control-panel scrollbar.
- The image-export action spans the action area.
- No sharing UI, clipboard sharing code, URL-state code, related translation, or related test remains.
- Existing non-sharing features continue to pass automated and browser verification.
