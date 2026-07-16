import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Check, Download, Link, RotateCcw } from 'lucide-react';
import type { AppState } from '../../types';
import { Divider } from '../ui/Divider';
import { useExport } from '../../hooks/useExport';
import { GeneralTab } from './GeneralTab';
import { EquipmentTab } from './EquipmentTab';
import { usePresets } from '../../hooks/usePresets';
import { useShareLink } from '../../hooks/useShareLink';
import { useUndoAction } from '../../hooks/useUndoAction';
import type { GlamourActions } from '../../features/glamour/useGlamourActions';

interface Props {
    state: AppState;
    actions: GlamourActions;
}

/**
 * ControlPanel — Sidebar
 * Design: Apple Senior + DESIGN.md Warm Minimalism
 * Features: scale(0.98) active, ambient glow focus, oklab borders, surface scale
 */
export function ControlPanel({ state, actions }: Props) {
    const { t } = useTranslation();
    const { isExporting, stage, error: exportError, handleExport } = useExport();
    const { presets, error: presetError, addPreset, removePreset, restorePreset } = usePresets();
    const { status: shareStatus, copyLink } = useShareLink(state);
    const { action: undoAction, registerUndo, undo } = useUndoAction();
    const [activeTab, setActiveTab] = useState<'general' | 'equipment'>('equipment');

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

    return (
        <div className="control-panel flex flex-col min-h-full bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-elevated)]" style={{ gap: 0 }}>

            {/* ── Tabs Header ── */}
            <div className="flex border-b border-[var(--border)]" role="tablist">
                <button
                    type="button"
                    role="tab"
                    id="equipment-tab"
                    aria-controls="control-tabpanel"
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'equipment' ? 'text-[var(--text-primary)] border-b-2 border-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                    onClick={() => setActiveTab('equipment')}
                    aria-selected={activeTab === 'equipment'}
                >
                    {t('common.info_entry', '투영 정보 입력')}
                </button>
                <button
                    type="button"
                    role="tab"
                    id="general-tab"
                    aria-controls="control-tabpanel"
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'general' ? 'text-[var(--text-primary)] border-b-2 border-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                    onClick={() => setActiveTab('general')}
                    aria-selected={activeTab === 'general'}
                >
                    {t('common.settings', '기본 설정')}
                </button>
            </div>

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

            {/* ── Section 4: 액션 버튼 ── */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, background: 'var(--surface-100)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Copy Link */}
                <button
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '7px',
                        height: '44px',
                        background: 'var(--surface-300)',
                        color: shareStatus === 'copied' ? 'var(--success)' : 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'color 0.15s, transform 0.1s, border-color 0.15s',
                    }}
                    onClick={copyLink}
                    onMouseEnter={e => {
                        if (shareStatus !== 'copied') e.currentTarget.style.color = 'var(--error)';
                        e.currentTarget.style.borderColor = 'var(--border-medium)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.color = shareStatus === 'copied' ? 'var(--success)' : 'var(--text-primary)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {shareStatus === 'copied'
                        ? <Check size={15} aria-hidden="true" />
                        : <Link size={15} aria-hidden="true" />
                    }
                    {shareStatus === 'copied' ? t('common.copied') : t('common.copy_link')}
                </button>

                {/* Save Image — primary CTA */}
                <button
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '7px',
                        height: '44px',
                        background: 'var(--text-primary)',
                        color: 'var(--bg-app)',
                        border: isReadyToSave ? '2px solid rgba(210,180,120,0.8)' : 'none',
                        boxShadow: isReadyToSave ? '0 0 15px rgba(210,180,120,0.5)' : 'none',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                        cursor: isExporting ? 'not-allowed' : 'pointer',
                        opacity: isExporting ? 0.55 : 1,
                        transition: 'opacity 0.2s, transform 0.1s, box-shadow 0.3s, border 0.3s',
                    }}
                    onClick={() => handleExport(state.title)}
                    disabled={isExporting}
                    onMouseDown={e => { if (!isExporting) e.currentTarget.style.transform = 'scale(0.97)'; }}
                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {isExporting
                        ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" aria-hidden="true" />
                        : <Download size={15} aria-hidden="true" />
                    }
                    {isExporting && stage
                        ? t(`common.export_${stage}`)
                        : t('common.save')}
                </button>
              </div>
              <div aria-live="polite" aria-atomic="true">
                {shareStatus === 'error' && (
                  <p className="text-xs text-[var(--error)]" style={{ margin: 0 }}>
                    {t('common.copy_failed')}
                  </p>
                )}
                {presetError && (
                  <p className="text-xs text-[var(--error)]" role="alert" style={{ margin: 0 }}>
                    {t('common.preset_storage_failed')}
                  </p>
                )}
                {exportError && (
                  <div className="flex items-center justify-between gap-3 text-xs text-[var(--error)]" role="alert">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle size={14} aria-hidden="true" />
                      {t('common.export_failed')}
                    </span>
                    <button
                      type="button"
                      className="flex shrink-0 items-center gap-1 font-bold underline underline-offset-2"
                      onClick={() => handleExport(state.title)}
                    >
                      <RotateCcw size={12} aria-hidden="true" />
                      {t('common.export_retry')}
                    </button>
                  </div>
                )}
                {undoAction && (
                  <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
                    <span>{undoAction.message}</span>
                    <button
                      type="button"
                      className="shrink-0 font-bold text-[var(--accent)] underline underline-offset-2"
                      onClick={undo}
                    >
                      {t('common.undo')}
                    </button>
                  </div>
                )}
              </div>
            </div>
        </div>
    );
}
