import { renderToString } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import type { ComponentType } from 'react';
import i18n from './i18n';
import App from './App';
import { About } from './pages/About';
import { Faq } from './pages/Faq';
import { Guide } from './pages/Guide';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { getLocalizedMetadata } from './hooks/useLocalizedMetadata';
import type { ContentPageKey } from './content/pageTypes';

const PAGE_COMPONENTS: Record<ContentPageKey, ComponentType> = {
  home: App,
  guide: Guide,
  faq: Faq,
  about: About,
  terms: Terms,
  privacy: Privacy,
};

function getPageKey(path: string): ContentPageKey {
  const normalizedPath = path.replace(/\/$/, '') || '/';
  if (normalizedPath === '/') return 'home';
  const candidate = normalizedPath.slice(1) as ContentPageKey;
  return candidate in PAGE_COMPONENTS ? candidate : 'home';
}

export async function renderPage(path: string, language: string): Promise<string> {
  await i18n.changeLanguage(language);
  const Component = PAGE_COMPONENTS[getPageKey(path)];

  return renderToString(
    <I18nextProvider i18n={i18n}>
      <Component />
    </I18nextProvider>,
  );
}

export function getPageMetadata(path: string, language: string, origin: string) {
  const page = getPageKey(path);
  return getLocalizedMetadata(page, language, origin, key => i18n.t(key));
}
