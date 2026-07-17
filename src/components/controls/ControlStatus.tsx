import { AlertCircle, RotateCcw } from 'lucide-react';
import type { UndoAction } from '../../hooks/useUndoAction';

interface ControlStatusProps {
  presetError: string | null;
  exportError: string | null;
  undoAction: UndoAction | null;
  presetFailedLabel: string;
  exportFailedLabel: string;
  retryLabel: string;
  undoLabel: string;
  onRetryExport: () => void;
  onUndo: () => void;
}

export function ControlStatus({
  presetError, exportError, undoAction, presetFailedLabel,
  exportFailedLabel, retryLabel, undoLabel, onRetryExport, onUndo,
}: ControlStatusProps) {
  return (
    <div aria-live="polite" aria-atomic="true">
      {presetError && (
        <p className="text-xs text-[var(--error)]" role="alert" style={{ margin: 0 }}>
          {presetFailedLabel}
        </p>
      )}
      {exportError && (
        <div className="flex items-center justify-between gap-3 text-xs text-[var(--error)]" role="alert">
          <span className="flex items-center gap-1.5">
            <AlertCircle size={14} aria-hidden="true" />
            {exportFailedLabel}
          </span>
          <button
            type="button"
            className="flex shrink-0 items-center gap-1 font-bold underline underline-offset-2"
            onClick={onRetryExport}
          >
            <RotateCcw size={12} aria-hidden="true" />
            {retryLabel}
          </button>
        </div>
      )}
      {undoAction && (
        <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
          <span>{undoAction.message}</span>
          <button
            type="button"
            className="shrink-0 font-bold text-[var(--accent)] underline underline-offset-2"
            onClick={onUndo}
          >
            {undoLabel}
          </button>
        </div>
      )}
    </div>
  );
}
