// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { createInitialState } from '../../features/glamour/stateFactory';
import { GeneralTab } from './GeneralTab';

let container: HTMLDivElement;
let root: Root;

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

function renderGeneralTab(onTitleChange = vi.fn(), onCreatorChange = vi.fn()) {
  const state = createInitialState();
  act(() => {
    root.render(
      <GeneralTab
        state={state}
        onTitleChange={onTitleChange}
        onCreatorChange={onCreatorChange}
        onApplyPreset={vi.fn()}
        presets={[]}
        onAddPreset={vi.fn(() => true)}
        onRemovePreset={vi.fn()}
      />,
    );
  });
  return { onTitleChange, onCreatorChange };
}

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('GeneralTab live preview fields', () => {
  it('commits each title change immediately without waiting for blur or losing focus', () => {
    const onTitleChange = vi.fn();
    renderGeneralTab(onTitleChange);
    const titleInput = container.querySelector<HTMLInputElement>('#glamour-set-name');
    expect(titleInput).not.toBeNull();

    act(() => {
      titleInput!.focus();
      setInputValue(titleInput!, 'Moonlit look');
    });

    expect(onTitleChange).toHaveBeenCalledExactlyOnceWith('Moonlit look');
    expect(document.activeElement).toBe(titleInput);

    act(() => titleInput!.blur());
    expect(onTitleChange).toHaveBeenCalledOnce();
  });

  it('commits creator changes immediately', () => {
    const onCreatorChange = vi.fn();
    renderGeneralTab(undefined, onCreatorChange);
    const creatorInput = container.querySelector<HTMLInputElement>('#glamour-creator');
    expect(creatorInput).not.toBeNull();

    act(() => setInputValue(creatorInput!, '@gpose'));

    expect(onCreatorChange).toHaveBeenCalledExactlyOnceWith('@gpose');
  });
});
