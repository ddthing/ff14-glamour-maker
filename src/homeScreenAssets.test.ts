import { describe, expect, it } from 'vitest';
import appleTouchIcon from '../public/apple-touch-icon.png?url';
import icon192 from '../public/icon-192.png?url';
import icon512 from '../public/icon-512.png?url';
import koManifestSource from '../public/manifest.ko.webmanifest?raw';
import enManifestSource from '../public/manifest.en.webmanifest?raw';
import jaManifestSource from '../public/manifest.ja.webmanifest?raw';

const manifests = {
  ko: koManifestSource,
  en: enManifestSource,
  ja: jaManifestSource,
};

describe('home-screen assets', () => {
  it('bundles the shared prism PNG derivatives', () => {
    expect(appleTouchIcon).toContain('apple-touch-icon');
    expect(icon192).toContain('icon-192');
    expect(icon512).toContain('icon-512');
  });

  it.each([
    ['ko', '투영세트 메이커'],
    ['en', 'Glamour Set Maker'],
    ['ja', 'ミラプリセットメーカー'],
  ])('provides a localized %s manifest using shared icons', (language, name) => {
    const manifest = JSON.parse(
      manifests[language as keyof typeof manifests],
    ) as { name: string; short_name: string; lang: string; icons: Array<{ src: string }> };

    expect(manifest).toMatchObject({ name, short_name: name, lang: language });
    expect(manifest.icons.map(icon => icon.src)).toEqual(['/icon-192.png', '/icon-512.png']);
  });
});
