import { useCallback, useRef, useState } from 'react';
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
        updatedAt: typeof candidate.updatedAt === 'number' ? candidate.updatedAt : 0,
      }];
    });
  } catch {
    return [];
  }
}

function readStoredPresets(): { presets: Preset[]; error: string | null } {
  try {
    return {
      presets: parseStoredPresets(localStorage.getItem(PRESETS_STORAGE_KEY)),
      error: null,
    };
  } catch {
    return { presets: [], error: 'storage-failed' };
  }
}

export function usePresets(): UsePresetsReturn {
  const initialState = useRef<ReturnType<typeof readStoredPresets> | null>(null);
  initialState.current ??= readStoredPresets();
  const [presets, setPresets] = useState<Preset[]>(initialState.current.presets);
  const presetsRef = useRef(presets);
  const [error, setError] = useState<string | null>(initialState.current.error);

  const savePresetsToStorage = useCallback((newPresets: Preset[]): boolean => {
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(newPresets));
      presetsRef.current = newPresets;
      setPresets(newPresets);
      setError(null);
      return true;
    } catch {
      setError('storage-failed');
      return false;
    }
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
