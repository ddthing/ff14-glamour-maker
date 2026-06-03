import { useTranslation } from 'react-i18next';
import { UploadCloud, RefreshCw } from 'lucide-react';

interface PhotoPanelProps {
    croppedImageSrc: string | null;
    isDragging: boolean;
    hoverPhoto: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
}

/**
 * PhotoPanel — 캔버스 좌측 캐릭터 사진 패널 (480px)
 * Design: Apple Senior — premium empty state, zero demo code.
 */
export function PhotoPanel({
    croppedImageSrc, isDragging, hoverPhoto,
    onMouseEnter, onMouseLeave, onClick,
}: PhotoPanelProps) {
    const { t } = useTranslation();

    return (
        <div
            className="w-[480px] h-full relative overflow-hidden shrink-0 flex items-center justify-center cursor-pointer select-none"
            style={{ background: 'linear-gradient(145deg, #272620 0%, #191810 100%)' }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        >
            {/* ── Drag-over Overlay ── */}
            {isDragging && (
                <div
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4"
                    style={{ background: 'rgba(210,180,120,0.07)', backdropFilter: 'blur(4px)' }}
                >
                    <div className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{
                            background: 'rgba(210,180,120,0.15)',
                            border: '2px dashed rgba(210,180,120,0.5)',
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }}>
                        <UploadCloud size={34} strokeWidth={1.5} style={{ color: 'rgba(210,180,120,0.9)' }} />
                    </div>
                    <span className="text-sm font-bold tracking-[0.2em] uppercase"
                        style={{ color: 'rgba(210,180,120,0.85)' }}>
                        {t('common.drop_image')}
                    </span>
                </div>
            )}

            {croppedImageSrc ? (
                <>
                    {/* ── Loaded Photo ── */}
                    <img
                        src={croppedImageSrc}
                        alt="character"
                        className="w-full h-full object-cover"
                    />

                    {/* ── Hover Replace Overlay ── */}
                    {hoverPhoto && !isDragging && (
                        <div
                            className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity"
                            style={{ background: 'rgba(10,9,7,0.6)', backdropFilter: 'blur(6px)' }}
                        >
                            <div className="w-14 h-14 rounded-full flex items-center justify-center"
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                }}>
                                <RefreshCw size={20} strokeWidth={1.5} className="text-white/70" />
                            </div>
                            <span className="text-xs font-bold tracking-[0.25em] uppercase text-white/75">
                                {t('common.replace_image')}
                            </span>
                        </div>
                    )}
                </>
            ) : (
                /* ── Premium Empty State ── */
                <div className="relative w-full h-full flex items-center justify-center">

                    {/* Ambient center glow */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse 55% 35% at 50% 55%, rgba(210,180,120,0.05) 0%, transparent 70%)'
                        }} />

                    {/* Corner marks — Apple grid language */}
                    <div className="absolute top-8 left-8 w-5 h-5 border-t border-l" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                    <div className="absolute top-8 right-8 w-5 h-5 border-t border-r" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                    <div className="absolute bottom-8 left-8 w-5 h-5 border-b border-l" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                    <div className="absolute bottom-8 right-8 w-5 h-5 border-b border-r" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                    {/* Main CTA content */}
                    <div className="flex flex-col items-center gap-6 z-10">
                        {/* Icon — subtle, not loud */}
                        <div className="w-[84px] h-[84px] rounded-full flex items-center justify-center animate-breathe relative"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                boxShadow: '0 0 64px rgba(210,180,120,0.08) inset',
                            }}>
                            <UploadCloud size={32} strokeWidth={1.2} className="text-white/30" />
                            {/* Outer pulsing ring */}
                            <div className="absolute inset-0 rounded-full animate-ping" style={{ border: '1px solid rgba(210,180,120,0.4)', animationDuration: '3s' }} />
                        </div>

                        {/* Text */}
                        <div className="flex flex-col items-center gap-2 text-center">
                            <span className="text-[0.75rem] font-bold tracking-[0.3em] uppercase"
                                style={{ color: 'rgba(255,255,255,0.38)' }}>
                                {t('common.upload_hint')}
                            </span>
                            <span className="text-[0.55rem] font-medium tracking-[0.2em] uppercase"
                                style={{ color: 'rgba(255,255,255,0.15)' }}>
                                {t('common.click_or_drag')}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
