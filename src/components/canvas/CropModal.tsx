import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { RotateCcw, Check } from 'lucide-react';

interface CropModalProps {
    imageSrc: string;
    onCancel: () => void;
    onConfirm: (croppedUrl: string, src: string) => void;
}

/**
 * CropModal — 이미지 크롭 모달
 * PreviewCanvas에서 분리된 독립 컴포넌트
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
        <div className="fixed inset-0 z-[1000] bg-[rgba(38,37,30,0.92)] flex flex-col items-center justify-center gap-6 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-[600px] h-[500px] rounded-[var(--radius-lg)] overflow-hidden border border-white/10" style={{ boxShadow: 'var(--shadow-elevated)' }}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={480 / 900}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                    showGrid={false}
                />
            </div>
            <div className="flex flex-col items-center gap-4 w-full max-w-[380px]">
                <div className="flex items-center gap-3 w-full">
                    <span className="text-[0.7rem] font-bold uppercase tracking-widest text-white/50 shrink-0">
                        {t('common.zoom')}
                    </span>
                    <input
                        type="range" min={1} max={4} step={0.05}
                        value={zoom}
                        onChange={e => setZoom(parseFloat(e.target.value))}
                        className="flex-1 accent-[var(--accent)]"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex items-center gap-2 px-5 py-2 rounded-[var(--radius-pill)] border border-white/20 text-white/70 text-sm font-semibold hover:bg-white/10 transition-colors"
                    >
                        <RotateCcw size={13} />
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex items-center gap-2 px-7 py-2 rounded-[var(--radius-pill)] bg-[var(--surface-300)] text-[var(--text-primary)] text-sm font-bold hover:text-[var(--error)] transition-colors"
                        style={{ boxShadow: 'var(--shadow-focus)' }}
                    >
                        <Check size={13} />
                        {t('common.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
