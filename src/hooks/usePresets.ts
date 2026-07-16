import { useState } from 'react';
import { CURRENT_STATE_VERSION, decodeStateValue } from '../features/glamour/stateCodec';
import type { AppState } from '../types';

export interface Preset {
  id: string;
  version: number;
  name: string;
  title: string;
  creator: string;
  items: AppState['items'];
  updatedAt: number;
}

const PRESETS_STORAGE_KEY = 'ff14_glamour_presets';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseStoredPresets(value: string | null): Preset[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((candidate): Preset[] => {
      if (!isRecord(candidate)) return [];
      if (typeof candidate.id !== 'string' || typeof candidate.name !== 'string') return [];

      const decoded = decodeStateValue(candidate);
      return [{
        id: candidate.id,
        version: CURRENT_STATE_VERSION,
        name: candidate.name.trim() || 'Preset',
        title: decoded.state.title,
        creator: decoded.state.creator,
        items: decoded.state.items,
        updatedAt: typeof candidate.updatedAt === 'number' ? candidate.updatedAt : 0,
      }];
    });
  } catch {
    return [];
  }
}

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>(() =>
    parseStoredPresets(localStorage.getItem(PRESETS_STORAGE_KEY)),
  );

  const savePresetsToStorage = (newPresets: Preset[]) => {
    setPresets(newPresets);
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(newPresets));
    } catch {
      // UI feedback is added in the P1 interaction pass.
    }
  };

  const addPreset = (name: string, state: AppState) => {
    if (!name.trim()) return;

    const newPreset: Preset = {
      id: crypto.randomUUID(),
      version: CURRENT_STATE_VERSION,
      name: name.trim(),
      title: state.title,
      creator: state.creator,
      items: state.items,
      updatedAt: Date.now(),
    };

    savePresetsToStorage([...presets, newPreset]);
  };

  const removePreset = (id: string) => {
    savePresetsToStorage(presets.filter(preset => preset.id !== id));
  };

  return { presets, addPreset, removePreset };
}
