// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { DyeSearchInput } from './DyeSearchInput';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  void i18n.changeLanguage('ko');
});

describe('DyeSearchInput', () => {
  it('renders a legacy dye value in the active language', async () => {
    await act(async () => {
      await i18n.changeLanguage('ja');
    });

    act(() => root.render(
      <DyeSearchInput value="Soot Black" onChange={() => undefined} placeholder="カララント 1" />,
    ));

    expect(container.querySelector<HTMLInputElement>('input')?.value).toBe('スートブラック');
  });
});
