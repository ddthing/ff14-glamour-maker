import { useCallback, useMemo, type Dispatch, type SetStateAction } from 'react';
import { INITIAL_ITEMS } from '../../constants/initialState';
import type { AppState, EquipmentPart, EquipItem } from '../../types';

interface PresetState {
  title: string;
  creator: string;
  items: AppState['items'];
}

export interface GlamourActions {
  setTitle: (title: string) => void;
  setCreator: (creator: string) => void;
  updateItem: (part: EquipmentPart, updates: Partial<EquipItem>) => void;
  replaceItems: (items: AppState['items']) => void;
  resetItems: () => void;
  applyPreset: (preset: PresetState) => void;
  setPhoto: (croppedImageSrc: string) => void;
}

function createInitialItems(): AppState['items'] {
  return Object.fromEntries(
    Object.entries(INITIAL_ITEMS).map(([part, item]) => [part, { ...item }]),
  ) as AppState['items'];
}

export function useGlamourActions(
  setState: Dispatch<SetStateAction<AppState>>,
): GlamourActions {
  const setTitle = useCallback((title: string) => {
    setState(current => ({ ...current, title }));
  }, [setState]);

  const setCreator = useCallback((creator: string) => {
    setState(current => ({ ...current, creator }));
  }, [setState]);

  const updateItem = useCallback((part: EquipmentPart, updates: Partial<EquipItem>) => {
    setState(current => ({
      ...current,
      items: {
        ...current.items,
        [part]: { ...current.items[part], ...updates },
      },
    }));
  }, [setState]);

  const replaceItems = useCallback((items: AppState['items']) => {
    setState(current => ({ ...current, items }));
  }, [setState]);

  const resetItems = useCallback(() => {
    setState(current => ({ ...current, items: createInitialItems() }));
  }, [setState]);

  const applyPreset = useCallback((preset: PresetState) => {
    setState(current => ({
      ...current,
      title: preset.title,
      creator: preset.creator,
      items: preset.items,
    }));
  }, [setState]);

  const setPhoto = useCallback((croppedImageSrc: string) => {
    setState(current => ({ ...current, croppedImageSrc, imageSrc: null }));
  }, [setState]);

  return useMemo(() => ({
    setTitle,
    setCreator,
    updateItem,
    replaceItems,
    resetItems,
    applyPreset,
    setPhoto,
  }), [applyPreset, replaceItems, resetItems, setCreator, setPhoto, setTitle, updateItem]);
}
