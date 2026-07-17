import type { AppState, EquipmentPart, EquipItem } from '../types';

export const INITIAL_ITEMS: Record<EquipmentPart, EquipItem> = {
  mainhand: { id: 'mainhand', label: '', name: '' },
  offhand:  { id: 'offhand',  label: '', name: '' },
  head:     { id: 'head',     label: '', name: '' },
  body:     { id: 'body',     label: '', name: '' },
  hands:    { id: 'hands',    label: '', name: '' },
  legs:     { id: 'legs',     label: '', name: '' },
  feet:     { id: 'feet',     label: '', name: '' },
  ears:     { id: 'ears',     label: '', name: '' },
  neck:     { id: 'neck',     label: '', name: '' },
  wrists:   { id: 'wrists',   label: '', name: '' },
  rings:    { id: 'rings',    label: '', name: '' },
  rings2:   { id: 'rings2',   label: '', name: '' },
  face:     { id: 'face',     label: '', name: '' },
};

export const INITIAL_STATE: AppState = {
  imageSrc: null,
  croppedImageSrc: null,
  crop: { x: 0, y: 0 },
  zoom: 1,
  title: '',
  creator: '',
  items: INITIAL_ITEMS,
};
