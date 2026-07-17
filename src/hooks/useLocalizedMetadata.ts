import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SUPPORTED_LANGUAGES = new Set(['ko', 'en', 'ja']);

function getLanguage(language: string): 'ko' | 'en' | 'ja' {
  const baseLanguage = language.split('-')[0];
  return SUPPORTED_LANGUAGES.has(baseLanguage)
    ? baseLanguage as 'ko' | 'en' | 'ja'
    : 'ko';
}

function setMetaContent(selector: string, content: string): void {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content);
}

export function useLocalizedMetadata(): void {
  const { t, i18n } = useTranslation();
  const language = getLanguage(i18n.resolvedLanguage || i18n.language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('common.meta_title');
    setMetaContent('meta[name="description"]', t('common.meta_description'));
    setMetaContent('meta[name="apple-mobile-web-app-title"]', t('common.home_screen_name'));
    document
      .querySelector<HTMLLinkElement>('link[rel="manifest"]')
      ?.setAttribute('href', `/manifest.${language}.webmanifest`);
  }, [language, t]);
}
