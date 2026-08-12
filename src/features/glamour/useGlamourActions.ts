import { useCallback, useMemo, type Dispatch, type SetStateAction } from 'react';
import { cloneItems, createInitialItems } from './stateFactory';
import type { AppState, EquipmentPart, EquipItem, FashionAccessorySelection } from '../../types';

interface PresetState {
  title: string;
  creator: string;
  items: AppState['items'];
  fashionAccessory?: FashionAccessorySelection | null;
}

export interface GlamourActions {
  setTitle: (title: string) => void;
  setCreator: (creator: string) => void;
  updateItem: (part: EquipmentPart, updates: Partial<EquipItem>) => void;
  replaceItems: (items: AppState['items']) => void;
  resetItems: () => void;
  setFashionAccessory: (accessory: FashionAccessorySelection | null) => void;
  applyPreset: (preset: PresetState) => void;
  setPhoto: (croppedImageSrc: string, imageSrc: string) => void;
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
    setState(current => ({ ...current, items: cloneItems(items) }));
  }, [setState]);

  const resetItems = useCallback(() => {
    setState(current => ({ ...current, items: createInitialItems(), fashionAccessory: null }));
  }, [setState]);

  const setFashionAccessory = useCallback((fashionAccessory: FashionAccessorySelection | null) => {
    setState(current => ({ ...current, fashionAccessory }));
  }, [setState]);

  const applyPreset = useCallback((preset: PresetState) => {
    setState(current => ({
      ...current,
      title: preset.title,
      creator: preset.creator,
      items: cloneItems(preset.items),
      fashionAccessory: preset.fashionAccessory ?? null,
    }));
  }, [setState]);

  const setPhoto = useCallback((croppedImageSrc: string, imageSrc: string) => {
    setState(current => ({ ...current, croppedImageSrc, imageSrc }));
  }, [setState]);

  return useMemo(() => ({
    setTitle,
    setCreator,
    updateItem,
    replaceItems,
    resetItems,
    setFashionAccessory,
    applyPreset,
    setPhoto,
  }), [applyPreset, replaceItems, resetItems, setCreator, setFashionAccessory, setPhoto, setTitle, updateItem]);
}
