import { describe, expect, it } from 'vitest';
import appleTouchIcon from '../public/apple-touch-icon-01.png?url';
import icon192 from '../public/icon-01-192.png?url';
import icon512 from '../public/icon-01-512.png?url';
import koManifestSource from '../public/manifest-01.ko.webmanifest?raw';
import enManifestSource from '../public/manifest-01.en.webmanifest?raw';
import jaManifestSource from '../public/manifest-01.ja.webmanifest?raw';

const manifests = {
  ko: koManifestSource,
  en: enManifestSource,
  ja: jaManifestSource,
};

describe('home-screen assets', () => {
  it('bundles the edition 01 PNG derivatives', () => {
    expect(appleTouchIcon).toContain('apple-touch-icon-01');
    expect(icon192).toContain('icon-01-192');
    expect(icon512).toContain('icon-01-512');
  });

  it.each([
    ['ko', '투영세트메이커'],
    ['en', 'Glamour Set Maker'],
    ['ja', 'ミラプリセットメーカー'],
  ])('provides a localized %s manifest using edition 01 icons', (language, name) => {
    const manifest = JSON.parse(
      manifests[language as keyof typeof manifests],
    ) as { name: string; short_name: string; lang: string; icons: Array<{ src: string }> };

    expect(manifest).toMatchObject({ name, short_name: name, lang: language });
    expect(manifest.icons.map(icon => icon.src)).toEqual(['/icon-01-192.png', '/icon-01-512.png']);
  });
});
