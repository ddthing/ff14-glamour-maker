import { useCallback, useRef, useState } from 'react';
import { CURRENT_STATE_VERSION, decodeStateValue } from '../features/glamour/stateCodec';
import type { AppState } from '../types';
import { getSafeStorage, readStorage, writeStorage } from '../utils/safeStorage';

export interface Preset {
  id: string;
  version: number;
  name: string;
  title: string;
  creator: string;
  items: AppState['items'];
  fashionAccessory: AppState['fashionAccessory'];
  updatedAt: number;
}

const PRESETS_STORAGE_KEY = 'ff14_glamour_presets';

export interface RemovedPreset {
  preset: Preset;
  index: number;
}

export interface UsePresetsReturn {
  presets: Preset[];
  error: string | null;
  addPreset: (name: string, state: AppState) => boolean;
  removePreset: (id: string) => RemovedPreset | null;
  restorePreset: (preset: Preset, index: number) => boolean;
  clearError: () => void;
}

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
        fashionAccessory: decoded.state.fashionAccessory,
        updatedAt: typeof candidate.updatedAt === 'number' ? candidate.updatedAt : 0,
      }];
    });
  } catch {
    return [];
  }
}

function readStoredPresets(): { presets: Preset[]; error: string | null } {
  if (typeof window === 'undefined') return { presets: [], error: null };
  const storage = getSafeStorage('local');
  if (!storage) return { presets: [], error: 'storage-failed' };
  return { presets: parseStoredPresets(readStorage(storage, PRESETS_STORAGE_KEY)), error: null };
}

export function usePresets(): UsePresetsReturn {
  const [initialState] = useState(readStoredPresets);
  const [presets, setPresets] = useState<Preset[]>(initialState.presets);
  const presetsRef = useRef(presets);
  const [error, setError] = useState<string | null>(initialState.error);

  const savePresetsToStorage = useCallback((newPresets: Preset[]): boolean => {
    const saved = writeStorage(
      getSafeStorage('local'),
      PRESETS_STORAGE_KEY,
      JSON.stringify(newPresets),
    );
    if (!saved) {
      setError('storage-failed');
      return false;
    }
    presetsRef.current = newPresets;
    setPresets(newPresets);
    setError(null);
    return true;
  }, []);

  const addPreset = useCallback((name: string, state: AppState): boolean => {
    if (!name.trim()) return false;

    const newPreset: Preset = {
      id: crypto.randomUUID(),
      version: CURRENT_STATE_VERSION,
      name: name.trim(),
      title: state.title,
      creator: state.creator,
      items: state.items,
      fashionAccessory: state.fashionAccessory,
      updatedAt: Date.now(),
    };

    return savePresetsToStorage([...presetsRef.current, newPreset]);
  }, [savePresetsToStorage]);

  const removePreset = useCallback((id: string): RemovedPreset | null => {
    const index = presetsRef.current.findIndex(preset => preset.id === id);
    if (index < 0) return null;

    const preset = presetsRef.current[index];
    const nextPresets = presetsRef.current.filter(candidate => candidate.id !== id);
    return savePresetsToStorage(nextPresets) ? { preset, index } : null;
  }, [savePresetsToStorage]);

  const restorePreset = useCallback((preset: Preset, index: number): boolean => {
    const nextPresets = [...presetsRef.current];
    const safeIndex = Math.max(0, Math.min(index, nextPresets.length));
    nextPresets.splice(safeIndex, 0, preset);
    return savePresetsToStorage(nextPresets);
  }, [savePresetsToStorage]);

  const clearError = useCallback(() => setError(null), []);

  return { presets, error, addPreset, removePreset, restorePreset, clearError };
}
