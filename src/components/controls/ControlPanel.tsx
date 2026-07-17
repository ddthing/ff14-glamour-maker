import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppState } from '../../types';
import type { GlamourActions } from '../../features/glamour/useGlamourActions';
import { useExport } from '../../hooks/useExport';
import { usePresets } from '../../hooks/usePresets';
import { useShareLink } from '../../hooks/useShareLink';
import { useUndoAction } from '../../hooks/useUndoAction';
import { Divider } from '../ui/Divider';
import { ControlActions } from './ControlActions';
import { ControlStatus } from './ControlStatus';
import { ControlTabs, type ControlTab } from './ControlTabs';
import { EquipmentTab } from './EquipmentTab';
import { GeneralTab } from './GeneralTab';

interface Props {
  state: AppState;
  actions: GlamourActions;
}

export function ControlPanel({ state, actions }: Props) {
  const { t } = useTranslation();
  const { isExporting, stage, error: exportError, handleExport } = useExport();
  const { presets, error: presetError, addPreset, removePreset, restorePreset } = usePresets();
  const { status: shareStatus, copyLink } = useShareLink(state);
  const { action: undoAction, registerUndo, undo } = useUndoAction();
  const [activeTab, setActiveTab] = useState<ControlTab>('equipment');

  const handleResetItems = useCallback(() => {
    const previousItems = state.items;
    actions.resetItems();
    registerUndo({
      message: t('common.items_reset'),
      undo: () => actions.replaceItems(previousItems),
    });
  }, [actions, registerUndo, state.items, t]);

  const handleRemovePreset = useCallback((id: string) => {
    const removed = removePreset(id);
    if (!removed) return;
    registerUndo({
      message: t('common.preset_deleted'),
      undo: () => { restorePreset(removed.preset, removed.index); },
    });
  }, [registerUndo, removePreset, restorePreset, t]);

  const hasPhoto = !!state.croppedImageSrc;
  const hasItem = Object.values(state.items).some(item => !!item.name);
  const isReadyToSave = hasPhoto && hasItem;
  const exportLabel = isExporting && stage ? t(`common.export_${stage}`) : t('common.save');

  return (
    <div className="control-panel flex flex-col min-h-full bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-elevated)]" style={{ gap: 0 }}>
      <ControlTabs
        activeTab={activeTab}
        equipmentLabel={t('common.info_entry', '투영 정보 입력')}
        generalLabel={t('common.settings', '기본 설정')}
        onChange={setActiveTab}
      />

      <div
        id="control-tabpanel"
        role="tabpanel"
        aria-labelledby={activeTab === 'general' ? 'general-tab' : 'equipment-tab'}
        className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-thin"
      >
        {activeTab === 'general' ? (
          <GeneralTab
            state={state}
            onTitleChange={actions.setTitle}
            onCreatorChange={actions.setCreator}
            onApplyPreset={actions.applyPreset}
            presets={presets}
            onAddPreset={name => addPreset(name, state)}
            onRemovePreset={handleRemovePreset}
          />
        ) : (
          <EquipmentTab
            items={state.items}
            onUpdateItem={actions.updateItem}
            onResetItems={handleResetItems}
          />
        )}
      </div>

      <Divider />

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, background: 'var(--surface-100)' }}>
        <ControlActions
          shareStatus={shareStatus}
          isExporting={isExporting}
          isReadyToSave={isReadyToSave}
          copyLabel={t('common.copy_link')}
          copiedLabel={t('common.copied')}
          saveLabel={exportLabel}
          onCopyLink={copyLink}
          onExport={() => handleExport(state.title)}
        />
        <ControlStatus
          shareStatus={shareStatus}
          presetError={presetError}
          exportError={exportError}
          undoAction={undoAction}
          copyFailedLabel={t('common.copy_failed')}
          presetFailedLabel={t('common.preset_storage_failed')}
          exportFailedLabel={t('common.export_failed')}
          retryLabel={t('common.export_retry')}
          undoLabel={t('common.undo')}
          onRetryExport={() => handleExport(state.title)}
          onUndo={undo}
        />
      </div>
    </div>
  );
}
