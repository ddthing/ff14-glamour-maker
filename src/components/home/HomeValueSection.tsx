import { useTranslation } from 'react-i18next';

interface HomeFeature {
  title: string;
  description: string;
}

interface HomeDetail {
  label: string;
  description: string;
}

export function HomeValueSection() {
  const { t } = useTranslation();

  const features: HomeFeature[] = [
    {
      title: t('common.home_feature_workflow_title'),
      description: t('common.home_feature_workflow_description'),
    },
    {
      title: t('common.home_feature_reproducible_title'),
      description: t('common.home_feature_reproducible_description'),
    },
    {
      title: t('common.home_feature_post_title'),
      description: t('common.home_feature_post_description'),
    },
  ];

  const details: HomeDetail[] = [
    {
      label: t('common.home_detail_photo_label'),
      description: t('common.home_detail_photo_description'),
    },
    {
      label: t('common.home_detail_equipment_label'),
      description: t('common.home_detail_equipment_description'),
    },
    {
      label: t('common.home_detail_identity_label'),
      description: t('common.home_detail_identity_description'),
    },
    {
      label: t('common.home_detail_optional_label'),
      description: t('common.home_detail_optional_description'),
    },
  ];

  return (
    <section className="home-value-section" aria-labelledby="home-value-title">
      <div className="home-value-heading">
        <p className="content-eyebrow">{t('common.home_content_eyebrow')}</p>
        <h2 id="home-value-title">{t('common.home_content_title')}</h2>
        <p>{t('common.home_content_description')}</p>
      </div>

      <ul className="home-feature-grid">
        {features.map((feature, index) => (
          <li key={feature.title} className="home-feature-card">
            <span className="home-feature-index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </li>
        ))}
      </ul>

      <div className="home-detail-grid">
        <section className="home-detail-card" aria-labelledby="home-details-title">
          <p className="content-eyebrow">{t('common.home_details_eyebrow')}</p>
          <h3 id="home-details-title">{t('common.home_details_title')}</h3>
          <dl className="home-detail-list">
            {details.map(detail => (
              <div key={detail.label} className="home-detail-row">
                <dt>{detail.label}</dt>
                <dd>{detail.description}</dd>
              </div>
            ))}
          </dl>
          <p className="home-detail-note">{t('common.home_details_note')}</p>
        </section>

        <aside className="home-next-card" aria-labelledby="home-next-title">
          <p className="content-eyebrow">{t('common.home_next_eyebrow')}</p>
          <h3 id="home-next-title">{t('common.home_next_title')}</h3>
          <p>{t('common.home_next_description')}</p>
          <nav aria-label={t('common.home_related_navigation')} className="home-related-links">
            <a href="/guide" className="content-inline-link">{t('common.footer_guide')}</a>
            <a href="/faq" className="content-inline-link">{t('common.footer_faq')}</a>
            <a href="/about" className="content-inline-link">{t('common.footer_about')}</a>
          </nav>
        </aside>
      </div>
    </section>
  );
}
