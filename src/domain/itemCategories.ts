import type { EquipmentPart } from '../types';
import type { FF14Item } from '../hooks/useFF14Search';

/**
 * Domain: Item Category Mappings
 *
 * Why this file exists:
 *   SLOT_CATEGORY_MAP was previously defined inside ItemSearchInput.tsx (a UI
 *   component). This is a domain-level concern — it describes the relationship
 *   between equipment slots and XIVAPI UI category IDs — and has nothing to do
 *   with rendering. Placing it in the UI layer violates separation of concerns
 *   and makes it impossible to reuse or test without importing a React component.
 *
 *   Moving it here makes it:
 *   - Testable in isolation (pure data, no React dependency)
 *   - Importable from hooks, utils, and other domain files
 *   - The single source of truth for slot↔category relationships
 */

/** Maps each equipment slot to its XIVAPI UI Category ID. */
export const SLOT_CATEGORY_MAP: Record<EquipmentPart, number | 'weapon'> = {
    head:     34,
    body:     35,
    legs:     36,
    hands:    37,
    feet:     38,
    neck:     40,
    ears:     41,
    wrists:   42,
    rings:    43,
    face:     108,
    mainhand: 'weapon',
};

/**
 * All XIVAPI UI Category IDs that are considered weapons / mainhand items.
 * Categories 1-33 cover the base weapon types; the additional ones cover
 * special cases (e.g. shields 83-84, fishing rods 96, etc.).
 */
export const WEAPON_UI_CATEGORIES: ReadonlySet<number> = new Set([
    ...Array.from({ length: 33 }, (_, i) => i + 1),
    83, 84, 87, 88, 89, 96, 97, 98, 105, 106, 107,
]);

/**
 * Returns true if the given item belongs to the expected equipment slot.
 *
 * Why here and not in the component:
 *   This is pure domain logic (a predicate over data), not UI logic.
 *   Pure functions are trivial to unit-test and easy to reason about.
 */
export function isMatchingSlot(item: FF14Item, slot: EquipmentPart): boolean {
    if (item.uiCategory === undefined) return true;
    // Face slot accepts both face accessories (108) and head slot items (34)
    if (slot === 'face') return item.uiCategory === 108 || item.uiCategory === 34;

    const expected = SLOT_CATEGORY_MAP[slot];
    if (expected === 'weapon') return WEAPON_UI_CATEGORIES.has(item.uiCategory);
    return item.uiCategory === expected;
}
