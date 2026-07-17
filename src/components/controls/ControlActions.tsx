import { Check, Download, Link } from 'lucide-react';
import type { ShareStatus } from '../../hooks/useShareLink';

interface ControlActionsProps {
  shareStatus: ShareStatus;
  isExporting: boolean;
  isReadyToSave: boolean;
  copyLabel: string;
  copiedLabel: string;
  saveLabel: string;
  onCopyLink: () => void;
  onExport: () => void;
}

export function ControlActions({
  shareStatus,
  isExporting,
  isReadyToSave,
  copyLabel,
  copiedLabel,
  saveLabel,
  onCopyLink,
  onExport,
}: ControlActionsProps) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          height: '44px', background: 'var(--surface-300)',
          color: shareStatus === 'copied' ? 'var(--success)' : 'var(--text-primary)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontWeight: 600,
          fontSize: '0.875rem', letterSpacing: '0.02em', textTransform: 'uppercase', cursor: 'pointer',
          transition: 'color 0.15s, transform 0.1s, border-color 0.15s',
        }}
        onClick={onCopyLink}
        onMouseEnter={event => {
          if (shareStatus !== 'copied') event.currentTarget.style.color = 'var(--error)';
          event.currentTarget.style.borderColor = 'var(--border-medium)';
        }}
        onMouseLeave={event => {
          event.currentTarget.style.color = shareStatus === 'copied' ? 'var(--success)' : 'var(--text-primary)';
          event.currentTarget.style.borderColor = 'var(--border)';
        }}
        onMouseDown={event => (event.currentTarget.style.transform = 'scale(0.97)')}
        onMouseUp={event => (event.currentTarget.style.transform = 'scale(1)')}
      >
        {shareStatus === 'copied'
          ? <Check size={15} aria-hidden="true" />
          : <Link size={15} aria-hidden="true" />}
        {shareStatus === 'copied' ? copiedLabel : copyLabel}
      </button>

      <button
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          height: '44px', background: 'var(--text-primary)', color: 'var(--bg-app)',
          border: isReadyToSave ? '2px solid rgba(210,180,120,0.8)' : 'none',
          boxShadow: isReadyToSave ? '0 0 15px rgba(210,180,120,0.5)' : 'none',
          borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem',
          letterSpacing: '0.02em', textTransform: 'uppercase',
          cursor: isExporting ? 'not-allowed' : 'pointer', opacity: isExporting ? 0.55 : 1,
          transition: 'opacity 0.2s, transform 0.1s, box-shadow 0.3s, border 0.3s',
        }}
        onClick={onExport}
        disabled={isExporting}
        onMouseDown={event => {
          if (!isExporting) event.currentTarget.style.transform = 'scale(0.97)';
        }}
        onMouseUp={event => (event.currentTarget.style.transform = 'scale(1)')}
      >
        {isExporting
          ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" aria-hidden="true" />
          : <Download size={15} aria-hidden="true" />}
        {saveLabel}
      </button>
    </div>
  );
}
