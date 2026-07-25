import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PRODUCTION_ORIGIN,
  getRouteMetadata,
  resolvePublicPath,
  type SupportedLanguage,
} from '../features/seo/routeMetadata';

const SUPPORTED_LANGUAGES = new Set(['ko', 'en', 'ja']);

function getLanguage(language: string): SupportedLanguage {
  const baseLanguage = language.split('-')[0];
  return SUPPORTED_LANGUAGES.has(baseLanguage)
    ? baseLanguage as SupportedLanguage
    : 'ko';
}

function setMetaContent(selector: string, content: string, attributes: Record<string, string>): void {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(canonical: string | null): void {
  const current = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    current?.remove();
    return;
  }

  const link = current ?? document.createElement('link');
  link.setAttribute('rel', 'canonical');
  link.setAttribute('href', canonical);
  if (!current) document.head.appendChild(link);
}

function setStructuredData(
  type: 'WebApplication' | null,
  language: SupportedLanguage,
  name: string,
  description: string,
): void {
  const current = document.querySelector<HTMLScriptElement>('#app-structured-data');
  if (!type) {
    current?.remove();
    return;
  }

  const script = current ?? document.createElement('script');
  script.id = 'app-structured-data';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description,
    url: `${PRODUCTION_ORIGIN}/`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    inLanguage: language,
    image: `${PRODUCTION_ORIGIN}/og-image.png`,
  });
  if (!current) document.head.appendChild(script);
}

export function useLocalizedMetadata(): void {
  const { t, i18n } = useTranslation();
  const language = getLanguage(i18n.resolvedLanguage || i18n.language);

  useEffect(() => {
    const route = resolvePublicPath(window.location.pathname);
    const metadata = getRouteMetadata(route, language);

    document.documentElement.lang = language;
    document.title = metadata.title;
    setMetaContent('meta[name="description"]', metadata.description, { name: 'description' });
    setMetaContent('meta[name="robots"]', metadata.robots, { name: 'robots' });
    setMetaContent('meta[property="og:title"]', metadata.title, { property: 'og:title' });
    setMetaContent('meta[property="og:description"]', metadata.description, { property: 'og:description' });
    setMetaContent('meta[property="og:url"]', metadata.canonical ?? window.location.href, { property: 'og:url' });
    setMetaContent('meta[name="twitter:title"]', metadata.title, { name: 'twitter:title' });
    setMetaContent('meta[name="twitter:description"]', metadata.description, { name: 'twitter:description' });
    setMetaContent('meta[name="apple-mobile-web-app-title"]', t('common.home_screen_name'), {
      name: 'apple-mobile-web-app-title',
    });
    setCanonical(metadata.canonical);
    setStructuredData(
      metadata.structuredDataType,
      language,
      t('common.title_brand'),
      metadata.description,
    );
    document
      .querySelector<HTMLLinkElement>('link[rel="manifest"]')
      ?.setAttribute('href', `/manifest.${language}.webmanifest`);
  }, [language, t]);
}
