import type { EquipmentPart } from '../../types';

export type ItemSource = 'item' | 'facewear';

export interface FF14Item {
  id: number;
  name: string;
  nameEn: string;
  nameJa: string;
  iconPath?: string;
  uiCategory?: number;
  source?: ItemSource;
  equipSlot?: 'mainhand' | 'offhand';
  equipSlots?: EquipmentPart[];
  searchKeys?: readonly string[];
}
