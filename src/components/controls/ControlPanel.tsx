import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    PenTool, User, Info, RotateCcw, Download, X, Bookmark, Save, Trash2, Link, Check
} from 'lucide-react';
import type { AppState, EquipmentPart, EquipItem } from '../../types';
import { ItemSearchInput } from './ItemSearchInput';
import { DyeSearchInput } from './DyeSearchInput';
import { SlotButton } from './SlotButton';
import { usePresets } from '../../hooks/usePresets';
import { useExport } from '../../hooks/useExport';

interface Props {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    onResetItems: () => void;
}

const SLOT_ORDER: EquipmentPart[] = [
    'mainhand', 'head', 'body', 'hands', 'legs',
    'feet', 'ears', 'neck', 'wrists', 'rings', 'face'
];

/**
 * ControlPanel (Sidebar)
 * Design Reference: Cursor Warm Minimalism
 */
export function ControlPanel({ state, setState, onResetItems }: Props) {
    const { t } = useTranslation();
    const [activeSlot, setActiveSlot] = useState<EquipmentPart>('head');
    const [presetNameInput, setPresetNameInput] = useState('');
    const { presets, addPreset, removePreset } = usePresets();
    const { isExporting, handleExport } = useExport();
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link', err);
        }
    };

    const activeItem = state.items[activeSlot];

    const updateItem = (updates: Partial<EquipItem>) => {
        setState(s => ({
            ...s,
            items: {
                ...s.items,
                [activeSlot]: { ...s.items[activeSlot], ...updates }
            }
        }));
    };

    return (
        <div className="control-panel flex flex-col min-h-full p-6 lg:p-8 gap-8">
            
            {/* ── Section 1: 투영 세트 기본 정보 ──────────────────────────── */}
            <section className="flex flex-col gap-5 pb-8 border-b border-[var(--border)]">
                <div>
                    <h3 className="flex items-center gap-2 text-[0.75rem] font-bold tracking-widest text-[var(--text-secondary)] mb-3 uppercase">
                        <PenTool size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
                        {t('common.title')}
                    </h3>
                    <input
                        id="glamour-set-name"
                        className="input-base"
                        value={state.title}
                        onChange={e => setState(s => ({ ...s, title: e.target.value }))}
                        placeholder={t('common.input_set_name')}
                    />
                </div>

                <div>
                    <h3 className="flex items-center gap-2 text-[0.75rem] font-bold tracking-widest text-[var(--text-secondary)] mb-3 uppercase">
                        <User size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
                        {t('common.creator')}
                    </h3>
                    <input
                        id="glamour-creator"
                        className="input-base"
                        value={state.creator}
                        onChange={e => setState(s => ({ ...s, creator: e.target.value }))}
                        placeholder={t('common.input_creator')}
                    />
                </div>
            </section>

            {/* ── Section 1.5: 프리셋(코디) 관리 ──────────────────────────── */}
            <section className="flex flex-col gap-4 pb-8 border-b border-[var(--border)]">
                <h3 className="flex items-center gap-2 text-[0.75rem] font-bold tracking-widest text-[var(--text-secondary)] mb-3 uppercase">
                    <Bookmark size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
                    {t('common.presets_title')}
                </h3>

                <div className="flex gap-2 h-[44px]">
                    <input
                        className="input-base flex-1 h-full"
                        value={presetNameInput}
                        onChange={e => setPresetNameInput(e.target.value)}
                        placeholder={t('common.presets_placeholder')}
                    />
                    <button
                        onClick={() => {
                            if (!presetNameInput) return;
                            addPreset(presetNameInput, state);
                            setPresetNameInput('');
                        }}
                        className="h-full shrink-0 px-5 bg-[var(--surface-300)] text-[var(--text-primary)] rounded-lg font-bold text-sm hover:text-[var(--error)] transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={16} aria-hidden="true" />
                        <span className="hidden sm:inline whitespace-nowrap">{t('common.presets_save')}</span>
                    </button>
                </div>

                {presets.length > 0 && (
                    <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                        {presets.map(p => (
                            <div
                                key={p.id}
                                className="flex justify-between items-center bg-[var(--surface-100)] px-3 py-2 rounded-md border border-[var(--border)] group hover:border-[var(--accent)] transition-colors"
                            >
                                <button
                                    className="flex-1 text-left font-medium text-[0.85rem] truncate"
                                    onClick={() => setState(s => ({ ...s, title: p.title, creator: p.creator, items: p.items }))}
                                >
                                    {p.name}
                                </button>
                                <button
                                    onClick={() => removePreset(p.id)}
                                    className="text-[var(--error)] p-1 opacity-40 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Section 2: 장비 슬롯 편집기 ────────────────────────────── */}
            <section className="flex-1 flex flex-col min-h-0 pt-2">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="flex items-center gap-2 text-[0.75rem] font-bold tracking-widest text-[var(--text-secondary)] uppercase">
                        <Info size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
                        {t('common.info_entry')}
                    </h3>
                    <button
                        onClick={onResetItems}
                        className="btn-ghost"
                    >
                        <RotateCcw size={13} strokeWidth={2.5} />
                        {t('common.reset')}
                    </button>
                </div>

                {/* 현재 활성 슬롯 편집 영역 */}
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-4 border-b border-[var(--border)] pb-3">
                        <span className="text-[0.9rem] font-bold text-[var(--text-primary)] uppercase tracking-widest">
                            {t(`slots.${activeSlot}`)}
                        </span>
                        <button
                            onClick={() => updateItem({ name: '', dye1: '', dye2: '', iconPath: '', nameKo: '', nameEn: '', nameJa: '' })}
                            className="text-[var(--text-muted)] hover:text-[var(--error)] transition-colors p-1"
                        >
                            <X size={14} aria-hidden="true" />
                        </button>
                    </div>

                    <ItemSearchInput
                        value={activeItem.name}
                        currentSlot={activeSlot}
                        hasError={!!activeItem.error}
                        onNameChange={name => updateItem({ name, nameKo: '', nameEn: '', nameJa: '', iconPath: '', error: '' })}
                        onSelect={item => {
                            updateItem({
                                name: item.name,
                                nameKo: item.name,
                                nameEn: item.nameEn,
                                nameJa: item.nameJa,
                                iconPath: item.iconPath || '',
                                error: ''
                            });
                        }}
                    />

                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <DyeSearchInput
                            value={activeItem.dye1 || ''}
                            onChange={v => updateItem({ dye1: v })}
                            placeholder={t('common.search_dye') + ' 1'}
                        />
                        <DyeSearchInput
                            value={activeItem.dye2 || ''}
                            onChange={v => updateItem({ dye2: v })}
                            placeholder={t('common.search_dye') + ' 2'}
                        />
                    </div>
                </div>

                {/* 슬롯 선택 그리드 */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {SLOT_ORDER.map(part => (
                        <SlotButton
                            key={part}
                            part={part}
                            item={state.items[part]}
                            isActive={activeSlot === part}
                            onClick={() => setActiveSlot(part)}
                        />
                    ))}
                </div>
            </section>

            {/* ── Section 3: 공유 및 저장 ─────────────────────────────── */}
            <div className="mt-auto pt-6 border-t border-[var(--border)] flex gap-3">
                <button
                    className="flex-1 flex items-center justify-center gap-2 h-[48px] bg-[var(--surface-300)] text-[var(--text-primary)] rounded-lg font-bold text-[0.85rem] tracking-wider uppercase hover:border-[var(--accent)] border border-transparent transition-all"
                    onClick={handleCopyLink}
                >
                    {isCopied ? <Check size={18} className="text-green-500" /> : <Link size={18} />}
                    {isCopied ? t('common.copied', '복사완료') : t('common.copy_link', '링크 복사')}
                </button>
                <button
                    className={`flex-1 flex items-center justify-center gap-2 h-[48px] bg-[var(--text-primary)] text-[var(--bg-app)] rounded-lg font-bold text-[0.85rem] tracking-wider uppercase hover:opacity-90 transition-opacity ${
                        isExporting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => handleExport(state.title)}
                    disabled={isExporting}
                >
                    {isExporting
                        ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        : <Download size={18} aria-hidden="true" />
                    }
                    {isExporting ? t('common.saving') : t('common.save')}
                </button>
            </div>

            {/* 모바일 모달 생략 - 필요 시 별도 컴포넌트화 권장 */}
        </div>
    );
}
