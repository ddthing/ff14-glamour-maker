import { lazy, Suspense, useRef, useState, useEffect } from 'react';
import { ImageUploadIcon, RefreshIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { SUPPORTED_IMAGE_MIME_TYPES } from '../../constants/imageFormats';
import type { AppState } from '../../types';
import { useImageUpload } from '../../hooks/useImageUpload';
import { PhotoPanel } from './PhotoPanel';
import { InfoPanel } from './InfoPanel';
import { useTranslation } from 'react-i18next';

interface Props {
    state: AppState;
    onPhotoConfirm: (croppedImageSrc: string, imageSrc: string) => void;
}

const CANVAS_W = 1080;
const CANVAS_H = 900;
const CropModal = lazy(() => import('./CropModal').then(module => ({ default: module.CropModal })));

/**
 * PreviewCanvas — 1080×900 캔버스 (사진 480px + 정보 600px)
 * 스케일 방식: 외부 래퍼가 `scale * 1080` × `scale * 900` 크기를 점유하고,
 * 내부 캔버스는 `position:absolute; transform-origin:top left; scale(s)`
 * → 오버플로우·잘림·빈 공간 없음.
 *
 * 분해된 서브 컴포넌트:
 * - CropModal: 이미지 크롭 모달
 * - PhotoPanel: 좌측 캐릭터 사진 패널
 * - InfoPanel: 우측 글래머 정보 패널
 * - CanvasItemRow: 개별 아이템 행 (InfoPanel이 사용)
 */
export function PreviewCanvas({ state, onPhotoConfirm }: Props) {
    const { t } = useTranslation();
    const zoneRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const {
        fileInputRef, pendingImage, setPendingImage, error,
        isDragging, dragHandlers, onFileInputChange, loadFile,
    } = useImageUpload();

    useEffect(() => {
        if (pendingImage) return;

        const handlePaste = (event: ClipboardEvent) => {
            const target = event.target;
            if (target instanceof HTMLElement && (
                target.isContentEditable
                || target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')
            )) return;

            const clipboardItems = Array.from(event.clipboardData?.items ?? []);
            const imageItem = clipboardItems.find(item => item.kind === 'file' && item.type.startsWith('image/'));
            const file = imageItem?.getAsFile()
                ?? Array.from(event.clipboardData?.files ?? []).find(candidate => candidate.type.startsWith('image/'));
            if (!file) return;

            event.preventDefault();
            loadFile(file);
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [loadFile, pendingImage]);

    // ResizeObserver + rAF debounce — Layout Thrashing 방지
    useEffect(() => {
        let rafId = 0;

        const measure = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const zone = zoneRef.current;
                if (!zone) return;
                const { width, height } = zone.getBoundingClientRect();
                if (width === 0 || height === 0) return;

                const scaleW = width / CANVAS_W;
                const scaleH = height / CANVAS_H;
                const minScale = Math.min(scaleW, scaleH, 1);
                setScale(minScale);
            });
        };

        const obs = new ResizeObserver(measure);
        if (zoneRef.current) obs.observe(zoneRef.current);
        window.addEventListener('resize', measure, { passive: true });
        measure();

        return () => {
            obs.disconnect();
            window.removeEventListener('resize', measure);
            cancelAnimationFrame(rafId);
        };
    }, []);

    const bgSrc = state.croppedImageSrc || state.imageSrc;

    return (
        <>
            {/* ── CropModal ─── */}
            {pendingImage && (
                <Suspense fallback={(
                    <div className="fixed inset-0 z-[3000] grid place-items-center bg-black/90 text-sm font-bold text-white" role="status">
                        {t('common.loading')}
                    </div>
                )}>
                    <CropModal
                        imageSrc={pendingImage}
                        onCancel={() => setPendingImage(null)}
                        onConfirm={(croppedUrl, srcUrl) => {
                            onPhotoConfirm(croppedUrl, srcUrl);
                            setPendingImage(null);
                        }}
                    />
                </Suspense>
            )}

            {/* ── 숨은 파일 입력 ─── */}
            <input
                id="character-photo-upload"
                ref={fileInputRef}
                type="file"
                accept={[...SUPPORTED_IMAGE_MIME_TYPES, 'image/jpg'].join(',')}
                name="character-photo"
                aria-label={t('common.character_photo')}
                className="hidden"
                onChange={onFileInputChange}
            />

            <div
                ref={zoneRef}
                className="canvas-scale-zone min-w-0 w-full flex-1"
                style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
                {...dragHandlers}
            >
                <div
                    className="canvas-scale-outer preview-frame overflow-hidden rounded-none"
                    style={{
                        width:  scale < 1 ? CANVAS_W * scale : CANVAS_W,
                        height: scale < 1 ? CANVAS_H * scale : CANVAS_H,
                        position: 'relative',
                        border: 0,
                        borderRadius: 0,
                    }}
                >
                    <div
                        id="glamour-canvas"
                        className="canvas-scale-inner select-none flex flex-row"
                        style={{
                            background: '#1a1915',
                            width: CANVAS_W,
                            height: CANVAS_H,
                            borderRadius: 0,
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            transformOrigin: 'top left',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            WebkitFontSmoothing: 'antialiased',
                            ...(scale < 1 ? { transform: `scale(${scale}) translateZ(0)` } : {})
                        }}
                    >
                        {/* ── 좌: 캐릭터 사진 패널 ── */}
                        <PhotoPanel
                            croppedImageSrc={state.croppedImageSrc}
                            isDragging={isDragging}
                            onClick={() => fileInputRef.current?.click()}
                        />

                        {/* ── 우: 글래머 정보 패널 ── */}
                        <InfoPanel state={state} bgSrc={bgSrc} />
                    </div>
                    <div
                        data-export-exclude="true"
                        aria-hidden="true"
                        className="pointer-events-none absolute z-10 flex items-center justify-center rounded-[var(--radius-md)] border border-white/15 bg-[#17191c]/90 text-white/80"
                        style={{
                            left: 16 * scale,
                            bottom: 16 * scale,
                            width: 448 * scale,
                            height: Math.max(44 * scale, 32),
                            gap: Math.max(8 * scale, 4),
                            paddingInline: Math.max(16 * scale, 8),
                            fontSize: Math.max(12 * scale, 11),
                        }}
                    >
                        <HugeiconsIcon
                            icon={state.croppedImageSrc ? RefreshIcon : ImageUploadIcon}
                            size={Math.max(17 * scale, 13)}
                            strokeWidth={1.7}
                            aria-hidden="true"
                        />
                        <span className="whitespace-nowrap font-semibold">
                            {t(state.croppedImageSrc ? 'common.replace_image' : 'common.character_photo')}
                        </span>
                    </div>
                </div>
            </div>
            {error ? (
                <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 text-xs leading-5 text-[var(--error)]">
                    {t(`common.photo_${error === 'invalidType' ? 'invalid_type' : error === 'tooLarge' ? 'too_large' : 'read_failed'}`)}
                </p>
            ) : null}
        </>
    );
}
