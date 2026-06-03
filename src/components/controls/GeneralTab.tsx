import { useTranslation } from 'react-i18next';
import { PenTool, User, Bookmark, Save, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { AppState } from '../../types';
import { SectionLabel } from '../ui/SectionLabel';
import { Divider } from '../ui/Divider';
import { usePresets } from '../../hooks/usePresets';

interface GeneralTabProps {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function GeneralTab({ state, setState }: GeneralTabProps) {
    const { t } = useTranslation();
    const { presets, addPreset, removePreset } = usePresets();
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
        setState(s => ({ ...s, title: localTitle }));
    };

    const handleCreatorBlur = () => {
        setState(s => ({ ...s, creator: localCreator }));
    };

    return (
        <>
            {/* ── Section 1: 투영 기본 정보 ── */}
            <section style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <SectionLabel icon={<PenTool size={12} />}>{t('common.title')}</SectionLabel>
                <input
                    id="glamour-set-name"
                    className="input-base"
                    value={localTitle}
                    onChange={e => setLocalTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={e => e.key === 'Enter' && handleTitleBlur()}
                    placeholder={t('common.input_set_name')}
                />

                <div style={{ marginTop: '6px' }}>
                    <SectionLabel icon={<User size={12} />}>{t('common.creator')}</SectionLabel>
                    <input
                        id="glamour-creator"
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
    );
}
