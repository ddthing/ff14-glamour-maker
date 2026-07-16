import { lazy, Suspense, useRef, useState, useEffect } from 'react';
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
    const [hoverPhoto, setHoverPhoto] = useState(false);

    const {
        fileInputRef, pendingImage, setPendingImage,
        isDragging, dragHandlers, onFileInputChange,
    } = useImageUpload();

    // ResizeObserver + rAF debounce — Layout Thrashing 방지
    useEffect(() => {
        let rafId = 0;

        const obs = new ResizeObserver(([entry]) => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const { width, height } = entry.contentRect;
                if (width === 0 || height === 0) return;
                
                const scaleW = width / CANVAS_W;
                const scaleH = height / CANVAS_H;
                const minScale = Math.min(scaleW, scaleH, 1);
                setScale(minScale);
            });
        });
        if (zoneRef.current) obs.observe(zoneRef.current);
        return () => { obs.disconnect(); cancelAnimationFrame(rafId); };
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
                accept="image/*"
                name="character-photo"
                aria-label={t('common.character_photo')}
                className="hidden"
                onChange={onFileInputChange}
            />

            <div
                ref={zoneRef}
                className="canvas-scale-zone flex-1 w-full"
                style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
                {...dragHandlers}
            >
                <div
                    className="canvas-scale-outer rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-elevated)]"
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
                            hoverPhoto={hoverPhoto}
                            onMouseEnter={() => setHoverPhoto(true)}
                            onMouseLeave={() => setHoverPhoto(false)}
                            onClick={() => fileInputRef.current?.click()}
                        />

                        {/* ── 우: 글래머 정보 패널 ── */}
                        <InfoPanel state={state} bgSrc={bgSrc} />
                    </div>
                </div>
            </div>
        </>
    );
}
