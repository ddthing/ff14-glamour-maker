import {
  Download04Icon,
  ImageUploadIcon,
  PencilEdit01Icon,
  Search01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTranslation } from 'react-i18next';
import { useLocalizedPageContent } from '../../content/localizedPages';

const STEP_ICONS = [
  ImageUploadIcon,
  PencilEdit01Icon,
  Search01Icon,
  SparklesIcon,
  Download04Icon,
] as const;

export function SeoArticle() {
  const { guide } = useLocalizedPageContent();
  const { t } = useTranslation();

  return (
    <article className="guide-article content-prose">
      <section className="guide-intro">
        {guide.intro.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </section>

      <section className="guide-section">
        <div className="guide-section-heading">
          <p className="content-eyebrow">01 — FLOW</p>
          <h2>{guide.howTitle}</h2>
        </div>

        <ol className="guide-step-list">
          {guide.steps.map((step, index) => {
            const icon = STEP_ICONS[index] ?? SparklesIcon;

            return (
              <li key={step.title} className="guide-step">
                <div className="guide-step-rail" aria-hidden="true">
                  <span className="guide-step-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="guide-step-icon">
                    <HugeiconsIcon icon={icon} size={22} strokeWidth={1.7} />
                  </span>
                </div>
                <div className="guide-step-copy">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="guide-section">
        <div className="guide-section-heading">
          <p className="content-eyebrow">02 — DETAIL</p>
          <h2>{guide.tipsTitle}</h2>
        </div>
        <ul className="guide-tip-grid">
          {guide.tips.map(tip => (
            <li key={tip.title} className="guide-tip-card">
              <h3>{tip.title}</h3>
              <p>{tip.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="guide-section">
        <div className="guide-section-heading">
          <p className="content-eyebrow">03 — CHECK</p>
          <h2>{guide.checklistTitle}</h2>
        </div>
        <ul className="guide-checklist">
          {guide.checklist.map(item => (
            <li key={item}>
              <span className="guide-checklist-mark" aria-hidden="true">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <aside className="content-callout guide-local-note">
        <h2>{guide.localNoteTitle}</h2>
        <p>{guide.localNote}</p>
        <div className="guide-related-links">
          <a href="/faq" className="content-inline-link">{t('common.footer_faq')}</a>
          <a href="/privacy" className="content-inline-link">{t('common.footer_privacy')}</a>
        </div>
      </aside>

      <section className="guide-section">
        <div className="guide-section-heading">
          <p className="content-eyebrow">04 — QUESTIONS</p>
          <h2>{guide.faqTitle}</h2>
        </div>
        <div className="content-faq-list">
          {guide.entries.map((entry, index) => (
            <details key={entry.question} className="content-faq-item" open={index === 0}>
              <summary>{entry.question}</summary>
              <p>{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </article>
  );
}
