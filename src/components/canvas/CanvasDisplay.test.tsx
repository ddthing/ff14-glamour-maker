// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { INITIAL_ITEMS } from '../../constants/initialState';
import type { AppState } from '../../types';
import { CanvasHeading } from './CanvasHeading';
import { EquipmentList } from './EquipmentList';

let container: HTMLDivElement;
let root: Root;
const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

function createEmptyItems(): AppState['items'] {
  return Object.fromEntries(
    Object.entries(INITIAL_ITEMS).map(([slot, item]) => [slot, { ...item }]),
  ) as AppState['items'];
}

beforeEach(() => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

describe('canvas display components', () => {
  it('renders the title and creator without owning application state', () => {
    act(() => root.render(
      <CanvasHeading title="Library Look" creator="@scholar" label="Glamour" />,
    ));

    expect(container.querySelector('h1')?.textContent).toBe('Library Look');
    expect(container.textContent).toContain('@scholar');
    expect(container.textContent).toContain('Glamour');
  });

  it('renders the existing three-step empty equipment guidance', () => {
    act(() => root.render(
      <EquipmentList
        items={createEmptyItems()}
        emptyTitle="Create Your Glamour Card"
        emptySteps={['Upload Character Photo', 'Add Equipment', 'Save Image']}
      />,
    ));

    expect(container.textContent).toContain('Create Your Glamour Card');
    expect(container.textContent).toContain('Upload Character Photo');
    expect(container.textContent).toContain('Add Equipment');
    expect(container.textContent).toContain('Save Image');
  });
});
