# Retain Active Slot After Item Selection

**Date:** 2026-07-17
**Status:** Approved for implementation

## Summary

Keep the current equipment slot active after an item is selected. The user must be able to enter the first and second dye values for the selected item without the editor switching to the next slot.

## Diagnosed Cause

`EquipmentTab` currently treats the first item selection in an empty slot as a completed slot. It immediately selects the next entry in `SLOT_ORDER` and briefly highlights that slot. This happens before either optional dye input can be used.

The behavior is deterministic and was reproduced in the browser: selecting a head item changed the active editor from head to body.

## Interaction Design

- Selecting an item updates the item name, localized names, icon, and error state.
- The active slot does not change.
- Both dye inputs continue to edit the same selected item.
- The user moves to another slot only by selecting a slot button.
- Replacing an existing item follows the same behavior and remains on the current slot.
- Clearing an item remains on the current slot.

## Code Changes

- Remove the item-selection auto-advance block from `EquipmentTab`.
- Remove the temporary `justAutoAdvancedTo` state and timeout effect.
- Stop passing auto-advance highlight state to `SlotButton`.
- Remove the unused highlight prop and highlight-only styles from `SlotButton`.
- Keep normal active, filled, hover, and pressed states unchanged.

## Regression Coverage

Add a component-level test that:

1. starts with the head slot active and empty;
2. selects a head item through the real `EquipmentTab` selection callback;
3. verifies the head slot remains active;
4. enters dye values;
5. verifies the updates still target the head slot.

## Acceptance Criteria

- Item selection never changes the active slot.
- Dye entry immediately after item selection updates the selected item.
- Manual slot switching still works.
- Item search, localization, presets, export, and undo behavior remain unchanged.
- The full test suite, ESLint, production build, and browser reproduction pass before publishing.
