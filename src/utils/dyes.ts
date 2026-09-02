import { FF14_DYES } from '../constants/dyes';
import type { FF14Dye } from '../types';

function normalizeDyeName(value: string): string {
  return value.trim().toLocaleLowerCase();
}

/** Finds a dye by its canonical Korean name or one of its localized aliases. */
export function findDye(value: string): FF14Dye | undefined {
  const normalizedValue = normalizeDyeName(value);
  if (!normalizedValue) return undefined;

  return FF14_DYES.find(dye => [dye.name, dye.nameEn, dye.nameJa]
    .filter((name): name is string => Boolean(name))
    .some(name => normalizeDyeName(name) === normalizedValue));
}

/** Returns the name that belongs to the active UI language. */
export function getLocalizedDyeName(
  dye: FF14Dye | undefined,
  language: string,
  fallback = '',
): string {
  if (!dye) return fallback;

  if (language.startsWith('en')) return dye.nameEn || dye.name || dye.nameJa || fallback;
  if (language.startsWith('ja')) return dye.nameJa || dye.name || dye.nameEn || fallback;
  return dye.name || dye.nameEn || dye.nameJa || fallback;
}
