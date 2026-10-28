import { useTranslation } from 'react-i18next';

interface StudioOverviewProps {
  hasPhoto: boolean;
  hasEquipment: boolean;
}

export function StudioOverview({ hasPhoto, hasEquipment }: StudioOverviewProps) {
  const { t } = useTranslation();
  const steps = [
    { label: t('common.step1_upload'), complete: hasPhoto },
    { label: t('common.step2_equip'), complete: hasEquipment },
    { label: t('common.studio_step3_label'), complete: hasPhoto && hasEquipment },
  ];
  const completedSteps = steps.filter(step => step.complete).length;

  return (
    <section className="studio-overview" aria-labelledby="app-page-title">
      <div className="studio-overview-copy">
        <p className="studio-eyebrow">{t('common.studio_eyebrow')}</p>
        <h1 id="app-page-title" className="studio-title">{t('common.studio_title')}</h1>
        <p className="studio-description">{t('common.studio_description')}</p>
      </div>

      <div className="studio-progress-card">
        <div className="studio-progress-heading">
          <span className="studio-progress-label">{t('common.studio_progress')}</span>
          <span className="studio-progress-count">
            {t('common.studio_progress_count', { completed: completedSteps, total: steps.length })}
          </span>
        </div>
        <ol className="studio-progress-steps" aria-label={t('common.studio_progress')}>
          {steps.map((step, index) => (
            <li className="studio-progress-step" data-complete={step.complete || undefined} key={step.label}>
              <span className="studio-progress-marker" aria-hidden="true">
                {step.complete ? '✓' : String(index + 1).padStart(2, '0')}
              </span>
              <span className="studio-progress-step-label">{step.label}</span>
              <span className="sr-only">
                {t(step.complete ? 'common.studio_step_complete' : 'common.studio_step_pending')}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
