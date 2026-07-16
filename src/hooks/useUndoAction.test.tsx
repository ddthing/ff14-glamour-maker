// @vitest-environment jsdom

import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUndoAction, type UseUndoActionReturn } from './useUndoAction';

let container: HTMLDivElement;
let root: Root;
let current: UseUndoActionReturn;
const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

function Harness() {
  const undoAction = useUndoAction(5_000);
  useEffect(() => {
    current = undoAction;
  }, [undoAction]);
  return null;
}

beforeEach(() => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<Harness />));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

describe('useUndoAction', () => {
  it('keeps only the latest action and executes its undo callback', () => {
    const firstUndo = vi.fn();
    const secondUndo = vi.fn();

    act(() => current.registerUndo({ message: 'first', undo: firstUndo }));
    act(() => current.registerUndo({ message: 'second', undo: secondUndo }));
    act(() => current.undo());

    expect(firstUndo).not.toHaveBeenCalled();
    expect(secondUndo).toHaveBeenCalledOnce();
    expect(current.action).toBeNull();
  });

  it('expires the action after the configured window', () => {
    act(() => current.registerUndo({ message: 'temporary', undo: vi.fn() }));
    expect(current.action?.message).toBe('temporary');

    act(() => vi.advanceTimersByTime(5_000));
    expect(current.action).toBeNull();
  });
});
