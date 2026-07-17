import { Download } from 'lucide-react';

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
          : <Download size={15} aria-hidden="true" />}
        {saveLabel}
      </button>
    </div>
  );
}
