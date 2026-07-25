import { describe, expect, it } from 'vitest';
import { prerenderPages, renderRouteDocument } from './prerenderSeoPages.mjs';

const shell = `<!doctype html>
<html lang="ko">
<head>
  <title>Home</title>
  <meta name="description" content="Home description" />
  <meta name="robots" content="index, follow" />
  <meta property="og:title" content="Home" />
  <meta property="og:description" content="Home description" />
  <meta property="og:url" content="https://example.com/" />
  <meta name="twitter:title" content="Home" />
  <meta name="twitter:description" content="Home description" />
  <link rel="canonical" href="https://example.com/" />
  <script id="app-structured-data" type="application/ld+json">{"@type":"WebApplication"}</script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>`;

describe('SEO page prerendering', () => {
  it('injects route metadata and crawlable body content', () => {
    const output = renderRouteDocument(shell, {
      path: '/guide',
      title: '공식 사용 가이드 | 투영 세트 메이커',
      description: '실제 사용 방법',
      canonical: 'https://ff14-glamour-maker.pages.dev/guide',
      robots: 'index, follow',
      heading: '투영 세트 메이커 사용 가이드',
      bodyHtml: '<p>사진 업로드 방법</p>',
      structuredData: null,
    });

    expect(output).toContain('<title>공식 사용 가이드 | 투영 세트 메이커</title>');
    expect(output).toContain('href="https://ff14-glamour-maker.pages.dev/guide"');
    expect(output).toContain('<h1>투영 세트 메이커 사용 가이드</h1>');
    expect(output).toContain('<p>사진 업로드 방법</p>');
    expect(output).not.toContain('id="app-structured-data"');
    expect(output).toContain('src="/assets/index.js"');
  });

  it('renders an unindexable document without a canonical for 404', () => {
    const output = renderRouteDocument(shell, {
      path: '/404',
      title: '페이지를 찾을 수 없습니다 | 투영 세트 메이커',
      description: '요청한 페이지가 없습니다.',
      canonical: null,
      robots: 'noindex, nofollow',
      heading: '페이지를 찾을 수 없습니다',
      bodyHtml: '<p>주소를 확인해 주세요.</p>',
      structuredData: null,
    });

    expect(output).toContain('content="noindex, nofollow"');
    expect(output).not.toContain('rel="canonical"');
  });

  it('publishes substantive guide content in the prerender contract', () => {
    const guide = prerenderPages.find((page) => page.path === '/guide');

    expect(guide.bodyHtml).toContain('25MB');
    expect(guide.bodyHtml).toContain('JPEG');
    expect(guide.bodyHtml).toContain('로컬 저장소');
  });
});
