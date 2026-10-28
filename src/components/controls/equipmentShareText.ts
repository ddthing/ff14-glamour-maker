import { SLOT_ORDER } from '../../constants/slots';
import { findDye, getLocalizedDyeName } from '../../utils/dyes';
import { getLocalizedItemNames } from '../../utils/formatters';
import type { AppState, EquipmentPart, FashionAccessorySelection } from '../../types';

interface EquipmentShareLabels {
  title: string;
  creator: string;
  dye: string;
  slot: (part: EquipmentPart | 'fashionAccessory') => string;
}

function getLocalizedAccessoryName(accessory: FashionAccessorySelection, language: string): string {
  if (language.startsWith('en')) return accessory.nameEn || accessory.nameKo || accessory.nameJa;
  if (language.startsWith('ja')) return accessory.nameJa || accessory.nameKo || accessory.nameEn;
  return accessory.nameKo || accessory.nameEn || accessory.nameJa;
}

export function buildEquipmentShareText(
  state: AppState,
  language: string,
  labels: EquipmentShareLabels,
): string {
  const equipmentLines = SLOT_ORDER.flatMap(part => {
    const item = state.items[part];
    if (!item.name) return [];

    const itemName = getLocalizedItemNames(item, language).main;
    const dyes = [item.dye1, item.dye2]
      .map((value, index) => {
        if (!value) return null;
        const dye = findDye(value);
        if (dye?.name === '기본색') return null;
        const dyeName = getLocalizedDyeName(dye, language, value);
        return dyeName ? `${labels.dye} ${index + 1}: ${dyeName}` : null;
      })
      .filter((value): value is string => Boolean(value));

    const dyeText = dyes.length > 0 ? ` (${dyes.join(' · ')})` : '';
    return [`${labels.slot(part)}: ${itemName}${dyeText}`];
  });

  if (state.fashionAccessory) {
    equipmentLines.push(
      `${labels.slot('fashionAccessory')}: ${getLocalizedAccessoryName(state.fashionAccessory, language)}`,
    );
  }

  const header = [
    state.title.trim() || labels.title,
    state.creator.trim() ? `${labels.creator}: ${state.creator.trim()}` : '',
  ].filter(Boolean);

  return [...header, '', ...equipmentLines].join('\n');
}
