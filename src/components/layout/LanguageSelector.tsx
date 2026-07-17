import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'ko', label: 'KR', nameKey: 'common.language_korean' },
  { code: 'en', label: 'EN', nameKey: 'common.language_english' },
  { code: 'ja', label: 'JA', nameKey: 'common.language_japanese' },
] as const;

export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language.split('-')[0];

  return (
    <div
      className="header-language-group"
      role="group"
      aria-label={t('common.language_selector')}
    >
      {LANGUAGES.map(language => {
        const isCurrent = currentLanguage === language.code;

        return (
          <button
            key={language.code}
            type="button"
            onClick={() => void i18n.changeLanguage(language.code)}
            aria-pressed={isCurrent}
            aria-label={t(language.nameKey)}
            data-current={isCurrent || undefined}
            className="header-control-cell text-[0.6rem] font-bold tracking-[0.06em]"
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
}
