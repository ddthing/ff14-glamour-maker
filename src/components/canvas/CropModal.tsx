import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { X, Check, Search, RotateCcw } from 'lucide-react';

interface CropModalProps {
    imageSrc: string;
    onCancel: () => void;
    onConfirm: (croppedUrl: string, src: string) => void;
}

/**
 * CropModal — Premium Portrait Editor
 * Design: Apple Senior — High contrast, glassmorphism, precise control.
 */
export function CropModal({ imageSrc, onCancel, onConfirm }: CropModalProps) {
    const { t } = useTranslation();
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPx, setCroppedAreaPx] = useState<{
        x: number; y: number; width: number; height: number;
    } | null>(null);

    const handleCropComplete = useCallback(
        (_: unknown, px: { x: number; y: number; width: number; height: number }) =>
            setCroppedAreaPx(px),
        []
    );

    const handleConfirm = async () => {
        if (!croppedAreaPx) return;
        const url = await getCroppedImg(imageSrc, croppedAreaPx);
        if (url) onConfirm(url, imageSrc);
    };

    return (
        <div
            className="fixed inset-0 z-[3000] flex flex-col items-center justify-center p-6 md:p-12"
            style={{
                background: 'rgba(0, 0, 0, 0.88)',
                backdropFilter: 'blur(32px) saturate(1.5)',
                WebkitBackdropFilter: 'blur(32px) saturate(1.5)'
            }}
        >
            <div className="relative w-full max-w-[900px] flex flex-col items-center gap-10 animate-slide-up">
                
                {/* Header Section */}
                <div className="w-full flex justify-between items-end border-b border-white/10 pb-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                            <span className="text-[0.65rem] font-bold tracking-[0.3em] uppercase text-white/40">{t('crop.studio_editor')}</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('crop.refine_portrait')}</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <span className="text-xs font-bold tracking-widest uppercase">{t('common.close')}</span>
                        <X size={18} className="group-active:scale-90 transition-transform" />
                    </button>
                </div>

                {/* The Stage */}
                <div className="relative w-full aspect-video md:aspect-[16/9] rounded-3xl overflow-hidden border border-white/15 shadow-[0_32px_64px_rgba(0,0,0,0.6)]">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={480 / 900}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={handleCropComplete}
                        showGrid={false}
                        style={{
                            containerStyle: { background: '#050505' },
                            cropAreaStyle: {
                                border: '3px solid white',
                                boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
                                borderRadius: '0px'
                            }
                        }}
                    />
                </div>

                {/* Control Panel */}
                <div className="w-full max-w-[540px] flex flex-col gap-10">
                    
                    {/* Zoom Slider */}
                    <div className="flex flex-col gap-5">
                        <div className="flex justify-between items-center text-white/50 font-bold tracking-widest text-[0.7rem] uppercase">
                            <div className="flex items-center gap-2">
                                <Search size={14} />
                                <span>{t('crop.zoom_intensity')}</span>
                            </div>
                            <span className="bg-white/10 px-2 py-0.5 rounded-md text-white/80 font-mono">{(zoom * 100).toFixed(0)}%</span>
                        </div>
                        <input
                            type="range" min={1} max={4} step={0.01}
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="range-premium"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 h-16">
                        <button
                            onClick={onCancel}
                            className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all active:scale-[0.96]"
                        >
                            <RotateCcw size={20} strokeWidth={2.5} />
                            <span>{t('crop.discard')}</span>
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-[1.8] flex items-center justify-center gap-3 rounded-2xl bg-white text-black font-black text-lg hover:bg-[#f2f1ed] transition-all active:scale-[0.96] shadow-[0_12px_32px_rgba(255,255,255,0.15)]"
                        >
                            <Check size={24} strokeWidth={3} />
                            <span>{t('crop.apply_portrait')}</span>
                        </button>
                    </div>
                </div>

                {/* Interactive Hint */}
                <div className="flex items-center gap-4 text-white/20 text-[0.65rem] font-bold tracking-[0.25em] uppercase">
                    <span>{t('crop.hint_move')}</span>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{t('crop.hint_zoom')}</span>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{t('crop.hint_confirm')}</span>
                </div>
            </div>
        </div>
    );
}
