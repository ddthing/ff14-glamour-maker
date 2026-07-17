# Retain Active Slot Implementation Plan

**Design:** `docs/superpowers/specs/2026-07-17-retain-active-slot-after-item-selection-design.md`

## 1. Add a regression test

- Render `EquipmentTab` with controlled item, dye, and slot-button seams.
- Select a head item.
- Assert the head slot remains active.
- Enter a dye and assert the update still targets head.
- Run the test before the fix and confirm it fails.

## 2. Remove auto-advance behavior

- Remove temporary auto-advance state and timer cleanup.
- Remove the next-slot selection block after item selection.
- Remove the highlight-only `SlotButton` API and styles.
- Preserve normal active, filled, hover, and pressed behavior.

## 3. Verify the fix

- Run the regression test.
- Run the full test suite, ESLint, and production build.
- Repeat the browser flow and confirm item selection retains the current slot for dye entry.

## 4. Publish the verified change set

- Exclude unrelated user files.
- Create `codex/glamour-webapp-refresh` from the current local state.
- Stage the implementation, generated icon assets, manifests, tests, and implementation plans.
- Commit the complete redesign and stability change set.
- Confirm GitHub CLI authentication and push the branch with upstream tracking.
