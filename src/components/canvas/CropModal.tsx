import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Cancel01Icon, CheckmarkCircle02Icon, ImageUploadIcon, Search01Icon, Undo02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTranslation } from 'react-i18next';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

interface CropModalProps {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (croppedUrl: string, src: string) => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function CropModal({ imageSrc, onCancel, onConfirm }: CropModalProps) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPx, setCroppedAreaPx] = useState<CropArea | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onCancel]);

  const handleCropComplete = useCallback(
    (_: unknown, pixels: CropArea) => {
      setCroppedAreaPx(pixels);
      setApplyError(false);
    },
    [],
  );

  const moveCrop = (deltaX: number, deltaY: number) => {
    setCrop(previous => ({ x: previous.x + deltaX, y: previous.y + deltaY }));
  };

  const handleCropKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const step = 2;
    const movement = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }[event.key as 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown'];

    if (!movement) return;
    event.preventDefault();
    moveCrop(movement[0], movement[1]);
  };

  const handleConfirm = async () => {
    if (!croppedAreaPx || isApplying) return;
    setIsApplying(true);
    setApplyError(false);
    try {
      const url = await getCroppedImg(imageSrc, croppedAreaPx);
      if (url) {
        onConfirm(url, imageSrc);
      } else {
        setApplyError(true);
      }
    } catch {
      setApplyError(true);
    } finally {
      setIsApplying(false);
    }
  };

  return createPortal((
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-dialog-title"
      className="fixed inset-0 z-[3000] overflow-y-auto bg-[var(--bg-app)] p-2 sm:p-4"
    >
      <div className="mx-auto flex min-h-[calc(100dvh-1rem)] w-full max-w-[1180px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-panel)] animate-slide-up sm:min-h-[calc(100dvh-2rem)] lg:h-[calc(100dvh-2rem)] lg:min-h-0">
        <header className="flex min-h-[68px] shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] px-4 sm:px-6">
          <div className="min-w-0">
            <span className="mb-1 block text-[0.68rem] font-semibold text-[var(--text-muted)]">
              {t('crop.studio_editor')}
            </span>
            <h2 id="crop-dialog-title" className="truncate text-xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-2xl">
              {t('crop.refine_portrait')}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onCancel}
            aria-label={t('common.close')}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-200)] hover:text-[var(--text-primary)]"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.7} aria-hidden="true" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-rows-[minmax(300px,52dvh)_auto] lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-none">
          <section
            className="relative min-h-0 overflow-hidden border-b border-[var(--border)] bg-[#17191c] lg:border-b-0 lg:border-r"
            aria-label={t('crop.refine_portrait')}
            aria-describedby="crop-position-hint"
            aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"
            tabIndex={0}
            onKeyDown={handleCropKeyDown}
          >
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
                containerStyle: { background: '#17191c' },
                cropAreaStyle: {
                  border: '2px solid rgba(255,255,255,0.92)',
                  boxShadow: '0 0 0 9999px rgba(8,10,12,0.68)',
                  borderRadius: '0px',
                },
              }}
            />
            <div id="crop-position-hint" className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-[var(--radius-sm)] border border-white/15 bg-black/35 px-2.5 py-1.5 text-[0.65rem] text-white/65">
              <HugeiconsIcon icon={ImageUploadIcon} size={14} strokeWidth={1.6} aria-hidden="true" />
              <span>{t('crop.hint_move')} · {t('crop.hint_keyboard')}</span>
            </div>
          </section>

          <section className="flex min-h-0 flex-col justify-between gap-8 overflow-y-auto p-4 sm:p-6" aria-label={t('crop.zoom_intensity')}>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 text-[0.75rem] font-semibold text-[var(--text-secondary)]">
                <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.7} aria-hidden="true" />
                <label htmlFor="crop-zoom">{t('crop.zoom_intensity')}</label>
                <span className="ml-auto rounded-[var(--radius-sm)] bg-[var(--surface-200)] px-2 py-1 font-mono text-[0.68rem] text-[var(--text-secondary)]">
                  {(zoom * 100).toFixed(0)}%
                </span>
              </div>
              <input
                id="crop-zoom"
                type="range"
                min={1}
                max={4}
                step={0.01}
                value={zoom}
                onChange={event => setZoom(Number(event.target.value))}
                className="range-premium"
              />
              <p className="border-t border-[var(--border)] pt-5 text-xs leading-5 text-[var(--text-muted)]">
                {t('crop.hint_move')} · {t('crop.hint_keyboard')} · {t('crop.hint_zoom')} · {t('crop.hint_confirm')}
              </p>
            </div>

            <div className="grid gap-2">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isApplying}
                className="flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--text-primary)] px-4 text-sm font-bold text-[var(--bg-app)] transition-opacity hover:opacity-90 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={19} strokeWidth={1.8} aria-hidden="true" />
                <span>{isApplying ? t('common.loading') : t('crop.apply_portrait')}</span>
              </button>
              {applyError ? (
                <p role="alert" className="text-xs leading-5 text-[var(--error)]">
                  {t('crop.apply_failed')}
                </p>
              ) : null}
              <button
                type="button"
                onClick={onCancel}
                disabled={isApplying}
                className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-200)] hover:text-[var(--text-primary)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
              >
                <HugeiconsIcon icon={Undo02Icon} size={17} strokeWidth={1.7} aria-hidden="true" />
                <span>{t('crop.discard')}</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  ), document.body);
}
