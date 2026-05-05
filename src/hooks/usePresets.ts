import { useState } from 'react';
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
  // ── Lazy init: 첫 렌더부터 저장된 프리셋을 올바르게 표시 ──────────────────
  // useEffect에서 읽으면 첫 렌더가 [] → 마운트 후 실제 데이터로 교체되어 깜박임 발생.
  // lazy initializer는 첫 렌더 전에 실행되므로 깜박임 없음.
  const [presets, setPresets] = useState<Preset[]>(() => {
    try {
      const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Preset[]) : [];
    } catch {
      return [];
    }
  });

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
