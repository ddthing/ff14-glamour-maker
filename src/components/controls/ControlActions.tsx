import { Download04Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface ControlActionsProps {
  isExporting: boolean;
  isReadyToSave: boolean;
  saveLabel: string;
  onExport: () => void;
}

export function ControlActions({
  isExporting,
  isReadyToSave,
  saveLabel,
  onExport,
}: ControlActionsProps) {
  return (
    <div className="control-actions">
      <button
        type="button"
        className="control-action control-action-primary"
        onClick={onExport}
        disabled={isExporting}
        data-ready={isReadyToSave || undefined}
      >
        {isExporting
          ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" aria-hidden="true" />
          : <HugeiconsIcon icon={Download04Icon} size={16} strokeWidth={1.7} aria-hidden="true" />}
        {saveLabel}
      </button>
    </div>
  );
}
