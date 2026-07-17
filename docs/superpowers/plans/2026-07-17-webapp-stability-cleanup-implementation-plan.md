# Web App Stability Cleanup Implementation Plan

**Design:** `docs/superpowers/specs/2026-07-17-webapp-stability-cleanup-design.md`

## 1. Freeze the approved scope

- Preserve the exported card dimensions and information hierarchy.
- Keep upload, equipment search, dye selection, presets, undo, theme, language, and image export.
- Exclude unrelated user files and deployment changes.

## 2. Remove sharing and URL-state infrastructure

- Replace `useUrlState` with local React state initialized from a fresh clone of `INITIAL_STATE`.
- Remove the copy-link button, clipboard status, sharing hooks, URL codec, URL share helpers, and their tests.
- Remove sharing-only translation keys and styles.
- Keep the native image share fallback inside image export because it shares the generated file, not an application link.

## 3. Stabilize the editor layout

- Use a single-column document flow below 1400px.
- At 1400px and above, stretch preview and controls to the same grid-row height.
- Remove fixed aside heights, sticky positioning, nested tab scrolling, and mobile panel max-height.
- Keep one full-width export action and compact the panel’s non-interactive spacing.

## 4. Enforce localized product naming

- Standardize Korean, English, and Japanese product names.
- Localize header, footer, accessibility labels, card labels, public pages, and SEO article copy.
- Synchronize document language, title, description, manifest, and Apple home-screen title with the active language.
- Preserve user-entered titles when the language changes.

## 5. Add home-screen shortcut assets

- Keep `public/favicon.svg` as the source artwork.
- Generate 180px, 192px, and 512px PNG derivatives.
- Add one localized manifest per supported language, all referencing the same prism PNG assets.
- Add favicon, Apple touch icon, and default manifest references to `index.html`.
- Do not add a service worker, offline cache, install prompt, or app-store packaging.

## 6. Add regression coverage

- Verify the copy-link action and sharing symbols are absent.
- Test local state initialization without URL restoration.
- Test localized brand chrome and metadata for all three languages.
- Validate each manifest and referenced icon.

## 7. Verify the deployable build

- Run the full Vitest suite.
- Run ESLint.
- Run the TypeScript and Vite production build.
- Inspect desktop, tablet, and mobile layouts in light and dark modes.
- Confirm equal wide-desktop heights, no nested panel scrollbar, localized metadata, and no console errors.
