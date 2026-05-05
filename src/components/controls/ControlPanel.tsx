import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    PenTool, User, Info, RotateCcw, Download, X,
    Bookmark, Save, Trash2, Link, Check
} from 'lucide-react';
import type { AppState, EquipmentPart, EquipItem } from '../../types';
import { ItemSearchInput } from './ItemSearchInput';
import { DyeSearchInput } from './DyeSearchInput';
import { SlotButton } from './SlotButton';
import { SectionLabel } from '../ui/SectionLabel';
import { Divider } from '../ui/Divider';
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
 * ControlPanel — Sidebar
 * Design: Apple Senior + DESIGN.md Warm Minimalism
 * Features: scale(0.98) active, ambient glow focus, oklab borders, surface scale
 */
export function ControlPanel({ state, setState, onResetItems }: Props) {
    const { t } = useTranslation();
    const [activeSlot, setActiveSlot] = useState<EquipmentPart>('head');
    const [presetNameInput, setPresetNameInput] = useState('');
    const { presets, addPreset, removePreset } = usePresets();
    const { isExporting, handleExport } = useExport();
    const [activeTab, setActiveTab] = useState<'general' | 'equipment'>('equipment');
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
            items: { ...s.items, [activeSlot]: { ...s.items[activeSlot], ...updates } }
        }));
    };

    return (
        <div className="control-panel flex flex-col min-h-full bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-elevated)]" style={{ gap: 0 }}>
            
            {/* ── Tabs Header ── */}
            <div className="flex border-b border-[var(--border)]">
                <button
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'equipment' ? 'text-[var(--text-primary)] border-b-2 border-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                    onClick={() => setActiveTab('equipment')}
                >
                    {t('common.info_entry', '투영 정보 입력')}
                </button>
                <button
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'general' ? 'text-[var(--text-primary)] border-b-2 border-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                    onClick={() => setActiveTab('general')}
                >
                    {t('common.settings', '기본 설정')}
                </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-thin">
                {activeTab === 'general' ? (
                    <>
                        {/* ── Section 1: 투영 기본 정보 ── */}
                        <section style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <SectionLabel icon={<PenTool size={12} />}>{t('common.title')}</SectionLabel>
                <input
                    id="glamour-set-name"
                    className="input-base"
                    value={state.title}
                    onChange={e => setState(s => ({ ...s, title: e.target.value }))}
                    placeholder={t('common.input_set_name')}
                />

                <div style={{ marginTop: '6px' }}>
                    <SectionLabel icon={<User size={12} />}>{t('common.creator')}</SectionLabel>
                    <input
                        id="glamour-creator"
                        className="input-base"
                        value={state.creator}
                        onChange={e => setState(s => ({ ...s, creator: e.target.value }))}
                        placeholder={t('common.input_creator')}
                    />
                </div>
            </section>

            <Divider />

            {/* ── Section 2: 프리셋 관리 ── */}
            <section style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <SectionLabel icon={<Bookmark size={12} />}>{t('common.presets_title')}</SectionLabel>

                <div style={{ display: 'flex', gap: '8px', height: '40px' }}>
                    <input
                        className="input-base"
                        style={{ flex: 1, height: '100%', fontSize: '0.875rem' }}
                        value={presetNameInput}
                        onChange={e => setPresetNameInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && presetNameInput.trim()) {
                                addPreset(presetNameInput.trim(), state);
                                setPresetNameInput('');
                            }
                        }}
                        placeholder={t('common.presets_placeholder')}
                    />
                    <button
                        onClick={() => {
                            if (!presetNameInput.trim()) return;
                            addPreset(presetNameInput.trim(), state);
                            setPresetNameInput('');
                        }}
                        style={{
                            height: '100%',
                            padding: '0 14px',
                            background: 'var(--surface-300)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            flexShrink: 0,
                            transition: 'color 0.15s, transform 0.1s',
                            letterSpacing: '0.04em',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        <Save size={13} />
                        <span className="hidden sm:inline">{t('common.presets_save')}</span>
                    </button>
                </div>

                {presets.length > 0 && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        paddingRight: '2px',
                    }}
                        className="scrollbar-thin"
                    >
                        {presets.map(p => (
                            <div
                                key={p.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'var(--surface-100)',
                                    padding: '8px 10px 8px 12px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    transition: 'border-color 0.15s',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                            >
                                <button
                                    style={{
                                        flex: 1,
                                        textAlign: 'left',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        color: 'var(--text-primary)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                    }}
                                    onClick={() => setState(s => ({ ...s, title: p.title, creator: p.creator, items: p.items }))}
                                >
                                    {p.name}
                                </button>
                                <button
                                    onClick={() => removePreset(p.id)}
                                    style={{
                                        padding: '4px',
                                        color: 'var(--text-muted)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        transition: 'color 0.15s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            </>
            ) : (
            <>
            {/* ── Section 3: 장비 슬롯 편집기 ── */}
            <section style={{ padding: '16px 20px 8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                {/* Section header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <SectionLabel icon={<Info size={12} />}>{t('common.info_entry')}</SectionLabel>
                    <button
                        className="btn-ghost"
                        onClick={onResetItems}
                        style={{ marginBottom: '10px' }}
                    >
                        <RotateCcw size={12} strokeWidth={2.5} />
                        {t('common.reset')}
                    </button>
                </div>

                {/* Active slot editor */}
                <div style={{
                    background: 'var(--surface-100)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                }}>
                    {/* Slot name + clear */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: '10px',
                        borderBottom: '1px solid var(--border)',
                    }}>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: 'var(--text-primary)',
                        }}>
                            {t(`slots.${activeSlot}`)}
                        </span>
                        <button
                            onClick={() => updateItem({ name: '', dye1: '', dye2: '', iconPath: '', nameKo: '', nameEn: '', nameJa: '' })}
                            style={{
                                color: 'var(--text-muted)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '3px',
                                borderRadius: '4px',
                                display: 'flex',
                                transition: 'color 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                            <X size={13} />
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <DyeSearchInput
                            value={activeItem.dye1 || ''}
                            onChange={v => updateItem({ dye1: v })}
                            placeholder={`${t('common.search_dye')} 1`}
                        />
                        <DyeSearchInput
                            value={activeItem.dye2 || ''}
                            onChange={v => updateItem({ dye2: v })}
                            placeholder={`${t('common.search_dye')} 2`}
                        />
                    </div>
                </div>

                {/* Slot grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
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
            </>
            )}
            </div>

            <Divider />

            {/* ── Section 4: 액션 버튼 ── */}
            <div style={{ padding: '16px 20px', display: 'flex', gap: '8px', flexShrink: 0, background: 'var(--surface-100)' }}>
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
                        color: isCopied ? 'var(--success)' : 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'color 0.15s, transform 0.1s, border-color 0.15s',
                    }}
                    onClick={handleCopyLink}
                    onMouseEnter={e => {
                        if (!isCopied) e.currentTarget.style.color = 'var(--error)';
                        e.currentTarget.style.borderColor = 'var(--border-medium)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.color = isCopied ? 'var(--success)' : 'var(--text-primary)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {isCopied
                        ? <Check size={15} />
                        : <Link size={15} />
                    }
                    {isCopied ? t('common.copied', '복사완료') : t('common.copy_link', '링크 복사')}
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
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                        cursor: isExporting ? 'not-allowed' : 'pointer',
                        opacity: isExporting ? 0.55 : 1,
                        transition: 'opacity 0.2s, transform 0.1s',
                    }}
                    onClick={() => handleExport(state.title)}
                    disabled={isExporting}
                    onMouseDown={e => { if (!isExporting) e.currentTarget.style.transform = 'scale(0.97)'; }}
                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {isExporting
                        ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        : <Download size={15} />
                    }
                    {isExporting ? t('common.saving') : t('common.save')}
                </button>
            </div>
        </div>
    );
}
