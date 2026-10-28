import { describe, expect, it } from 'vitest';
import { resolveContentPage } from './resolveContentPage';

describe('resolveContentPage', () => {
  it.each(['guide', 'faq', 'about', 'terms', 'privacy'] as const)(
    'resolves /%s with or without a trailing slash',
    page => {
      expect(resolveContentPage(`/${page}`)).toBe(page);
      expect(resolveContentPage(`/${page}/`)).toBe(page);
    },
  );

  it('resolves the root and unknown routes to the home page', () => {
    expect(resolveContentPage('/')).toBe('home');
    expect(resolveContentPage('/unknown/')).toBe('home');
  });
});
