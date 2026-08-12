import { INITIAL_ITEMS, INITIAL_STATE } from '../../constants/initialState';
import type { AppState, EquipmentPart, EquipItem } from '../../types';

export function cloneItems(
  items: Record<EquipmentPart, EquipItem>,
): AppState['items'] {
  return Object.fromEntries(
    Object.entries(items).map(([part, item]) => [part, { ...item }]),
  ) as AppState['items'];
}

export function createInitialItems(): AppState['items'] {
  return cloneItems(INITIAL_ITEMS);
}

export function createInitialState(): AppState {
  return {
    ...INITIAL_STATE,
    crop: { ...INITIAL_STATE.crop },
    items: createInitialItems(),
  };
}
