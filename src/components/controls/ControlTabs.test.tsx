// @vitest-environment jsdom

import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ControlTabs, type ControlTab } from './ControlTabs';

let container: HTMLDivElement;
let root: Root;
const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

function Harness() {
  const [activeTab, setActiveTab] = useState<ControlTab>('equipment');
  return (
    <ControlTabs
      activeTab={activeTab}
      equipmentLabel="Equipment"
      generalLabel="General"
      onChange={setActiveTab}
    />
  );
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

describe('ControlTabs', () => {
  it('keeps tab and panel ARIA relationships while switching tabs', () => {
    const equipmentTab = container.querySelector<HTMLButtonElement>('#equipment-tab');
    const generalTab = container.querySelector<HTMLButtonElement>('#general-tab');

    expect(equipmentTab?.getAttribute('aria-selected')).toBe('true');
    expect(equipmentTab?.getAttribute('aria-controls')).toBe('control-tabpanel');
    expect(generalTab?.getAttribute('aria-selected')).toBe('false');

    act(() => generalTab?.click());

    expect(equipmentTab?.getAttribute('aria-selected')).toBe('false');
    expect(generalTab?.getAttribute('aria-selected')).toBe('true');
  });
});
