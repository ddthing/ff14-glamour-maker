import { useEffect } from 'react';

interface StudioKeyboardShortcutsOptions {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  return Boolean(target.closest(
    'input, textarea, select, [role="textbox"], [contenteditable]:not([contenteditable="false"])',
  ));
}

export function useStudioKeyboardShortcuts({
  canUndo,
  canRedo,
  undo,
  redo,
}: StudioKeyboardShortcutsOptions): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((!event.ctrlKey && !event.metaKey) || event.altKey || event.isComposing || isEditableTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 'z' && event.shiftKey && canRedo) {
        event.preventDefault();
        redo();
      } else if (key === 'z' && !event.shiftKey && canUndo) {
        event.preventDefault();
        undo();
      } else if (key === 'y' && canRedo) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canRedo, canUndo, redo, undo]);
}
