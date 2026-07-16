import { useCallback, useEffect, useRef, useState } from 'react';

export interface UndoAction {
  message: string;
  undo: () => void;
}

export interface UseUndoActionReturn {
  action: UndoAction | null;
  registerUndo: (action: UndoAction) => void;
  undo: () => void;
  clear: () => void;
}

export function useUndoAction(timeoutMs = 5_000): UseUndoActionReturn {
  const [action, setAction] = useState<UndoAction | null>(null);
  const actionRef = useRef<UndoAction | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    actionRef.current = null;
    setAction(null);
  }, []);

  const registerUndo = useCallback((nextAction: UndoAction) => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    actionRef.current = nextAction;
    setAction(nextAction);
    timeoutRef.current = window.setTimeout(clear, timeoutMs);
  }, [clear, timeoutMs]);

  const undo = useCallback(() => {
    const currentAction = actionRef.current;
    clear();
    currentAction?.undo();
  }, [clear]);

  useEffect(() => clear, [clear]);

  return { action, registerUndo, undo, clear };
}
