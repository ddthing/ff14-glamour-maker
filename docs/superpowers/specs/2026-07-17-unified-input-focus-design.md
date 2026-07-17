# Unified Input Focus Design

## Goal

Make every text and search field use the same focus treatment as the general
settings inputs. Remove the double purple ring visible on equipment item and
dye search fields without changing their size, layout, or behavior.

## Current Cause

The global `:focus-visible` rule draws a 2px accent outline. General settings
inputs combine that outline with the shared translucent 4px focus shadow.
Equipment search inputs instead add a separate opaque 1px Tailwind ring, so
the ring and global outline appear as two competing borders.

## Design

- Keep the existing general settings focus treatment as the visual reference.
- Define one reusable focus recipe using:
  - the existing accent outline for keyboard visibility;
  - `--border-medium` for the focused border;
  - `--shadow-focus` for the soft 4px halo.
- Apply the recipe directly to standalone inputs such as item search.
- Apply the same recipe to the outer shell of compound inputs such as dye
  search, while suppressing the inner input's duplicate outline.
- Preserve the current 44px field height, padding, radii, icons, colors,
  dropdown behavior, and keyboard navigation.
- Keep dark mode driven by the existing focus color tokens.

## Accessibility

The focused control retains a high-visibility 2px outline and a soft halo.
Keyboard and pointer focus use the same component boundary, including compound
dye inputs.

## Verification

- Add a regression test that checks item and dye search fields use the shared
  focus classes and no longer include component-specific opaque rings.
- Run the full unit test suite, lint, and production build.
- Verify in the browser that general, item, and dye inputs have matching
  focused border, outline, and shadow in light mode.
