# Prism Workspace Redesign Implementation Plan

**Design:** `docs/superpowers/specs/2026-07-17-prism-workspace-redesign-design.md`

## 1. Establish the regression baseline

- Run the existing test suite before visual changes.
- Inspect the current header, workspace, control panel, actions, theme tokens, and favicon references.
- Keep unrelated untracked files and previous user work out of this change.

## 2. Create the prism brand asset

- Replace `public/favicon.svg` with a compact optical-prism SVG.
- Use the same asset in the header.
- Remove metadata references to nonexistent raster icon files unless a verified raster derivative can be generated.
- Preserve accessible application naming while keeping the decorative header image hidden from screen readers.

## 3. Introduce the approved visual tokens

- Update light and dark CSS variables for the lavender-white and violet-charcoal surfaces.
- Restore intentional radius values instead of the global square override.
- Add restrained iridescent, glass, focus, and elevation utilities as named classes.
- Keep reduced-motion support and opaque fallbacks for readable content.

## 4. Refactor the application shell

- Update `App.tsx` to use a balanced preview/control grid on desktop.
- Stack preview, controls, and actions naturally on mobile.
- Keep the preview first in source order and retain `#main-content`.
- Do not modify the `#glamour-canvas` dimensions or content structure.

## 5. Simplify the header and controls

- Rebuild the header brand lockup around the prism mark and spaced wordmark.
- Normalize language and theme control touch targets.
- Restyle the tab list with a clear selected surface and accessible state.
- Convert inline action-button styles to reusable CSS classes.
- Make export the iridescent primary action and sharing the secondary action.
- Keep existing click handlers, labels, loading states, and status feedback.

## 6. Polish responsive and theme behavior

- Verify the layout at narrow mobile, tablet, and desktop widths.
- Ensure the sticky header and action regions do not cover focused controls.
- Confirm dark-mode contrast and background fallbacks.
- Preserve keyboard navigation, focus visibility, and reduced-motion behavior.

## 7. Verify

- Run targeted component tests while iterating.
- Run the complete test suite, ESLint, and production build.
- Launch the local app and inspect desktop and mobile screenshots.
- Compare the exported-card host structure and dimensions against the baseline.
- Fix any discovered regression before reporting completion.
