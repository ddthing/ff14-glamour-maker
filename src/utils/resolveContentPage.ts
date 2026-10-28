import type { ContentPageKey } from '../content/pageTypes';

const ROUTE_TO_PAGE: Record<string, ContentPageKey> = {
  '/': 'home',
  '/guide': 'guide',
  '/faq': 'faq',
  '/about': 'about',
  '/terms': 'terms',
  '/privacy': 'privacy',
};

export function resolveContentPage(pathname: string): ContentPageKey {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  return ROUTE_TO_PAGE[normalizedPath] ?? 'home';
}
