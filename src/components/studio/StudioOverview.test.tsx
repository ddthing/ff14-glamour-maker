// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { StudioOverview } from './StudioOverview';

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  await i18n.changeLanguage('ko');
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('StudioOverview', () => {
  it('marks export readiness only when both the photo and equipment steps are complete', () => {
    act(() => root.render(<StudioOverview hasPhoto hasEquipment={false} />));
    let steps = container.querySelectorAll<HTMLLIElement>('.studio-progress-step');

    expect(steps[0].dataset.complete).toBe('true');
    expect(steps[1].dataset.complete).toBeUndefined();
    expect(steps[2].dataset.complete).toBeUndefined();

    act(() => root.render(<StudioOverview hasPhoto hasEquipment />));
    steps = container.querySelectorAll<HTMLLIElement>('.studio-progress-step');
    expect([...steps].every(step => step.dataset.complete === 'true')).toBe(true);
  });
});
