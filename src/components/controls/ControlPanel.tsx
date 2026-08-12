import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppState } from '../../types';
import type { GlamourActions } from '../../features/glamour/useGlamourActions';
import { useExport } from '../../hooks/useExport';
import { usePresets } from '../../hooks/usePresets';
import { useUndoAction } from '../../hooks/useUndoAction';
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
  const { action: undoAction, registerUndo, undo } = useUndoAction();
  const [activeTab, setActiveTab] = useState<ControlTab>('equipment');

  const handleResetItems = useCallback(() => {
    const previousItems = state.items;
    const previousFashionAccessory = state.fashionAccessory;
    actions.resetItems();
    registerUndo({
      message: t('common.items_reset'),
      undo: () => {
        actions.replaceItems(previousItems);
        actions.setFashionAccessory(previousFashionAccessory);
      },
    });
  }, [actions, registerUndo, state.fashionAccessory, state.items, t]);

  const handleRemovePreset = useCallback((id: string) => {
    const removed = removePreset(id);
    if (!removed) return;
    registerUndo({
      message: t('common.preset_deleted'),
      undo: () => { restorePreset(removed.preset, removed.index); },
    });
  }, [registerUndo, removePreset, restorePreset, t]);

  const hasPhoto = !!state.croppedImageSrc;
  const hasSelection = Object.values(state.items).some(item => !!item.name)
    || state.fashionAccessory !== null;
  const isReadyToSave = hasPhoto && hasSelection;
  const exportLabel = isExporting && stage ? t(`common.export_${stage}`) : t('common.save');

  return (
    <div className="control-panel flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--radius-lg)]">
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
        className="flex min-h-0 flex-1 flex-col"
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
            fashionAccessory={state.fashionAccessory}
            onUpdateItem={actions.updateItem}
            onFashionAccessoryChange={actions.setFashionAccessory}
            onResetItems={handleResetItems}
          />
        )}
      </div>

      <div className="control-action-dock flex shrink-0 flex-col gap-2 border-t border-[var(--border)] bg-[var(--surface-100)] px-4 py-3.5 sm:px-5">
        <ControlActions
          isExporting={isExporting}
          isReadyToSave={isReadyToSave}
          saveLabel={exportLabel}
          onExport={() => handleExport(state.title || t('common.default_set_title'))}
        />
        <ControlStatus
          presetError={presetError}
          exportError={exportError}
          undoAction={undoAction}
          presetFailedLabel={t('common.preset_storage_failed')}
          exportFailedLabel={t('common.export_failed')}
          retryLabel={t('common.export_retry')}
          undoLabel={t('common.undo')}
          onRetryExport={() => handleExport(state.title || t('common.default_set_title'))}
          onUndo={undo}
        />
      </div>
    </div>
  );
}
