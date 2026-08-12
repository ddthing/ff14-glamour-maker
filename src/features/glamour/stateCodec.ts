import { INITIAL_ITEMS } from '../../constants/initialState';
import { createInitialState } from './stateFactory';
import type { AppState, EquipmentPart, EquipItem } from '../../types';

export const CURRENT_STATE_VERSION = 1;

export interface DecodeStateResult {
  state: AppState;
  status: 'empty' | 'valid' | 'recovered' | 'invalid';
  warnings: string[];
}

const ITEM_STRING_FIELDS = [
  'label', 'name', 'nameKo', 'nameEn', 'nameJa',
  'iconPath', 'dye1', 'dye2', 'error',
] as const satisfies ReadonlyArray<keyof EquipItem>;

const VALID_SLOTS = new Set<EquipmentPart>(Object.keys(INITIAL_ITEMS) as EquipmentPart[]);

function cloneInitialState(): AppState {
  return createInitialState();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeString(
  value: unknown,
  fallback: string,
  field: string,
  warnings: string[],
  maxLength = 500,
): string {
  if (value === undefined) return fallback;
  if (typeof value !== 'string') {
    warnings.push(`${field} must be a string`);
    return fallback;
  }
  if (value.length > maxLength) {
    warnings.push(`${field} was truncated`);
    return value.slice(0, maxLength);
  }
  return value;
}

function sanitizeNumber(
  value: unknown,
  fallback: number,
  field: string,
  warnings: string[],
  minimum: number,
  maximum: number,
): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    warnings.push(`${field} must be a finite number`);
    return fallback;
  }
  if (value < minimum || value > maximum) {
    warnings.push(`${field} was outside the allowed range`);
    return fallback;
  }
  return value;
}

function sanitizeItem(slot: EquipmentPart, value: unknown, warnings: string[]): EquipItem {
  const fallback = INITIAL_ITEMS[slot];
  if (!isRecord(value)) {
    if (value !== undefined) warnings.push(`items.${slot} must be an object`);
    return { ...fallback };
  }

  const item: EquipItem = { ...fallback, id: slot };
  for (const field of ITEM_STRING_FIELDS) {
    const fallbackValue = typeof fallback[field] === 'string' ? fallback[field] : '';
    Object.assign(item, {
      [field]: sanitizeString(value[field], fallbackValue, `items.${slot}.${field}`, warnings),
    });
  }
  return item;
}

function sanitizeState(value: unknown): DecodeStateResult {
  const warnings: string[] = [];
  const initial = cloneInitialState();
  if (!isRecord(value)) {
    return { state: initial, status: 'invalid', warnings: ['state must be an object'] };
  }

  const items = { ...initial.items };
  if (value.items !== undefined) {
    if (!isRecord(value.items)) {
      warnings.push('items must be an object');
    } else {
      for (const [slot, item] of Object.entries(value.items)) {
        if (!VALID_SLOTS.has(slot as EquipmentPart)) {
          warnings.push(`unknown slot: ${slot}`);
          continue;
        }
        const validSlot = slot as EquipmentPart;
        items[validSlot] = sanitizeItem(validSlot, item, warnings);
      }
    }
  }

  const cropValue = isRecord(value.crop) ? value.crop : {};
  if (value.crop !== undefined && !isRecord(value.crop)) warnings.push('crop must be an object');

  const state: AppState = {
    imageSrc: null,
    croppedImageSrc: null,
    title: sanitizeString(value.title, initial.title, 'title', warnings, 120),
    creator: sanitizeString(value.creator, initial.creator, 'creator', warnings, 80),
    crop: {
      x: sanitizeNumber(cropValue.x, initial.crop.x, 'crop.x', warnings, -10_000, 10_000),
      y: sanitizeNumber(cropValue.y, initial.crop.y, 'crop.y', warnings, -10_000, 10_000),
    },
    zoom: sanitizeNumber(value.zoom, initial.zoom, 'zoom', warnings, 0.1, 10),
    items,
  };

  return { state, status: warnings.length > 0 ? 'recovered' : 'valid', warnings };
}

export function decodeStateValue(value: unknown): DecodeStateResult {
  if (!isRecord(value)) {
    return { state: cloneInitialState(), status: 'invalid', warnings: ['state must be an object'] };
  }
  const state = { ...value };
  delete state.version;
  return sanitizeState(state);
}
