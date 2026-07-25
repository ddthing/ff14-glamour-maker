import { lazy, Suspense, useCallback, useRef, useState, useEffect } from 'react';
import type { AppState } from '../../types';
import { useImageUpload } from '../../hooks/useImageUpload';
import { PhotoPanel } from './PhotoPanel';
import { InfoPanel } from './InfoPanel';
import { useTranslation } from 'react-i18next';
import { ACCEPTED_IMAGE_INPUT } from '../../features/image/imageFile';

interface Props {
    state: AppState;
    onPhotoConfirm: (croppedImage: Blob) => void;
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
        fileInputRef, pendingImage, clearPendingImage,
        error: uploadError,
        isDragging, dragHandlers, onFileInputChange,
    } = useImageUpload();

    const openFilePicker = useCallback(() => {
        fileInputRef.current?.click();
    }, [fileInputRef]);

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
                        onCancel={clearPendingImage}
                        onConfirm={croppedImage => {
                            onPhotoConfirm(croppedImage);
                            clearPendingImage();
                        }}
                    />
                </Suspense>
            )}

            {/* ── 숨은 파일 입력 ─── */}
            <input
                id="character-photo-upload"
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_INPUT}
                name="character-photo"
                aria-label={t('common.character_photo')}
                className="hidden"
                onChange={onFileInputChange}
            />

            <div
                ref={zoneRef}
                className="canvas-scale-zone relative min-w-0 w-full flex-1"
                style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
                {...dragHandlers}
            >
                {uploadError && (
                    <div
                        role="alert"
                        className="absolute left-3 right-3 top-3 z-20 rounded-[var(--radius-sm)] border border-[var(--error)]/30 bg-[var(--surface-100)]/95 px-3 py-2 text-sm text-[var(--error)] shadow-lg"
                    >
                        {uploadError === 'file-too-large'
                            ? t('common.upload_file_too_large')
                            : t('common.upload_unsupported_type')}
                    </div>
                )}
                <div
                    className="canvas-scale-outer preview-frame overflow-hidden rounded-[var(--radius-lg)]"
                    style={{
                        width:  scale < 1 ? CANVAS_W * scale : CANVAS_W,
                        height: scale < 1 ? CANVAS_H * scale : CANVAS_H,
                        position: 'relative'
                    }}
                >
                    <div
                        id="glamour-canvas"
                        className="canvas-scale-inner select-none flex flex-row"
                        style={{
                            background: '#1a1915',
                            width: CANVAS_W,
                            height: CANVAS_H,
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
                            onClick={openFilePicker}
                        />

                        {/* ── 우: 글래머 정보 패널 ── */}
                        <InfoPanel
                            title={state.title}
                            creator={state.creator}
                            items={state.items}
                            bgSrc={bgSrc}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
