// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStudioKeyboardShortcuts } from './useStudioKeyboardShortcuts';

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

function ShortcutHarness(props: Parameters<typeof useStudioKeyboardShortcuts>[0]) {
  useStudioKeyboardShortcuts(props);
  return <><input aria-label="Text field" /><div contentEditable="true" aria-label="Editable canvas" /></>;
}

function dispatchShortcut(target: EventTarget, key: string, modifiers: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...modifiers });
  target.dispatchEvent(event);
  return event;
}

describe('useStudioKeyboardShortcuts', () => {
  it('handles undo and redo outside editable controls', () => {
    const undo = vi.fn();
    const redo = vi.fn();
    act(() => root.render(<ShortcutHarness canUndo canRedo undo={undo} redo={redo} />));

    let undoEvent: KeyboardEvent;
    let redoEvent: KeyboardEvent;
    let macRedoEvent: KeyboardEvent;
    act(() => {
      undoEvent = dispatchShortcut(document.body, 'z', { ctrlKey: true });
      redoEvent = dispatchShortcut(document.body, 'y', { ctrlKey: true });
      macRedoEvent = dispatchShortcut(document.body, 'z', { metaKey: true, shiftKey: true });
    });

    expect(undo).toHaveBeenCalledOnce();
    expect(redo).toHaveBeenCalledTimes(2);
    expect(undoEvent!.defaultPrevented).toBe(true);
    expect(redoEvent!.defaultPrevented).toBe(true);
    expect(macRedoEvent!.defaultPrevented).toBe(true);
  });

  it('leaves native text undo untouched in inputs and editable content', () => {
    const undo = vi.fn();
    const redo = vi.fn();
    act(() => root.render(<ShortcutHarness canUndo canRedo undo={undo} redo={redo} />));
    const input = container.querySelector('input')!;
    const editable = container.querySelector('[contenteditable="true"]')!;

    let inputEvent: KeyboardEvent;
    let editableEvent: KeyboardEvent;
    act(() => {
      inputEvent = dispatchShortcut(input, 'z', { ctrlKey: true });
      editableEvent = dispatchShortcut(editable, 'z', { ctrlKey: true });
    });

    expect(undo).not.toHaveBeenCalled();
    expect(redo).not.toHaveBeenCalled();
    expect(inputEvent!.defaultPrevented).toBe(false);
    expect(editableEvent!.defaultPrevented).toBe(false);
  });
});
