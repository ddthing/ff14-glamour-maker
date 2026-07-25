import { describe, expect, it } from 'vitest';
import {
  INDEXABLE_PATHS,
  getRouteMetadata,
  resolvePublicPath,
} from './routeMetadata';

describe('route metadata', () => {
  it('gives every indexable Korean page a unique search identity', () => {
    const pages = INDEXABLE_PATHS.map(path => getRouteMetadata(path, 'ko'));

    expect(new Set(pages.map(page => page.title)).size).toBe(pages.length);
    expect(new Set(pages.map(page => page.description)).size).toBe(pages.length);
    expect(pages.map(page => page.canonical)).toEqual([
      'https://ff14-glamour-maker.pages.dev/',
      'https://ff14-glamour-maker.pages.dev/guide',
      'https://ff14-glamour-maker.pages.dev/about',
      'https://ff14-glamour-maker.pages.dev/privacy',
      'https://ff14-glamour-maker.pages.dev/terms',
    ]);
  });

  it('limits application structured data to the maker home', () => {
    expect(getRouteMetadata('/', 'ko').structuredDataType).toBe('WebApplication');

    for (const path of INDEXABLE_PATHS.slice(1)) {
      expect(getRouteMetadata(path, 'ko').structuredDataType).toBeNull();
    }
  });

  it('keeps locale metadata aligned with the selected interface language', () => {
    expect(getRouteMetadata('/guide', 'en').title).toContain('Guide');
    expect(getRouteMetadata('/guide', 'ja').title).toContain('使い方');
  });

  it('maps unknown and retired FAQ paths to a non-indexable 404 boundary', () => {
    expect(resolvePublicPath('/missing')).toBe('/404');
    expect(resolvePublicPath('/faq')).toBe('/404');
    expect(getRouteMetadata('/404', 'ko')).toMatchObject({
      canonical: null,
      robots: 'noindex, nofollow',
      structuredDataType: null,
    });
  });
});
