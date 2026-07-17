# Minimal Header and Radius System Design

**Date:** 2026-07-17
**Status:** Approved for implementation

## Summary

Refine the approved prism workspace into a more compact, precise product interface. The current header is visually too tall, and the interface uses too many unrelated corner-radius values. This change reduces the header height, makes every header control visually equal, and replaces ad hoc rounding with a small shared radius system.

The exported `1080 × 900` card information structure remains unchanged.

## Goals

- Reduce the header’s visual weight.
- Give the language and theme controls identical visible dimensions.
- Use rounding only where it communicates component boundaries.
- Preserve the prism palette, information hierarchy, accessibility, and responsive behavior.
- Keep the preview and editor heights aligned on wide desktop.

## Header

- Header height is `52px` on every viewport.
- The localized product wordmark remains visible.
- The header contains one compact control rail with four equal cells:
  - `KR`
  - `EN`
  - `JA`
  - theme icon
- Every cell is exactly `32 × 32px`.
- The rail is `36px` high with `2px` internal padding.
- The rail uses an `8px` outer radius.
- Selected and hover surfaces use a `5px` radius.
- A subtle divider may separate language selection from the theme action, but it must not change cell size.
- Shadows are removed from inactive controls and limited to a very subtle selected-state elevation.
- Visible focus remains clear and keyboard navigation remains unchanged.

## Radius System

Only three primary radius levels are used in application chrome:

- `12px`: major preview and editor surfaces;
- `8px`: grouped controls and compact containers;
- `6px`: inputs, tabs, buttons, dropdowns, and small interactive surfaces.

The `5px` selected surface inside the header rail is an optical inset derived from the `8px` group radius.

Full-pill rounding is reserved for semantic chips or circular controls. It is not used for standard buttons, inputs, tabs, cards, or navigation.

Existing `14px`, `16px`, `20px`, and larger decorative rounding is removed from the workspace interface unless required by the fixed exported-card artwork.

## Component Rules

- Preview frame and control panel: `12px`.
- Tab container and header control rail: `8px`.
- Tabs, inputs, action buttons, dropdowns, preset rows, and slot controls: `6px`.
- Circular image-editor affordances may remain circular because their shape communicates rotation, upload, or handle behavior.
- Public information-page containers follow the same `12px` major-surface and `6px` control rules.
- The exported card is excluded from this radius cleanup except for its outer preview frame.

## Density and Spacing

- Header horizontal padding remains responsive but vertical padding is removed in favor of the fixed `52px` height.
- The wordmark uses compact tracking without a secondary kicker.
- Header controls use a `4px` visual gap only where they are not enclosed by the shared rail.
- Editor spacing and touch targets remain readable; this change reduces decorative volume, not information density.

## Responsive Behavior

- The same `52px` header and equal control sizes apply on desktop and mobile.
- The localized wordmark must not cause horizontal overflow.
- At very narrow widths, wordmark tracking may tighten slightly, but the text remains visible.
- The control rail remains one line and never wraps.

## Accessibility

- Each language cell keeps its localized accessible name and pressed state.
- The theme cell keeps its localized label and pressed state.
- Focus-visible styling remains at least `2px` and is not clipped by the compact rail.
- Text contrast and dark-mode contrast remain unchanged.
- Equal visible cell sizes eliminate the previous hierarchy mismatch without removing semantic labels.

## Verification

- Component tests assert the four equal header cells and localized accessible names.
- Browser measurement verifies:
  - header height is `52px`;
  - KR, EN, JA, and theme cells are each `32 × 32px`;
  - the control rail is `36px` high;
  - the header does not overflow at mobile width.
- Search application CSS and component classes for superseded workspace radius values.
- Run the full test suite, ESLint, and production build.
- Inspect light and dark modes at mobile and wide-desktop widths.

## Acceptance Criteria

- The header is visibly more compact than the current implementation.
- Language and theme controls have identical dimensions and alignment.
- Workspace components follow the `12px`, `8px`, and `6px` radius hierarchy.
- Standard controls no longer use pill shapes or unrelated large radii.
- Preview content, editor behavior, localization, export, and home-screen metadata continue to work.
