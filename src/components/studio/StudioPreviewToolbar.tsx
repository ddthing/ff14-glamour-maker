import { Redo02Icon, Undo02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { StudioDraftStatus } from '../../features/studio/useStudioState';

interface StudioPreviewToolbarProps {
  draftStatus: StudioDraftStatus;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  retrySave: () => void;
  helpControl?: ReactNode;
}

export function StudioPreviewToolbar({
  draftStatus,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  retrySave,
  helpControl,
}: StudioPreviewToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="studio-preview-toolbar">
      <div className="studio-preview-heading">
        <div className="studio-preview-title-row">
          <h2
            className="studio-preview-title"
            title={t('common.canvas_export_spec')}
            aria-describedby="studio-preview-output-spec"
          >
            {t('common.preview')}
          </h2>
        </div>
        <span id="studio-preview-output-spec" className="sr-only">{t('common.canvas_export_spec')}</span>
      </div>

      <div className="studio-preview-actions">
        <div className="studio-draft-status-group">
          <div
            className="studio-draft-status"
            data-status={draftStatus}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="studio-draft-status-dot" aria-hidden="true" />
            <span>{t(`common.draft_${draftStatus}`)}</span>
          </div>
          {draftStatus === 'unavailable' && (
            <button className="studio-draft-retry" type="button" onClick={retrySave}>
              {t('common.retry_draft_save')}
            </button>
          )}
        </div>

        {helpControl ? <div className="studio-preview-help-control">{helpControl}</div> : null}

        <div className="studio-history-actions" aria-label={t('common.studio_history')}>
          <button
            type="button"
            className="studio-history-button"
            aria-label={t('common.undo')}
            aria-keyshortcuts="Control+Z Meta+Z"
            title={t('common.undo')}
            onClick={onUndo}
            disabled={!canUndo}
          >
            <HugeiconsIcon icon={Undo02Icon} size={17} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="studio-history-button"
            aria-label={t('common.redo')}
            aria-keyshortcuts="Control+Y Meta+Y Control+Shift+Z Meta+Shift+Z"
            title={t('common.redo')}
            onClick={onRedo}
            disabled={!canRedo}
          >
            <HugeiconsIcon icon={Redo02Icon} size={17} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
