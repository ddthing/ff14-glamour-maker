import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedPageContent } from '../content/localizedPages';
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
  const pageContent = useLocalizedPageContent();
  const language = getLanguage(i18n.resolvedLanguage || i18n.language);
  const pageData = page === 'home' ? null : pageContent[page];

  useEffect(() => {
    const pageTitle = pageData
      ? `${pageData.title} | ${t('common.title_brand')}`
      : t('common.meta_title');
    const description = pageData?.description || t('common.meta_description');
    const routePath = page === 'home' ? '/' : `/${page}`;
    const canonicalUrl = `${window.location.origin}${routePath}`;

    document.documentElement.lang = language;
    document.title = pageTitle;
    setMetaContent('name', 'description', description);
    setMetaContent('name', 'apple-mobile-web-app-title', t('common.home_screen_name'));
    setMetaContent('property', 'og:title', pageTitle);
    setMetaContent('property', 'og:description', description);
    setMetaContent('property', 'og:url', canonicalUrl);
    setMetaContent('property', 'og:locale', language === 'ko' ? 'ko_KR' : language === 'ja' ? 'ja_JP' : 'en_US');
    setMetaContent('name', 'twitter:title', pageTitle);
    setMetaContent('name', 'twitter:description', description);
    setCanonicalUrl(canonicalUrl);
    document
      .querySelector<HTMLLinkElement>('link[rel="manifest"]')
      ?.setAttribute('href', `/manifest.${language}.webmanifest`);

    if (pageData) {
      setPageStructuredData({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageTitle,
        description,
        url: canonicalUrl,
        inLanguage: language,
        dateModified: pageData.lastUpdatedIso,
        isPartOf: {
          '@type': 'WebSite',
          name: t('common.title_brand'),
          url: `${window.location.origin}/`,
        },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: t('common.title_brand'),
              item: `${window.location.origin}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: pageData.title,
              item: canonicalUrl,
            },
          ],
        },
      });
    } else {
      document.querySelector('#page-structured-data')?.remove();
    }
  }, [language, page, pageData, t]);
}
