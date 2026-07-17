# Prism Workspace Redesign

**Date:** 2026-07-17
**Status:** Approved for implementation planning

## Summary

Redesign the first editor screen around a restrained aurora-prism identity while preserving the current exported glamour card and its information hierarchy. The work changes the application shell, brand icon, control presentation, and responsive layout. It does not redesign the `1080 × 900` exported card or replace the existing state and feature hooks.

The selected direction is a balanced workspace:

- Desktop places the card preview on the left and a `380–400px` control panel on the right.
- Mobile uses one vertical flow: preview, editing controls, then export actions.
- The same features and state transitions are available at both sizes.

## Goals

- Make the first screen feel simpler, calmer, and visually consistent with the supplied prism reference.
- Keep information delivery and task completion ahead of decorative effects.
- Give the preview clear visual priority without hiding editing controls.
- Support desktop and mobile equally.
- Replace the current brand icon with a legible prism mark that works from favicon size upward.
- Avoid regressions in upload, search, dye selection, presets, sharing, undo, and export.

## Non-Goals

- Redesigning the internal layout, typography, dimensions, or content of `#glamour-canvas`.
- Changing the `1080 × 900` export dimensions or `html-to-image` export pipeline.
- Replacing React state with a new state library.
- Introducing a multi-step wizard or a separate mobile workflow.
- Adding continuous decorative animation.
- Refactoring unrelated pages or feature logic.

## Design Direction

### Brand

The new mark is a triangular optical prism divided by three white structural rays. Its restrained iridescent fill moves through coral, warm gold, cyan, blue, and violet. The silhouette must remain recognizable when rendered at `16–32px`.

The mark is implemented as a reusable SVG source and used by:

- the application header;
- `public/favicon.svg`;
- favicon and Apple touch icon derivatives where the existing document metadata requires raster assets.

The wordmark uses the existing Pretendard font with light weight and generous tracking. No new display-font dependency is required.

### Color and Surface

- App background: a near-white lavender surface around `#f7f6fb`.
- Primary text: deep violet-charcoal with strong contrast.
- Secondary text: muted violet-gray.
- Borders: low-opacity violet-gray.
- Glass treatment: limited to the sticky header and primary control-panel surface.
- Inputs and dense lists: opaque surfaces for readability.
- Iridescent gradient: limited to the brand mark, selected state details, and primary export action.
- Dark mode: retained using deep violet-charcoal surfaces instead of pure black.

Decorative background light is subtle, static, and does not compete with the card preview.

### Shape, Depth, and Motion

- Primary surfaces use `12–20px` corner radii.
- Controls use consistent `10–12px` radii.
- Shadows are broad and low-opacity.
- Interaction transitions last `150–200ms`.
- Reduced-motion preferences continue to disable nonessential animation.
- Touch targets are at least `44 × 44px` where practical.

## Information Architecture

### Header

The header contains only:

1. prism mark and service wordmark;
2. language selection;
3. theme toggle.

It remains sticky, uses a single line at all supported sizes, and keeps the skip-to-content link.

### Workspace

Desktop uses a two-column layout:

- preview column: flexible and visually dominant;
- control column: fixed within the `380–400px` range.

Mobile uses a single column:

1. preview;
2. equipment and general-information tabs;
3. share and export actions.

No feature is hidden solely because the viewport is small.

### Control Panel

The existing Equipment and General tabs remain. Their visual hierarchy is simplified:

- one clear selected state;
- fewer nested boxes;
- consistent input spacing;
- nearby error and status feedback;
- a visually stable action area at the bottom.

Share-link copy and image export remain grouped together. The export action is the primary action; link copy is secondary.

### Preview and Exported Card

`PreviewCanvas` remains the responsive host around the export surface. The internal `#glamour-canvas` subtree, its `1080 × 900` dimensions, and its information arrangement are not intentionally restyled.

App-shell decoration must not be captured by the export pipeline.

## Component Boundaries

### Components expected to change

- `App.tsx`: responsive workspace composition and spacing.
- `Header.tsx`: prism branding and simplified presentation.
- `ControlPanel.tsx`: surface and action-area presentation.
- `ControlTabs.tsx`: selected state and responsive touch treatment.
- `ControlActions.tsx`: primary and secondary action hierarchy.
- `PreviewCanvas.tsx`: outer frame only, if required to match the workspace.
- `index.css`: brand tokens, light/dark surfaces, focus states, and responsive polish.
- public icon assets and icon metadata references.

### Components expected to remain behaviorally stable

- canvas content components under `src/components/canvas/`;
- search, upload, crop, preset, share, undo, and export hooks;
- glamour state encoding and URL synchronization;
- translation resources and public informational pages.

If implementation reveals that a behavior change is required, it must be isolated and regression-tested instead of being folded into a visual edit.

## Data and Interaction Flow

`App` continues to receive state from `useUrlState` and actions from `useGlamourActions`. It passes them to the existing preview and control components. No new global store or duplicated mobile state is introduced.

The expected flow remains:

1. user uploads and crops a character image;
2. user selects equipment and dyes or edits general information;
3. the shared application state updates the live preview;
4. user copies a share link or exports the unchanged card surface.

Responsive layout changes presentation only. It does not branch state transitions or feature logic.

## Error Handling and Accessibility

- Existing export retry, copy failure, preset storage failure, and undo feedback remain available.
- Status messages appear near the action that caused them.
- Mobile fixed or sticky regions must respect the viewport and on-screen keyboard.
- Interactive controls retain semantic labels and keyboard operation.
- Focus-visible styling has strong contrast and is not communicated by color alone.
- Text and controls meet WCAG AA contrast targets.
- Background blur has a readable opaque fallback.

## Verification Strategy

### Automated

- Run the complete Vitest suite.
- Run ESLint.
- Run the TypeScript and Vite production build.
- Add or update targeted component tests only where markup or accessible states change.

### Manual

Verify at representative desktop and mobile widths:

- light and dark modes;
- header branding and controls;
- preview scaling with no clipping;
- equipment and general tabs;
- item search and dye selection;
- image upload and crop modal;
- presets, reset, and undo;
- share-link copy success and failure feedback;
- export success, retry, and exported image dimensions;
- long Korean, English, and Japanese labels;
- keyboard navigation and visible focus;
- reduced-motion behavior.

Compare an exported image before and after the redesign. The card dimensions and intended information arrangement must remain unchanged.

## Acceptance Criteria

- The first editor screen follows the approved balanced-workspace layout.
- The new prism icon is recognizable at favicon and header sizes.
- The interface uses iridescent color as a restrained brand accent rather than a page-wide effect.
- Desktop and mobile expose the same capabilities in a clear order.
- The exported card remains `1080 × 900` and retains its existing information-first layout.
- Existing tests, lint, and production build pass.
- No regression is found in the manual critical-flow checks.
