# Adaptive Card UI and Optional Accessories

**Date:** 2026-08-13
**Status:** Approved for specification review

## Summary

Refresh the editor with the user-selected shadcn preset `buFzHua`, use Material Design 3 component-purpose guidance to improve interaction density, and make the exported glamour card respond to the uploaded image palette. The exported card remains a fixed `1080 x 900` artifact regardless of editor viewport.

The feature also corrects the Korean dye typo `공잣깃 파란색`, exposes main-hand and off-hand equipment as distinct slots, adds one optional fashion-accessory selection, and makes the glamour-set title optional.

## Goals

- Apply the `buFzHua` theme (`Lyra`, neutral palette, Oxanium, default radius) without replacing working application components wholesale.
- Use richer UI elements where their purpose is clear: actions, containment, feedback, navigation, selection, and text input.
- Generate an image-aware information-panel background that is cohesive, readable, and reproducible in the downloaded PNG.
- Keep export behavior deterministic on mobile, tablet, and desktop.
- Separate main-hand, off-hand, facewear, and fashion-accessory semantics.
- Avoid empty optional rows and placeholder punctuation in the final card.
- Preserve existing security, state-safety, localization, search, preset, and export improvements.

## Non-Goals

- Replacing React state with a global state library.
- Uploading user images to a server for palette analysis.
- Detecting what the player's character actually has unlocked.
- Allowing multiple simultaneously active fashion accessories.
- Treating housing items or ordinary inventory items with similar names as fashion accessories.
- Changing the exported card dimensions.
- Editing `DESIGN.md`; this work consumes that contract while the selected shadcn preset supplies component-level theme values.

## Theme and UI Direction

### Theme application

Run the user-selected command only after the implementation plan is approved:

```sh
npx shadcn@latest apply --preset buFzHua --only theme
```

Before accepting generated changes, inspect the diff and preserve project-specific tokens required by the canvas and dark mode. The command may update CSS variables and theme configuration; it must not silently overwrite user-owned component behavior.

The decoded preset is:

- style: `lyra`;
- base color and theme: `neutral`;
- font: `oxanium`;
- heading font: inherited;
- radius: default;
- menu color: default;
- menu accent: subtle.

### Component-purpose mapping

Material Design 3 is used for purpose and hierarchy; shadcn provides the implementation composition.

- Header: toolbar-like composition with language and theme menus, icon buttons, and tooltips.
- Editor sections: cards with explicit headers, descriptions, content, and actions.
- Equipment/general modes: accessible tabs.
- Slot selection: horizontally scrollable toggle/chip group at narrow widths and a stable grid at wide widths.
- Item, dye, and fashion-accessory search: combobox/command list in a popover.
- Presets: select/list treatment; destructive removal requires an alert dialog.
- Save: single strongest primary action; sticky bottom action region on narrow screens.
- Loading: skeleton or spinner for short work; determinate/staged progress messaging for PNG generation.
- Feedback: toast for transient success/failure, with persistent inline retry for export failures.
- Empty states: actionable instructions instead of decorative blank containers.
- Mobile secondary controls: sheet or drawer only when it materially preserves preview space.

All interactive targets must be at least `44 x 44px` where practical, keyboard operable, visibly focused, and labeled independently of icons.

## Responsive Workspace

Desktop uses a preview-dominant two-column workspace. The editor panel stays within a readable fixed range while the preview column flexes. Tablet may retain two columns while space permits; otherwise it changes to one vertical flow. Mobile orders content as preview, controls, then the sticky save action.

There is one state tree and one export surface. Responsive layouts must not create a second hidden card or duplicate form state.

The editor scales the preview host only. `#glamour-canvas` remains `1080 x 900`, and export always removes the preview transform before rendering.

## Dynamic Card Background

### Selected approach

Use palette mesh plus a low-resolution blurred image layer and an adaptive contrast scrim. Do not rely on `backdrop-filter` for the exported result.

### Palette analysis

Palette extraction runs locally after the crop is confirmed:

1. Decode the cropped image.
2. Draw it into a small offscreen canvas, no larger than `32 x 32` pixels.
3. Ignore transparent pixels.
4. Reduce the influence of pixels whose lightness is at least 92% and saturation is at most 8%.
5. Reduce the influence of near-black pixels that contain no useful hue.
6. Quantize the remaining pixels into stable color buckets.
7. Select up to three separated dominant colors and retain normalized population weights.
8. Derive foreground/scrim settings from relative luminance, not from theme mode.

