import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalizedPageContent } from '../content/localizedPages';
import type { ContentPageKey } from '../content/pageTypes';

const SUPPORTED_LANGUAGES = new Set(['ko', 'en', 'ja']);

function getLanguage(language: string): 'ko' | 'en' | 'ja' {
  const baseLanguage = language.split('-')[0];
  return SUPPORTED_LANGUAGES.has(baseLanguage)
    ? baseLanguage as 'ko' | 'en' | 'ja'
    : 'ko';
}

function setMetaContent(attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export interface LocalizedMetadata {
  language: 'ko' | 'en' | 'ja';
  pageTitle: string;
  description: string;
  canonicalUrl: string;
  manifestPath: string;
  ogLocale: string;
  structuredData: Record<string, unknown> | null;
}

export function getLocalizedMetadata(
  page: ContentPageKey,
  languageInput: string,
  origin: string,
  translate: (key: string) => string,
): LocalizedMetadata {
  const language = getLanguage(languageInput);
  const pageContent = getLocalizedPageContent(language);
  const pageData = page === 'home' ? null : pageContent[page];
  const pageTitle = pageData
    ? `${pageData.title} | ${translate('common.title_brand')}`
    : translate('common.meta_title');
  const description = pageData?.description || translate('common.meta_description');
  const routePath = page === 'home' ? '/' : `/${page}/`;
  const canonicalUrl = `${origin}${routePath}`;
  const ogLocale = language === 'ko' ? 'ko_KR' : language === 'ja' ? 'ja_JP' : 'en_US';

  return {
    language,
    pageTitle,
    description,
    canonicalUrl,
    manifestPath: `/manifest.${language}.webmanifest`,
    ogLocale,
    structuredData: pageData
      ? {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: pageTitle,
          description,
          url: canonicalUrl,
          inLanguage: language,
          dateModified: pageData.lastUpdatedIso,
          isPartOf: {
            '@type': 'WebSite',
            name: translate('common.title_brand'),
            url: `${origin}/`,
          },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: translate('common.title_brand'),
                item: `${origin}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: pageData.title,
                item: canonicalUrl,
              },
            ],
          },
        }
      : null,
  };
}

function setCanonicalUrl(url: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setPageStructuredData(data: Record<string, unknown>): void {
  let script = document.querySelector<HTMLScriptElement>('#page-structured-data');
  if (!script) {
    script = document.createElement('script');
    script.id = 'page-structured-data';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function useLocalizedMetadata(page: ContentPageKey = 'home'): void {
  const { t, i18n } = useTranslation();
  const language = getLanguage(i18n.resolvedLanguage || i18n.language);

  useEffect(() => {
    const metadata = getLocalizedMetadata(page, language, window.location.origin, t);

    document.documentElement.lang = metadata.language;
    document.title = metadata.pageTitle;
    setMetaContent('name', 'description', metadata.description);
    setMetaContent('name', 'apple-mobile-web-app-title', t('common.home_screen_name'));
    setMetaContent('property', 'og:title', metadata.pageTitle);
    setMetaContent('property', 'og:description', metadata.description);
    setMetaContent('property', 'og:url', metadata.canonicalUrl);
    setMetaContent('property', 'og:locale', metadata.ogLocale);
    setMetaContent('name', 'twitter:title', metadata.pageTitle);
    setMetaContent('name', 'twitter:description', metadata.description);
    setCanonicalUrl(metadata.canonicalUrl);
    document
      .querySelector<HTMLLinkElement>('link[rel="manifest"]')
      ?.setAttribute('href', metadata.manifestPath);

    if (metadata.structuredData) {
      setPageStructuredData(metadata.structuredData);
    } else {
      document.querySelector('#page-structured-data')?.remove();
    }
  }, [language, page, t]);
}
