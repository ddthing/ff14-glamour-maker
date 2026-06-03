import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Link, Check } from 'lucide-react';
import type { AppState } from '../../types';
import { Divider } from '../ui/Divider';
import { useExport } from '../../hooks/useExport';
import { GeneralTab } from './GeneralTab';
import { EquipmentTab } from './EquipmentTab';

interface Props {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    onResetItems: () => void;
}

/**
 * ControlPanel — Sidebar
 * Design: Apple Senior + DESIGN.md Warm Minimalism
 * Features: scale(0.98) active, ambient glow focus, oklab borders, surface scale
 */
export function ControlPanel({ state, setState, onResetItems }: Props) {
    const { t } = useTranslation();
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

    const hasPhoto = !!state.croppedImageSrc;
    const hasItem = Object.values(state.items).some(item => !!item.name);
    const isReadyToSave = hasPhoto && hasItem;

    return (
        <div className="control-panel flex flex-col min-h-full bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-elevated)]" style={{ gap: 0 }}>

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
                    <GeneralTab state={state} setState={setState} />
                ) : (
                    <EquipmentTab state={state} setState={setState} onResetItems={onResetItems} />
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
                    className={isReadyToSave ? "animate-pulse" : ""}
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
                        ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        : <Download size={15} />
                    }
                    {isExporting ? t('common.saving') : t('common.save')}
                </button>
            </div>
        </div>
    );
}
