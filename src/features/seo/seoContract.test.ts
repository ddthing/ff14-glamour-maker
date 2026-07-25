/// <reference types="node" />

import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const PUBLISHER_ID = 'ca-pub-2169729065542563';
const PRODUCTION_ORIGIN = 'https://ff14-glamour-maker.pages.dev';
const OBSOLETE_ORIGIN = 'https://ff14-glamour.pages.dev';

function readProjectFile(path: string): string {
  return readFileSync(new URL(`../../../${path}`, import.meta.url), 'utf8');
}

describe('SEO and monetization contracts', () => {
  it('keeps AdSense ownership verification without requesting ads', () => {
    const indexHtml = readProjectFile('index.html');
    const adsTxt = readProjectFile('public/ads.txt');

    expect(indexHtml).toContain(
      `<meta name="google-adsense-account" content="${PUBLISHER_ID}" />`,
    );
    expect(indexHtml).not.toContain('pagead2.googlesyndication.com');
    expect(adsTxt).toContain(`pub-${PUBLISHER_ID.replace('ca-pub-', '')}`);
  });

  it('does not retain dormant ad UI or starter assets', () => {
    expect(existsSync(new URL('../../components/ads/AdBanner.tsx', import.meta.url))).toBe(false);
    expect(existsSync(new URL('../../../public/vite.svg', import.meta.url))).toBe(false);
  });

  it('uses the production origin on exported cards', () => {
    const infoPanel = readProjectFile('src/components/canvas/InfoPanel.tsx');

    expect(infoPanel).toContain('ff14-glamour-maker.pages.dev');
    expect(infoPanel).not.toContain('ff14-glamour.pages.dev');
  });

  it('publishes only the canonical production origin in search signals', () => {
    const searchFiles = [
      readProjectFile('index.html'),
      readProjectFile('public/robots.txt'),
      readProjectFile('public/sitemap.xml'),
    ];

    for (const content of searchFiles) {
      expect(content).not.toContain(OBSOLETE_ORIGIN);
    }
  });

  it('allows render assets and advertises the canonical sitemap', () => {
    const robots = readProjectFile('public/robots.txt');

    expect(robots).not.toMatch(/Disallow:\s*\/assets\//);
    expect(robots).toContain(`Sitemap: ${PRODUCTION_ORIGIN}/sitemap.xml`);
  });

  it('lists the canonical Korean route set without ignored sitemap hints', () => {
    const sitemap = readProjectFile('public/sitemap.xml');
    const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map(match => match[1]);

    expect(locations).toEqual([
      `${PRODUCTION_ORIGIN}/`,
      `${PRODUCTION_ORIGIN}/guide`,
      `${PRODUCTION_ORIGIN}/about`,
      `${PRODUCTION_ORIGIN}/privacy`,
      `${PRODUCTION_ORIGIN}/terms`,
    ]);
    expect(sitemap).not.toMatch(/<(?:priority|changefreq)>/);
    expect(sitemap).not.toContain('hreflang=');
  });
});
