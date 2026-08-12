import { ImageUploadIcon, RefreshIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTranslation } from 'react-i18next';

interface PhotoPanelProps {
  croppedImageSrc: string | null;
  isDragging: boolean;
  hoverPhoto: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

export function PhotoPanel({
  croppedImageSrc,
  isDragging,
  hoverPhoto,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: PhotoPanelProps) {
  const { t } = useTranslation();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={croppedImageSrc ? t('common.replace_image') : t('common.upload_hint')}
      className="relative flex h-full w-[480px] shrink-0 cursor-pointer select-none items-center justify-center overflow-hidden bg-[#17191c]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      {isDragging ? (
        <div className="absolute inset-4 z-50 flex flex-col items-center justify-center gap-3 border border-dashed border-white/40 bg-[#17191c]/92 text-white/80">
          <div className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] border border-white/15 bg-white/[0.06]">
            <HugeiconsIcon icon={ImageUploadIcon} size={24} strokeWidth={1.6} aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold">{t('common.drop_image')}</span>
        </div>
      ) : null}

      {croppedImageSrc ? (
        <>
          <img
            src={croppedImageSrc}
            alt={t('common.character_photo')}
            width={480}
            height={900}
            className="h-full w-full object-cover"
          />
          {hoverPhoto && !isDragging ? (
            <div className="absolute inset-x-4 bottom-4 flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-white/15 bg-[#17191c]/90 px-4 text-white/80">
              <HugeiconsIcon icon={RefreshIcon} size={17} strokeWidth={1.7} aria-hidden="true" />
              <span className="text-xs font-semibold">{t('common.replace_image')}</span>
            </div>
          ) : null}
        </>
      ) : (
        <div className="relative m-6 flex h-[calc(100%_-_48px)] w-[calc(100%_-_48px)] items-center justify-center border border-white/10 sm:m-8 sm:h-[calc(100%_-_64px)] sm:w-[calc(100%_-_64px)]">
          <div className="z-10 flex max-w-[280px] flex-col items-center gap-5 px-5 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-[var(--radius-md)] border border-white/12 bg-white/[0.04] text-white/55">
              <HugeiconsIcon icon={ImageUploadIcon} size={27} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-semibold text-white/70">{t('common.upload_hint')}</span>
              <span className="text-xs leading-5 text-white/35">{t('common.click_or_drag')}</span>
            </div>
            <span className="rounded-[var(--radius-sm)] border border-white/10 px-2 py-1 font-mono text-[0.58rem] tracking-[0.06em] text-white/25">
              JPG · PNG · WEBP
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
