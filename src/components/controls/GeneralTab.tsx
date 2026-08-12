import { useTranslation } from 'react-i18next';
import { Bookmark01Icon, Delete02Icon, FloppyDiskIcon, PencilEdit01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState, useEffect } from 'react';
import type { AppState } from '../../types';
import { SectionLabel } from '../ui/SectionLabel';
import { Divider } from '../ui/Divider';
import type { Preset } from '../../hooks/usePresets';

interface GeneralTabProps {
    state: AppState;
    onTitleChange: (title: string) => void;
    onCreatorChange: (creator: string) => void;
    onApplyPreset: (preset: Pick<AppState, 'title' | 'creator' | 'items' | 'fashionAccessory'>) => void;
    presets: Preset[];
    onAddPreset: (name: string) => boolean;
    onRemovePreset: (id: string) => void;
}

export function GeneralTab({
    state,
    onTitleChange,
    onCreatorChange,
    onApplyPreset,
    presets,
    onAddPreset,
    onRemovePreset,
}: GeneralTabProps) {
    const { t } = useTranslation();
    const [presetNameInput, setPresetNameInput] = useState('');
    
    // Local state for debounced inputs
    const [localTitle, setLocalTitle] = useState(state.title);
    const [localCreator, setLocalCreator] = useState(state.creator);

    // Sync from global to local when preset is loaded
    useEffect(() => {
        setLocalTitle(state.title);
        setLocalCreator(state.creator);
    }, [state.title, state.creator]);

    const handleTitleBlur = () => {
        onTitleChange(localTitle);
    };

    const handleCreatorBlur = () => {
        onCreatorChange(localCreator);
    };

    return (
        <>
            {/* ── Section 1: 투영 기본 정보 ── */}
            <section style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ minHeight: '36px', display: 'flex', alignItems: 'center' }}>
                    <SectionLabel
                        style={{ marginBottom: 0 }}
                        icon={<HugeiconsIcon icon={PencilEdit01Icon} size={13} strokeWidth={1.8} />}
                    >
                        {t('common.title')}
                    </SectionLabel>
                </div>
                <input
                    id="glamour-set-name"
                    name="glamour-set-name"
                    aria-label={t('common.title')}
                    autoComplete="off"
                    className="input-base"
                    value={localTitle}
                    onChange={e => setLocalTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={e => e.key === 'Enter' && handleTitleBlur()}
                    placeholder={t('common.input_set_name')}
                />

                <div style={{ marginTop: '6px' }}>
                    <SectionLabel icon={<HugeiconsIcon icon={UserIcon} size={13} strokeWidth={1.8} />}>{t('common.creator')}</SectionLabel>
                    <input
                        id="glamour-creator"
                        name="glamour-creator"
                        aria-label={t('common.creator')}
                        autoComplete="off"
                        spellCheck={false}
                        className="input-base"
                        value={localCreator}
                        onChange={e => setLocalCreator(e.target.value)}
                        onBlur={handleCreatorBlur}
                        onKeyDown={e => e.key === 'Enter' && handleCreatorBlur()}
                        placeholder={t('common.input_creator')}
                    />
                </div>
            </section>

            <Divider />

            {/* ── Section 2: 프리셋 관리 ── */}
            <section style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <SectionLabel icon={<HugeiconsIcon icon={Bookmark01Icon} size={13} strokeWidth={1.8} />}>{t('common.presets_title')}</SectionLabel>

                <div style={{ display: 'flex', gap: '8px', height: '40px' }}>
                    <input
                        name="preset-name"
                        aria-label={t('common.presets_placeholder')}
                        autoComplete="off"
                        className="input-base"
                        style={{ flex: 1, height: '100%', fontSize: '0.875rem' }}
                        value={presetNameInput}
                        onChange={e => setPresetNameInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && presetNameInput.trim()) {
                                if (onAddPreset(presetNameInput.trim())) setPresetNameInput('');
                            }
                        }}
                        placeholder={t('common.presets_placeholder')}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            if (!presetNameInput.trim()) return;
                            if (onAddPreset(presetNameInput.trim())) setPresetNameInput('');
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
                        <HugeiconsIcon icon={FloppyDiskIcon} size={14} strokeWidth={1.8} aria-hidden="true" />
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
                                    type="button"
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
                                    onClick={() => onApplyPreset(p)}
                                >
                                    {p.name}
                                </button>
                                <button
                                    type="button"
                                    aria-label={`${t('common.delete_preset')}: ${p.name}`}
                                    onClick={() => onRemovePreset(p.id)}
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
                                    <HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={1.8} aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
