import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { X, Check, Search, RotateCcw } from 'lucide-react';

interface CropModalProps {
    imageSrc: string;
    onCancel: () => void;
    onConfirm: (croppedImage: Blob) => void;
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
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const requestGenerationRef = useRef(0);
    const processingRef = useRef(false);

    const handleCancel = useCallback(() => {
        requestGenerationRef.current += 1;
        processingRef.current = false;
        setIsProcessing(false);
        setError('');
        onCancel();
    }, [onCancel]);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        document.body.style.overflow = 'hidden';
        closeButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                handleCancel();
                return;
            }

            if (event.key !== 'Tab' || !dialogRef.current) return;
            const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
                'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
            ));
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            requestGenerationRef.current += 1;
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus();
        };
    }, [handleCancel]);

    const handleCropComplete = useCallback(
        (_: unknown, px: { x: number; y: number; width: number; height: number }) =>
            setCroppedAreaPx(px),
        []
    );

    const handleConfirm = async () => {
        if (!croppedAreaPx || processingRef.current) return;

        processingRef.current = true;
        setIsProcessing(true);
        setError('');
        const generation = ++requestGenerationRef.current;

        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPx);
            if (generation !== requestGenerationRef.current) return;
            processingRef.current = false;
            setIsProcessing(false);
            onConfirm(croppedImage);
        } catch {
            if (generation !== requestGenerationRef.current) return;
            processingRef.current = false;
            setIsProcessing(false);
            setError('crop-failed');
        }
    };

    return (
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="crop-dialog-title"
            className="fixed inset-0 z-[3000] flex flex-col items-center justify-center overscroll-contain p-6 md:p-12"
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
                        <div>
                            <span className="text-[0.65rem] font-bold tracking-[0.3em] uppercase text-white/40">{t('crop.studio_editor')}</span>
                        </div>
                        <h2 id="crop-dialog-title" className="text-3xl font-extrabold text-white tracking-tight text-balance">{t('crop.refine_portrait')}</h2>
                    </div>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={handleCancel}
                        className="group flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-[background-color,color,border-color]"
                    >
                        <span className="text-xs font-bold tracking-widest uppercase">{t('common.close')}</span>
                        <X size={18} className="group-active:scale-90 transition-transform" aria-hidden="true" />
                    </button>
                </div>

                {/* The Stage */}
                <div className="relative w-full aspect-video md:aspect-[16/9] rounded-[var(--radius-lg)] overflow-hidden border border-white/15 shadow-[0_32px_64px_rgba(0,0,0,0.6)]">
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
                                <Search size={14} aria-hidden="true" />
                                <label htmlFor="crop-zoom">{t('crop.zoom_intensity')}</label>
                            </div>
                            <span className="bg-white/10 px-2 py-0.5 rounded-[var(--radius-sm)] text-white/80 font-mono">{(zoom * 100).toFixed(0)}%</span>
                        </div>
                        <input
                            id="crop-zoom"
                            type="range" min={1} max={4} step={0.01}
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="range-premium"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 h-16">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 flex items-center justify-center gap-3 rounded-[var(--radius-sm)] bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-[background-color,transform] active:scale-[0.96]"
                        >
                            <RotateCcw size={20} strokeWidth={2.5} aria-hidden="true" />
                            <span>{t('crop.discard')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!croppedAreaPx || isProcessing}
                            className="flex-[1.8] flex items-center justify-center gap-3 rounded-[var(--radius-sm)] bg-white text-black font-black text-lg hover:bg-[#f2f1ed] transition-[background-color,transform] active:scale-[0.96] shadow-[0_12px_32px_rgba(255,255,255,0.15)]"
                        >
                            <Check size={24} strokeWidth={3} aria-hidden="true" />
                            <span>{isProcessing ? t('crop.processing') : t('crop.apply_portrait')}</span>
                        </button>
                    </div>
                    {error && (
                        <div
                            role="alert"
                            className="rounded-[var(--radius-sm)] border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-200"
                        >
                            {t('crop.processing_failed')}
                        </div>
                    )}
                </div>

                {/* Interactive Hint */}
                <div className="flex items-center gap-4 text-white/20 text-[0.65rem] font-bold tracking-[0.25em] uppercase">
                    <span>{t('crop.hint_move')}</span>
                    <span className="h-3 w-px bg-white/20" aria-hidden="true" />
                    <span>{t('crop.hint_zoom')}</span>
                    <span className="h-3 w-px bg-white/20" aria-hidden="true" />
                    <span>{t('crop.hint_confirm')}</span>
                </div>
            </div>
        </div>
    );
}
