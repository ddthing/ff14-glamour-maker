// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { INITIAL_ITEMS } from '../../constants/initialState';
import '../../i18n';
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

    expect(container.querySelector('h2')?.textContent).toBe('Library Look');
    expect(container.querySelector<HTMLElement>('h2')?.style.textShadow).toBe('');
    expect(container.textContent).toContain('@scholar');
    expect(container.textContent).toContain('Glamour');
  });

  it('renders the existing three-step empty equipment guidance', () => {
    act(() => root.render(
      <EquipmentList
        items={createEmptyItems()}
        fashionAccessory={null}
        emptyTitle="Create Your Glamour Card"
        emptySteps={['Upload Character Photo', 'Add Equipment', 'Save Image']}
      />,
    ));

    expect(container.textContent).toContain('Create Your Glamour Card');
    expect(container.textContent).toContain('Upload Character Photo');
    expect(container.textContent).toContain('Add Equipment');
    expect(container.textContent).toContain('Save Image');
  });

  it('adds breathable spacing for short equipment lists', () => {
    const items = createEmptyItems();
    for (const item of Object.values(items).slice(0, 3)) item.name = `Selected ${item.id}`;

    act(() => root.render(
      <EquipmentList
        items={items}
        fashionAccessory={null}
        emptyTitle="Create Your Glamour Card"
        emptySteps={['Upload Character Photo', 'Add Equipment', 'Save Image']}
      />,
    ));

    const list = container.querySelector<HTMLElement>('[data-canvas-list="equipment"]');
    expect(list?.style.gap).toBe('10px');
    expect(list?.style.paddingBlock).toBe('20px');
  });

  it('renders one separator between full rows and none above the footer', () => {
    const items = createEmptyItems();
    for (const item of Object.values(items)) item.name = `Selected ${item.id}`;

    act(() => root.render(
      <EquipmentList
        items={items}
        fashionAccessory={{
          id: 30269,
          nameKo: '파라솔',
          nameEn: 'Parasol',
          nameJa: 'パラソル',
          iconPath: '/i/058000/058001.png',
        }}
        emptyTitle="Create Your Glamour Card"
        emptySteps={['Upload Character Photo', 'Add Equipment', 'Save Image']}
      />,
    ));

    const rows = container.querySelectorAll<HTMLElement>('[data-canvas-row]');
    expect(rows).toHaveLength(14);
    const list = container.querySelector<HTMLElement>('[data-canvas-list="equipment"]');
    expect(list?.style.gap).toBe('2px');
    expect(list?.style.paddingBlock).toBe('4px');
    expect(rows[rows.length - 2].style.borderBottom).toContain('1px');
    expect(rows[rows.length - 1].style.borderBottom).toBe('');
  });
});
