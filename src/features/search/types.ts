import type { EquipmentPart } from '../../types';

export type ItemSource = 'item' | 'facewear';
export type TranslationStatus = 'complete' | 'partial' | 'kr-only' | 'review';

export interface FF14Item {
  id: number;
  name: string;
  nameEn: string;
  nameJa: string;
  iconPath?: string;
  iconAssetKey?: string;
  translationStatus?: TranslationStatus;
  uiCategory?: number;
  source?: ItemSource;
  equipSlot?: 'mainhand' | 'offhand';
  equipSlots?: EquipmentPart[];
}
