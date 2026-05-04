import { useState, useEffect } from 'react';
import type { AppState, EquipmentPart, EquipItem } from '../types';

export interface Preset {
  id: string;
  name: string;
  title: string;
  creator: string;
  items: Record<EquipmentPart, EquipItem>;
  updatedAt: number;
}

const PRESETS_STORAGE_KEY = 'ff14_glamour_presets';

/**
 * usePresets — 로컬 스토리지 기반 프리셋 관리 훅
 * P1 수정: console.error → 조용히 실패, alert() → 제거
 */
export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);

  // Load presets on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (stored) {
        setPresets(JSON.parse(stored));
      }
    } catch {
      // 손상된 데이터는 무시하고 빈 상태로 시작
    }
  }, []);

  // Save presets whenever they change
  const savePresetsToStorage = (newPresets: Preset[]) => {
    setPresets(newPresets);
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(newPresets));
    } catch {
      // 스토리지 가득 참 — 조용히 실패 (향후 Toast로 대체 예정)
    }
  };

  const addPreset = (name: string, state: AppState) => {
    if (!name.trim()) return;

    const newPreset: Preset = {
      id: crypto.randomUUID(),
      name: name.trim(),
      title: state.title,
      creator: state.creator,
      items: state.items,
      updatedAt: Date.now(),
    };

    savePresetsToStorage([...presets, newPreset]);
  };

  const removePreset = (id: string) => {
    savePresetsToStorage(presets.filter(p => p.id !== id));
  };

  return { presets, addPreset, removePreset };
}