The analysis output is a small serializable value containing colors, weights, average luminance, and a fallback reason when applicable. It must not retain pixel buffers.

### Rendering layers

The right information panel uses fixed DOM layers in this order:

1. neutral fallback surface;
2. enlarged low-resolution image with bounded blur;
3. weighted radial-gradient mesh using the extracted colors;
4. dark contrast scrim whose opacity responds to palette luminance;
5. subtle static texture;
6. card content.

All layers are children of `#glamour-canvas` and therefore included in PNG export. CSS values are deterministic from the palette result.

### White and low-color images

- High-lightness, low-saturation pixels have reduced palette weight rather than being discarded completely.
- If fewer than two useful colors remain, mix the strongest useful color with neutral preset surfaces.
- If no useful hue remains, use a neutral mesh rather than pure white.
- Increase the dark scrim until text, dividers, and icons satisfy the chosen contrast threshold.
- The card remains intentionally dark enough for white information text; a white image must never produce a white-on-white panel.

### Failure behavior

Cross-origin or decode failures fall back to the neutral card background and do not block editing or export. Palette extraction errors are not user-fatal. The original uploaded image remains available for the photo panel.

## Card Content Model

### Main-hand and off-hand

`mainhand` and `offhand` remain distinct equipment parts.

- Rename the Korean main-hand label from generic `무기` to `주 무기`.
- Keep English `Main Hand` / `Off Hand` and Japanese `主武器` / `副武器` unless localization review finds a verified source correction.
- Add `offhand` to the shared slot order immediately after `mainhand`.
- Filter main-hand searches to main-hand-compatible records only.
- Filter off-hand searches to off-hand-compatible records only.
- Do not show an empty off-hand row in the exported card.
- A selected off-hand item appears as its own row directly below the main-hand row.

Two-handed jobs therefore incur no empty-card penalty, while shields and other legitimate off-hand items remain representable.

### Fashion accessory

Fashion accessories are not equipment parts. Add a separate optional state field:

```ts
interface FashionAccessorySelection {
  id: number;
  nameKo: string;
  nameEn: string;
  nameJa: string;
  iconPath?: string;
}
```

`AppState` stores `fashionAccessory: FashionAccessorySelection | null`. Existing saved state without this field decodes to `null`.

The editor presents one optional fashion-accessory control under a visually grouped “optional items” area alongside, but not merged with, the off-hand control. Search uses a generated dedicated catalog sourced from the game-data representation of fashion accessories. The sync step must validate source identifiers and exclude housing items, unlock-item name collisions, and facewear moved out of the fashion-accessory system.

Only one fashion accessory can be selected. When selected, the exported card shows one dedicated row with its icon, localized name, and localized category label. When empty, no row or spacer is rendered.

### Optional glamour-set title

The title input is optional.

- Placeholder copy is never stored as title data.
- Empty or whitespace-only input renders no title block in the exported card.
- The remaining header/list layout closes the gap without a blank divider.
- A non-empty title retains the prominent title treatment.
- Export filenames use the existing sanitized title when present and a safe `glamour` fallback otherwise.
- No punctuation workaround such as `.` is required or encouraged.

### Dye correction

Correct the Korean entry:

- before: `공잣깃 파란색`;
- after: `공작깃 파란색`.

The paired English `Peacock Blue` and Japanese `ピーコックブルー` entries are correctly spelled and remain unchanged. Add a data integrity assertion covering all three values.

## State and Compatibility

- Extend initial-state creation instead of mutating a shared singleton.
- Decode missing fashion-accessory data as `null`.
- Reject malformed accessory objects at the codec boundary.
- Preserve existing saved presets by treating the new field as optional during migration.
- When restoring an old preset, clear the fashion accessory unless the preset explicitly contains a valid one.
- Keep equipment reset behavior scoped and explicit: reset equipment including off-hand; define fashion-accessory clearing as part of the same reset only if the button label communicates that all card items are reset.
- Do not serialize derived palette pixels. Recompute the palette from the cropped image so old state remains compact.

## Export Reliability

The PNG result is part of the feature contract.

