# Minimal Header and Radius System Implementation Plan

**Design:** `docs/superpowers/specs/2026-07-17-minimal-radius-header-density-design.md`

## 1. Unify the header controls

- Reduce the fixed header height from `68px` to `52px`.
- Place the language selector and theme action in one shared `36px` control rail.
- Render KR, EN, JA, and the theme action as equal `32 × 32px` cells.
- Preserve accessible names, pressed state, keyboard focus, and localized metadata behavior.

## 2. Establish the compact radius tokens

- Set major surfaces to `12px`.
- Set grouped controls to `8px`.
- Set standard controls to `6px`.
- Reserve full rounding for genuinely circular affordances and progress indicators.

## 3. Apply the radius hierarchy

- Update the preview, editor panel, tabs, inputs, actions, dropdowns, slot controls, and public pages.
- Keep the exported-card artwork unchanged.
- Preserve circular upload and crop handles where shape communicates interaction.

## 4. Add regression coverage

- Assert header height, rail size, and four equal control cells.
- Keep localization and metadata tests.
- Search for superseded workspace radii and accidental pill controls.

## 5. Verify

- Run the full test suite, ESLint, and production build.
- Measure header and control dimensions at mobile and desktop widths.
- Inspect light and dark modes and confirm no horizontal overflow.
