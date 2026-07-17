// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import type { EquipItem } from '../../types';
import { SlotButton } from './SlotButton';

vi.mock('../canvas/ItemIcon', () => ({
  ItemIcon: () => null,
}));

let container: HTMLDivElement;
let root: Root;
const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};
const facewear: EquipItem = {
  id: 'face',
  label: '얼굴 소품',
  name: '타원형 안경',
  nameKo: '타원형 안경',
  nameEn: 'Oval Spectacles',
  nameJa: 'オーバルグラス',
};

beforeEach(() => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  act(() => root.unmount());
  container.remove();
  await i18n.changeLanguage('ko');
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

async function renderSlot(language: 'en' | 'ja') {
  await act(async () => {
    await i18n.changeLanguage(language);
    root.render(
      <SlotButton
        part="face"
        item={facewear}
        isActive
        onClick={vi.fn()}
      />,
    );
  });
}

describe('SlotButton localization', () => {
  it('uses the English item name in its accessible label', async () => {
    await renderSlot('en');
    expect(container.querySelector('button')?.getAttribute('aria-label')).toBe(
      'Face Accessory: Oval Spectacles',
    );
  });

  it('uses the Japanese item name in its accessible label', async () => {
    await renderSlot('ja');
    expect(container.querySelector('button')?.getAttribute('aria-label')).toBe(
      'フェイスアクセサリー: オーバルグラス',
    );
  });
});
