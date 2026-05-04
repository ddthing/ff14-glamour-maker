import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, Sparkles } from 'lucide-react';

interface PhotoPanelProps {
    croppedImageSrc: string | null;
    isDragging: boolean;
    hoverPhoto: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: (isDemo?: boolean) => void;
}

/**
 * PhotoPanel — 캔버스 좌측 캐릭터 사진 패널 (480px)
 * PreviewCanvas에서 분리된 표현 컴포넌트
 */
export function PhotoPanel({
    croppedImageSrc, isDragging, hoverPhoto,
    onMouseEnter, onMouseLeave, onClick,
}: PhotoPanelProps) {
    const { t } = useTranslation();

    return (
        <div
            className="w-[480px] h-full relative overflow-hidden shrink-0 flex flex-col items-center justify-center cursor-pointer"
            style={{ background: 'linear-gradient(160deg, #2e2d25 0%, #1c1b15 100%)' }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        >
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-[var(--accent)]/15 border-4 border-dashed border-[var(--accent)] flex items-center justify-center">
                    <span className="text-[var(--accent)] font-extrabold text-lg">
                        {t('common.drop_image')}
                    </span>
                </div>
            )}

            {croppedImageSrc ? (
                <>
                    <img
                        src={croppedImageSrc}
                        alt="character"
                        className="w-full h-full object-cover"
                    />
                    {hoverPhoto && !isDragging && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity">
                            <span className="flex items-center gap-2 bg-[var(--surface-300)] text-[var(--text-primary)] px-5 py-2.5 rounded-[var(--radius-pill)] font-bold text-sm" style={{ boxShadow: 'var(--shadow-focus)' }}>
                                <Sparkles size={15} />
                                {t('common.replace_image')}
                            </span>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center gap-6 text-[var(--text-muted)] transition-all w-full h-full relative group">
                    <div className="absolute inset-8 border-2 border-dashed border-white/5 rounded-2xl pointer-events-none group-hover:border-white/10 transition-colors" />
                    
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                            <ImageIcon size={32} strokeWidth={1.5} className="text-white/30" />
                        </div>
                        
                        <div className="flex flex-col items-center gap-2">
                            <span className="font-black text-[0.9rem] text-white/60 tracking-[0.2em] uppercase">
                                {t('common.click_or_drag', 'CLICK OR DRAG')}
                            </span>
                            <div className="w-8 h-px bg-white/10" />
                            <span className="font-bold text-[0.6rem] text-white/20 uppercase tracking-[0.25em]">
                                {t('common.upload_hint', 'CHARACTER IMAGE')}
                            </span>
                        </div>
                        
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick(true); // pass true to indicate demo load
                            }}
                            className="mt-6 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[0.65rem] font-bold tracking-wider text-white/50 hover:text-white/80 transition-all uppercase flex items-center gap-1.5"
                        >
                            <Sparkles size={12} />
                            Load Demo Character
                        </button>
                    </div>
                </div>

            )}
        </div>
    );
}