- Wait for uploaded, item, accessory, and blurred background images to decode before rendering.
- Inline image sources before capture when possible and restore the original DOM sources afterward.
- Keep a neutral fallback when an individual decorative layer cannot be inlined.
- Render the fixed canvas with preview transforms removed.
- Avoid `backdrop-filter`, viewport units, sticky/fixed descendants, and device-dependent media queries inside the export subtree.
- Prevent duplicate export actions while rendering.
- Prefer Web Share with a PNG file where supported; fall back to download after share capability or share failure checks.
- Treat user cancellation as cancellation, not export failure.

Representative device validation must include iOS Safari, Android Chrome, desktop Chromium, and at least one non-Chromium desktop browser where available.

## Component Boundaries

Expected new focused units:

- palette extraction utility with no React dependency;
- hook that derives palette state from the confirmed crop;
- deterministic card-background component;
- fashion-accessory catalog loader/search module;
- fashion-accessory selection control.

Expected modifications:

- theme and global style configuration;
- responsive app workspace and header;
- control panel, tabs, slot selector, search controls, status feedback, and save action;
- glamour state, factory, codec, presets, and actions;
- shared slot order and equipment search matching;
- card heading, equipment list, and info-panel layers;
- export preparation and tests;
- dye constants and data-integrity tests;
- localization resources.

Palette extraction, accessory data loading, and export rendering remain independently testable. `InfoPanel` consumes derived presentation values rather than implementing image analysis itself.

## Testing

### Unit and component tests

- dominant-color extraction for colorful, white, grayscale, transparent, and malformed images;
- deterministic mesh output and neutral fallback;
- separate main-hand/off-hand filtering, including items with explicit multi-slot metadata;
- conditional off-hand and fashion-accessory rows;
- optional title layout;
- fashion-accessory catalog validation and multilingual search;
- old-state and old-preset migration;
- corrected dye names in Korean, English, and Japanese;
- accessible tab, combobox, dialog, toast, and keyboard behavior;
- export image readiness, source restoration, cancellation, retry, and fallback paths.

### Integration and visual checks

- upload and crop images with colorful, near-white, near-black, and grayscale palettes;
- confirm the editor and saved PNG show the same card background;
- confirm exported dimensions are exactly `1080 x 900`;
- test empty and populated titles;
- test main-hand only, main-hand plus off-hand, and fashion accessory combinations;
- test long Korean, English, and Japanese names;
- test light/dark editor themes without changing exported-card readability;
- test narrow phones, tablets, laptops, and large desktops;
- test keyboard-only and reduced-motion operation.

Run the full Vitest suite, ESLint, TypeScript/Vite production build, and dependency audit before any completion, commit, or push claim.

## Rollout and Commit Boundaries

Implementation should be split into reviewable commits:

1. theme foundation and reusable UI primitives;
2. responsive editor composition and accessibility;
3. palette extraction and deterministic card background;
4. main-hand/off-hand separation and optional title;
5. fashion-accessory catalog, state, search, and conditional card row;
6. dye correction and full export/regression hardening.

Do not mix unrelated user-owned files or the existing uncommitted `PreviewCanvas` styling into these commits without explicit confirmation.

## Acceptance Criteria

- The editor uses the approved `buFzHua` visual foundation and purpose-appropriate M3/shadcn components.
- The same editing capabilities remain available at every supported viewport.
- Every export is a fixed `1080 x 900` PNG independent of viewport size.
- The information-panel background reflects dominant image colors without losing text contrast.
- Near-white images produce a neutral, readable result rather than white-on-white glass.
- Main-hand and off-hand searches and card rows are correctly separated.
- Empty off-hand, fashion-accessory, and title content consumes no exported-card space.
- One verified fashion accessory can be selected from a dedicated multilingual catalog.
- `공작깃 파란색`, `Peacock Blue`, and `ピーコックブルー` are represented correctly.
- Existing saved state and presets continue to load safely.
- Automated verification and representative device export checks pass.

## References

- [Material Design 3 components](https://m3.material.io/components)
- [shadcn components](https://ui.shadcn.com/docs/components)
- [shadcn partial preset apply](https://ui.shadcn.com/docs/changelog/2026-04-partial-preset-apply)
- [XIVAPI sheet guide](https://v2.xivapi.com/docs/guides/sheets/)
- [FINAL FANTASY XIV `/fashion` command](https://na.finalfantasyxiv.com/lodestone/playguide/db/text_command/803679db189/)
