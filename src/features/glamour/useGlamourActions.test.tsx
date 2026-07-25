// @vitest-environment jsdom

import { act, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { INITIAL_ITEMS, INITIAL_STATE } from '../../constants/initialState';
import type { AppState } from '../../types';
import { useGlamourActions, type GlamourActions } from './useGlamourActions';

let container: HTMLDivElement;
let root: Root;
let currentState: AppState;
let actions: GlamourActions;
const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

function cloneInitialState(): AppState {
  return {
    ...INITIAL_STATE,
    items: Object.fromEntries(
      Object.entries(INITIAL_ITEMS).map(([slot, item]) => [slot, { ...item }]),
    ) as AppState['items'],
  };
}

function Harness() {
  const [state, setState] = useState(cloneInitialState);
  const glamourActions = useGlamourActions(setState);

  useEffect(() => {
    currentState = state;
    actions = glamourActions;
  }, [glamourActions, state]);

  return null;
}

beforeEach(() => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<Harness />));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

describe('useGlamourActions', () => {
  it('updates title and creator without replacing equipment', () => {
    const previousItems = currentState.items;

    act(() => {
      actions.setTitle('Midnight Duelist');
      actions.setCreator('@warrior');
    });

    expect(currentState.title).toBe('Midnight Duelist');
    expect(currentState.creator).toBe('@warrior');
    expect(currentState.items).toBe(previousItems);
  });

  it('updates only the requested equipment slot', () => {
    const previousBody = currentState.items.body;

    act(() => actions.updateItem('head', {
      name: 'Friendship Circlet',
      nameEn: 'Friendship Circlet',
      dye1: 'Snow White',
    }));

    expect(currentState.items.head).toMatchObject({
      name: 'Friendship Circlet',
      nameEn: 'Friendship Circlet',
      dye1: 'Snow White',
    });
    expect(currentState.items.body).toBe(previousBody);
  });

  it('replaces equipment for preset restoration without changing the photo', () => {
    act(() => actions.setPhoto('blob:cropped-photo'));
    const presetItems = {
      ...currentState.items,
      face: { ...currentState.items.face, name: 'Classic Spectacles' },
    };

    act(() => actions.applyPreset({
      title: 'Library Look',
      creator: '@scholar',
      items: presetItems,
    }));

    expect(currentState).toMatchObject({
      title: 'Library Look',
      creator: '@scholar',
      croppedImageSrc: 'blob:cropped-photo',
    });
    expect(currentState.items.face.name).toBe('Classic Spectacles');
  });

  it('restores a supplied equipment snapshot for undo', () => {
    const snapshot = {
      ...currentState.items,
      mainhand: { ...currentState.items.mainhand, name: 'Curtana' },
    };

    act(() => actions.replaceItems(snapshot));
    act(() => actions.resetItems());
    expect(currentState.items.mainhand.name).toBe('');

    act(() => actions.replaceItems(snapshot));
    expect(currentState.items.mainhand.name).toBe('Curtana');
  });
});
