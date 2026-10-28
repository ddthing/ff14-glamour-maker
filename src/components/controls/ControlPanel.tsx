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
import { copyTextToClipboard } from '../../utils/clipboard';
import { buildEquipmentShareText } from './equipmentShareText';

interface Props {
  state: AppState;
  actions: GlamourActions;
}

export function ControlPanel({ state, actions }: Props) {
  const { t, i18n } = useTranslation();
  const { isExporting, stage, error: exportError, handleExport } = useExport();
  const { presets, error: presetError, addPreset, removePreset, restorePreset } = usePresets();
  const { action: undoAction, registerUndo, undo } = useUndoAction();
  const [activeTab, setActiveTab] = useState<ControlTab>('equipment');

  const handleResetItems = useCallback(() => actions.resetItems(), [actions]);

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
  const copyEquipmentList = useCallback(() => {
    const shareText = buildEquipmentShareText(state, i18n.resolvedLanguage || i18n.language, {
      title: t('common.default_set_title'),
      creator: t('common.creator'),
      dye: t('common.search_dye'),
      slot: part => t(part === 'fashionAccessory' ? 'slots.fashionAccessory' : `slots.${part}`),
    });
    return copyTextToClipboard(shareText);
  }, [i18n.language, i18n.resolvedLanguage, state, t]);

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
          hasEquipmentToCopy={hasSelection}
          copyEquipmentLabel={t('common.copy_equipment_list')}
          copyingEquipmentLabel={t('common.copying_equipment_list')}
          equipmentCopiedLabel={t('common.equipment_list_copied')}
          equipmentCopyFailedLabel={t('common.equipment_list_copy_failed')}
          onCopyEquipment={copyEquipmentList}
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
