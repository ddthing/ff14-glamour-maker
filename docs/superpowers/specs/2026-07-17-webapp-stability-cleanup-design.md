# Web App Stability Cleanup

**Date:** 2026-07-17
**Status:** Approved for implementation planning

## Summary

Simplify the deployable Vite web application by removing the decorative header icon, consolidating icon usage around the new prism favicon, adding consistent home-screen shortcut metadata, eliminating the link-sharing feature and its URL-state infrastructure, resolving the nested-scroll complaint caused by mismatched preview and control-panel heights, and enforcing complete Korean, English, and Japanese language isolation.

Stability takes priority over PWA features. This change adds only the metadata and icon files required for a consistent home-screen shortcut. It does not add a service worker, offline cache, install prompt, or app-store packaging.

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
- Use the same prism artwork when the site is added to a phone home screen.
- Remove nested scrolling from the editor controls.
- Align the control surface and preview at wide desktop sizes.
- Use one natural document scroll on smaller screens.
- Remove link sharing and all code that exists only to support shared URL state.
- Preserve upload, search, dye, preset, undo, theme, language, and export behavior.
- Preserve the internal `1080 × 900` exported-card layout.
- Show only the selected language in application chrome, editor copy, exported-card copy, and public information pages.

## Non-Goals

- Adding a service worker, offline behavior, an install prompt, or app-store packaging.
- Changing the social preview image (`og-image.png`), which is content artwork rather than an application icon.
- Redesigning the exported card.
- Deploying to a hosting provider as part of this code change.
- Refactoring unrelated informational pages.

## Header and Icon Design

The header removes the `<img>` prism mark entirely. The left side contains only the `GLAMOUR MAKER` wordmark and its compact FFXIV editor descriptor. The language selector and theme toggle remain on the right.

The small-screen rule that previously hid the wordmark is removed, because there is no longer an icon to serve as the brand anchor.

`public/favicon.svg` remains the vector source of truth. Verified PNG derivatives are generated from it for:

- `apple-touch-icon.png` at `180 × 180`;
- standard home-screen icon at `192 × 192`;
- large home-screen icon at `512 × 512`.

`index.html` references the SVG favicon, the Apple touch icon, and a minimal web app manifest. The manifest references only PNG derivatives generated from the approved prism source.

The manifest exists solely to provide shortcut name, colors, start URL, display mode, and icons. No service worker or offline runtime is introduced.

`public/og-image.png` remains unchanged because it is used for Open Graph, Twitter, demo content, and structured-data imagery rather than browser or application chrome.

## Language Isolation and Naming

The product name is standardized as:

- Korean: `투영 세트 메이커`;
- English: `Glamour Set Maker`;
- Japanese: `ミラプリセットメーカー`.

The former `Glamour Maker`, `FF14 Glamour Maker`, `FFXIV Glamour Set Maker`, and fixed `GLAMOUR MAKER` UI names are removed from user-facing application copy. Legal Final Fantasy XIV references and proper nouns remain when context requires them.

The current i18n language controls:

- header and footer brand name;
- editor labels and status messages;
- exported-card labels, empty-state copy, and credit label;
- Guide, FAQ, About, Terms, and Privacy content;
- document `<html lang>`;
- document title and description;
- home-screen application title metadata;
- the selected localized manifest reference.

Each public page renders its content from translation resources. English fallback paragraphs must not appear on Korean or Japanese pages. Korean legal copy must not appear on English or Japanese pages.

The site domain, `SQUARE ENIX`, Final Fantasy XIV names, and `@RECONEUR` remain unchanged as proper names. The label surrounding a proper name is translated.

The language selector retains `KR`, `EN`, and `JA` as compact locale codes, while its accessible group label and button names use the current interface language.

### Localized shortcut metadata

The app provides one small manifest per supported language so the shortcut name matches the selected language when the user adds the site to a home screen. All manifests reference the same prism PNG assets and use the same start URL and colors.

Changing language updates the active manifest link and Apple home-screen title without adding a service worker or install flow.

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
- The document language and title update when the interface language changes.
- Proper names may remain untranslated, but surrounding labels must use the selected language.

## Verification

### Automated

- Run the full Vitest suite after removing obsolete sharing tests.
- Run ESLint.
- Run the TypeScript and Vite production build.
- Add or update component tests to assert that the copy-link action is absent and export remains available.
- Search the source tree for sharing symbols and translation keys after deletion.
- Add localization tests for brand naming and public pages in Korean, English, and Japanese.
- Verify the localized manifest files and every referenced PNG icon exist.

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

For each supported language:

- the header, footer, editor, export card, and public pages contain the expected localized brand;
- no former English-only product name is rendered;
- `<html lang>`, document title, and home-screen title metadata match the language;
- the active manifest uses the matching localized application name and the shared prism icon files.

## Acceptance Criteria

- Header prism image is absent.
- Every browser, Apple touch, and manifest icon is derived from the approved prism favicon source.
- Adding the site to a phone home screen uses the prism icon and the localized product name.
- The wide-desktop preview and control panel are visually equal in height.
- The editor has no nested control-panel scrollbar.
- The image-export action spans the action area.
- No sharing UI, clipboard sharing code, URL-state code, related translation, or related test remains.
- Korean, English, and Japanese views contain only their selected interface language except for proper nouns.
- The standardized brand name is used consistently in all three languages.
- Existing non-sharing features continue to pass automated and browser verification.
