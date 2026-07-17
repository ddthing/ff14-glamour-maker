// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INITIAL_ITEMS } from '../../constants/initialState';
import '../../i18n';
import type { AppState, EquipItem, EquipmentPart } from '../../types';
import { EquipmentTab } from './EquipmentTab';

vi.mock('./ItemSearchInput', () => ({
  ItemSearchInput: ({ onSelect }: { onSelect: (item: EquipItem) => void }) => (
    <button
      type="button"
      data-testid="select-item"
      onClick={() => onSelect({
        id: 'head',
        label: '',
        name: '테스트 안경',
        nameEn: 'Test Glasses',
        nameJa: 'テストグラス',
        iconPath: '/test.png',
      })}
    >
      select item
    </button>
  ),
}));

vi.mock('./DyeSearchInput', () => ({
  DyeSearchInput: ({
    placeholder,
    onChange,
  }: {
    placeholder: string;
    onChange: (value: string) => void;
  }) => (
    <button
      type="button"
      data-testid={placeholder.endsWith('1') ? 'dye-1' : 'dye-2'}
      onClick={() => onChange('칠흑색')}
    >
      {placeholder}
    </button>
  ),
}));

vi.mock('./SlotButton', () => ({
  SlotButton: ({
    part,
    isActive,
    onClick,
  }: {
    part: EquipmentPart;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button type="button" data-slot={part} data-active={isActive} onClick={onClick}>
      {part}
    </button>
  ),
}));

let container: HTMLDivElement;
let root: Root;

function createItems(): AppState['items'] {
  return Object.fromEntries(
    Object.entries(INITIAL_ITEMS).map(([part, item]) => [part, { ...item }]),
  ) as AppState['items'];
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('EquipmentTab', () => {
  it('keeps the selected slot active while the user enters dye information', () => {
    const onUpdateItem = vi.fn();

    act(() => {
      root.render(
        <EquipmentTab
          items={createItems()}
          onUpdateItem={onUpdateItem}
          onResetItems={vi.fn()}
        />,
      );
    });

    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="select-item"]')?.click();
    });

    expect(container.querySelector('[data-slot="head"]')?.getAttribute('data-active')).toBe('true');

    act(() => {
      container.querySelector<HTMLButtonElement>('[data-testid="dye-1"]')?.click();
    });

    expect(onUpdateItem).toHaveBeenLastCalledWith('head', { dye1: '칠흑색' });
  });
});
