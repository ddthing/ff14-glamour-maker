import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useImagePalette } from '../../hooks/useImagePalette';
import type { AppState } from '../../types';
import { CanvasHeading } from './CanvasHeading';
import { DynamicCardBackground } from './DynamicCardBackground';
import { EquipmentList } from './EquipmentList';

interface InfoPanelProps {
  state: AppState;
  bgSrc: string | null;
}

export function InfoPanel({ state, bgSrc }: InfoPanelProps) {
  const { t } = useTranslation();
  const { palette, status } = useImagePalette(bgSrc);
  const hasHeading = Boolean(state.title.trim() || state.creator.trim());
  const useDarkText = Boolean(bgSrc) && palette.textTone === 'dark';
  const cardStyle = {
    '--card-text-primary': useDarkText ? 'rgba(18, 22, 26, 0.94)' : 'rgba(255, 255, 255, 0.98)',
    '--card-text-secondary': useDarkText ? 'rgba(18, 22, 26, 0.92)' : 'rgba(255, 255, 255, 0.94)',
    '--card-text-muted': useDarkText ? 'rgba(18, 22, 26, 0.88)' : 'rgba(255, 255, 255, 0.9)',
    '--card-divider': useDarkText ? 'rgba(18, 22, 26, 0.14)' : 'rgba(255, 255, 255, 0.12)',
    '--card-chip-bg': useDarkText ? 'rgba(255, 255, 255, 0.38)' : 'rgba(255, 255, 255, 0.08)',
    '--card-chip-border': useDarkText ? 'rgba(18, 22, 26, 0.14)' : 'rgba(255, 255, 255, 0.12)',
  } as CSSProperties;

  return (
    <div
      className="relative flex h-full flex-1 flex-col overflow-hidden bg-[#17191c]"
      data-card-text-tone={useDarkText ? 'dark' : 'light'}
      style={cardStyle}
    >
      <DynamicCardBackground source={bgSrc} palette={palette} status={status} />

      <div
        className="relative z-10 flex h-full flex-col"
        style={{ padding: '32px 40px 24px' }}
      >
        {hasHeading ? (
          <>
            <CanvasHeading
              title={state.title.trim()}
              creator={state.creator.trim()}
              label={t('common.canvas_label')}
            />
            <div
              className="shrink-0"
              style={{ height: 1, background: 'var(--card-divider)', marginBottom: 12 }}
            />
          </>
        ) : null}

        <EquipmentList
          items={state.items}
          fashionAccessory={state.fashionAccessory}
          emptyTitle={t('common.empty_title', 'Create Your Glamour Card')}
          emptySteps={[
            t('common.step1_upload', 'Upload Character Photo'),
            t('common.step2_equip', 'Add Equipment'),
            t('common.step3_save', 'Save Image'),
          ]}
        />

        <div
          className="mt-3 flex shrink-0 items-end justify-between pt-2.5"
          style={{ borderTop: '1px solid var(--card-divider)' }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[var(--card-text-secondary)]">
              {t('common.title_brand')}
            </span>
            <span className="text-[0.55rem] font-semibold uppercase tracking-[0.08em] text-[var(--card-text-muted)]">
              ff14-glamour.pages.dev
            </span>
          </div>

          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[0.5rem] font-bold uppercase tracking-[0.1em] text-[var(--card-text-muted)]">
              {t('common.design_credit')}
            </span>
            <span className="text-[0.6rem] font-extrabold tracking-[0.05em] text-[var(--card-text-secondary)]">
              @RECONEUR
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
