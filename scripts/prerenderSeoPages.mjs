import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const PRODUCTION_ORIGIN = 'https://ff14-glamour-maker.pages.dev';
const DEFAULT_OUTPUT_DIR = 'dist';

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function replaceMetaContent(document, attribute, key, content) {
  const pattern = new RegExp(
    `<meta\\s+${attribute}="${key}"\\s+content="[^"]*"\\s*\\/?>`,
    'i',
  );
  const replacement = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  if (!pattern.test(document)) {
    throw new Error(`Missing metadata element: ${attribute}=${key}`);
  }
  return document.replace(pattern, replacement);
}

export function renderRouteDocument(shell, page) {
  let document = shell.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(page.title)}</title>`,
  );

  document = replaceMetaContent(document, 'name', 'description', page.description);
  document = replaceMetaContent(document, 'name', 'robots', page.robots);
  document = replaceMetaContent(document, 'property', 'og:title', page.title);
  document = replaceMetaContent(document, 'property', 'og:description', page.description);
  document = replaceMetaContent(
    document,
    'property',
    'og:url',
    page.canonical ?? `${PRODUCTION_ORIGIN}${page.path}`,
  );
  document = replaceMetaContent(document, 'name', 'twitter:title', page.title);
  document = replaceMetaContent(document, 'name', 'twitter:description', page.description);

  const canonicalPattern = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
  document = page.canonical
    ? document.replace(
      canonicalPattern,
      `<link rel="canonical" href="${escapeHtml(page.canonical)}" />`,
    )
    : document.replace(canonicalPattern, '');

  const structuredDataPattern =
    /<script id="app-structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/i;
  document = page.structuredData
    ? document.replace(
      structuredDataPattern,
      `<script id="app-structured-data" type="application/ld+json">${JSON.stringify(page.structuredData)}</script>`,
    )
    : document.replace(structuredDataPattern, '');

  const prerenderedContent = [
    '<main id="prerendered-content" data-prerendered="true">',
    '<article>',
    `<h1>${escapeHtml(page.heading)}</h1>`,
    page.bodyHtml,
    '</article>',
    '</main>',
  ].join('');

  if (!document.includes('<div id="root"></div>')) {
    throw new Error('Missing root application shell');
  }

  return document.replace(
    '<div id="root"></div>',
    `<div id="root">${prerenderedContent}</div>`,
  );
}

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '투영 세트 메이커',
  description: '캐릭터 사진과 장비·염색 정보를 한 장의 투영 카드로 저장하는 파이널판타지14 웹 도구',
  url: `${PRODUCTION_ORIGIN}/`,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
  inLanguage: 'ko',
  image: `${PRODUCTION_ORIGIN}/og-image.png`,
};

export const prerenderPages = [
  {
    path: '/',
    output: 'index.html',
    title: '투영 세트 메이커 | 파이널판타지14 투영 카드 제작',
    description: '캐릭터 사진과 장비·염색 정보를 한 장의 투영 카드로 저장하는 파이널판타지14 웹 도구입니다.',
    canonical: `${PRODUCTION_ORIGIN}/`,
    robots: 'index, follow',
    heading: '파이널판타지14 투영 카드 제작 도구',
    bodyHtml: '<p>캐릭터 사진을 편집하고 부위별 장비와 염색 정보를 입력한 뒤 고해상도 PNG 카드로 저장할 수 있습니다.</p><p>사진 편집과 카드 생성은 사용자의 브라우저에서 처리되며, 선택한 사진은 서비스 서버에 업로드되지 않습니다.</p>',
    structuredData: homeStructuredData,
  },
  {
    path: '/guide',
    output: 'guide/index.html',
    title: '공식 사용 가이드 | 투영 세트 메이커',
    description: '사진 업로드부터 장비·염색 입력, 프리셋 관리, PNG 저장까지 투영 세트 메이커의 실제 사용 방법을 안내합니다.',
    canonical: `${PRODUCTION_ORIGIN}/guide`,
    robots: 'index, follow',
    heading: '투영 세트 메이커 공식 사용 가이드',
    bodyHtml: '<p>25MB 이하의 JPEG, PNG, WebP, AVIF 사진을 선택하고 자르기 화면에서 카드에 맞게 위치를 조정합니다.</p><p>부위별 장비와 염색, 카드 제목과 작성자 정보를 입력한 뒤 2배 또는 3배 해상도의 PNG 파일로 저장합니다. 프리셋은 사진을 제외한 카드 설정만 브라우저 로컬 저장소에 보관합니다.</p>',
    structuredData: null,
  },
  {
    path: '/about',
    output: 'about/index.html',
    title: '서비스 소개 및 운영 정보 | 투영 세트 메이커',
    description: '투영 세트 메이커의 제작 목적, 데이터 출처, 지원 범위, 운영자 연락처와 팬 프로젝트 고지를 확인합니다.',
    canonical: `${PRODUCTION_ORIGIN}/about`,
    robots: 'index, follow',
    heading: '투영 세트 메이커 소개',
    bodyHtml: '<p>파이널판타지14 캐릭터의 투영과 장비 정보를 한 장의 카드로 정리하는 비공식 브라우저 도구입니다.</p><p>아이템 이름과 아이콘 경로는 XIVAPI 기반 데이터를 사용합니다. 광고와 후원 링크는 관련 권리 조건을 확인하는 동안 중단되어 있습니다.</p>',
    structuredData: null,
  },
  {
    path: '/privacy',
    output: 'privacy/index.html',
    title: '개인정보처리방침 | 투영 세트 메이커',
    description: '사진의 브라우저 내 처리, 프리셋과 설정의 로컬 저장, 외부 서비스 사용 여부를 설명합니다.',
    canonical: `${PRODUCTION_ORIGIN}/privacy`,
    robots: 'index, follow',
    heading: '개인정보처리방침',
    bodyHtml: '<p>선택한 사진은 카드 생성을 위해 브라우저에서 처리되며 서비스 서버에 업로드되거나 영구 저장되지 않습니다. 프리셋, 테마, 언어 설정은 사용자의 브라우저 로컬 저장소에 보관됩니다.</p><p>광고 제공은 현재 중단되어 Google 광고 요청을 전송하지 않습니다. 재개 전에는 쿠키, IP 주소, 웹 비콘 등 광고 기술의 처리 목적과 사용자 선택 방법을 이 방침에 공개합니다.</p>',
    structuredData: null,
  },
  {
    path: '/terms',
    output: 'terms/index.html',
    title: '이용약관 | 투영 세트 메이커',
    description: '투영 세트 메이커의 제공 범위, 이용 책임, 지적재산권과 팬 프로젝트 운영 조건을 안내합니다.',
    canonical: `${PRODUCTION_ORIGIN}/terms`,
    robots: 'index, follow',
    heading: '이용약관',
    bodyHtml: '<p>이 약관은 투영 세트 메이커의 이용 조건과 서비스 제공 범위를 설명합니다. 이 서비스는 SQUARE ENIX의 공식 서비스가 아닌 비공식 도구입니다.</p><p>게임 관련 명칭과 이미지는 각 권리자의 이용 조건을 따라야 하며, 광고와 후원 링크는 관련 권리 조건을 확인하는 동안 중단되어 있습니다.</p>',
    structuredData: null,
  },
  {
    path: '/404',
    output: '404.html',
    title: '페이지를 찾을 수 없습니다 | 투영 세트 메이커',
    description: '요청한 페이지가 없거나 주소가 변경되었습니다.',
    canonical: null,
    robots: 'noindex, nofollow',
    heading: '페이지를 찾을 수 없습니다',
    bodyHtml: '<p>주소를 확인하거나 메인 화면으로 돌아가 주세요.</p><p><a href="/">메인으로 돌아가기</a></p>',
    structuredData: null,
  },
];

export async function prerenderSeoPages(outputDirectory = DEFAULT_OUTPUT_DIR) {
  const root = resolve(outputDirectory);
  const shell = await readFile(resolve(root, 'index.html'), 'utf8');

  for (const page of prerenderPages) {
    const outputPath = resolve(root, page.output);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, renderRouteDocument(shell, page), 'utf8');
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : '';

if (import.meta.url === invokedPath) {
  prerenderSeoPages(process.argv[2])
    .then(() => {
      console.log('SEO pages prerendered.');
    })
    .catch(error => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
