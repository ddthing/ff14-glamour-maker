import { CheckmarkCircle02Icon, ClipboardCopyIcon, Download04Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';

interface ControlActionsProps {
  isExporting: boolean;
  isReadyToSave: boolean;
  saveLabel: string;
  onExport: () => void;
  hasEquipmentToCopy?: boolean;
  copyEquipmentLabel?: string;
  copyingEquipmentLabel?: string;
  equipmentCopiedLabel?: string;
  equipmentCopyFailedLabel?: string;
  onCopyEquipment?: () => Promise<boolean>;
}

export function ControlActions({
  isExporting,
  isReadyToSave,
  saveLabel,
  onExport,
  hasEquipmentToCopy = false,
  copyEquipmentLabel,
  copyingEquipmentLabel,
  equipmentCopiedLabel,
  equipmentCopyFailedLabel,
  onCopyEquipment,
}: ControlActionsProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (copyState !== 'copied' && copyState !== 'error') return;
    const timeout = window.setTimeout(() => setCopyState('idle'), 2400);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const handleCopyEquipment = async () => {
    if (!onCopyEquipment || !hasEquipmentToCopy || copyState === 'copying') return;
    setCopyState('copying');
    try {
      setCopyState(await onCopyEquipment() ? 'copied' : 'error');
    } catch {
      setCopyState('error');
    }
  };

  const copyLabel = copyState === 'copying'
    ? copyingEquipmentLabel
    : copyState === 'copied'
      ? equipmentCopiedLabel
      : copyState === 'error'
        ? equipmentCopyFailedLabel
        : copyEquipmentLabel;

  return (
    <>
      <div className={`control-actions${onCopyEquipment ? ' control-actions-with-copy' : ''}`}>
        {onCopyEquipment && (
          <button
            type="button"
            className="control-action control-action-secondary"
            onClick={handleCopyEquipment}
            disabled={!hasEquipmentToCopy || copyState === 'copying'}
            aria-busy={copyState === 'copying'}
          >
            <HugeiconsIcon
              icon={copyState === 'copied' ? CheckmarkCircle02Icon : ClipboardCopyIcon}
              size={16}
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <span>{copyLabel}</span>
          </button>
        )}
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
      {onCopyEquipment && (
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {copyState === 'copied'
            ? equipmentCopiedLabel
            : copyState === 'error'
              ? equipmentCopyFailedLabel
              : copyState === 'copying'
                ? copyingEquipmentLabel
                : ''}
        </span>
      )}
    </>
  );
}
