import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = resolve(import.meta.dirname, '..');
const distRoot = join(projectRoot, 'dist');
const ssrEntry = await import(pathToFileURL(join(projectRoot, 'dist-ssr', 'ssrEntry.js')).href);
const template = await readFile(join(distRoot, 'index.html'), 'utf8');
const origin = 'https://ff14-glamour.pages.dev';
const routes = ['/', '/guide', '/faq', '/about', '/terms', '/privacy'];

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function replaceMetaContent(html, attribute, key, value) {
  const pattern = new RegExp(`(<meta\\s+${attribute}="${key}"\\s+content=")[^"]*(")`, 'i');
  return html.replace(pattern, `$1${escapeHtml(value)}$2`);
}

function applyMetadata(html, metadata) {
  let result = html
    .replace(/<html lang="[^"]*">/i, `<html lang="${metadata.language}">`)
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.pageTitle)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/i, `$1${escapeHtml(metadata.canonicalUrl)}$2`)
    .replace(/(<link rel="manifest" href=")[^"]*(")/i, `$1${escapeHtml(metadata.manifestPath)}$2`);

  result = replaceMetaContent(result, 'name', 'description', metadata.description);
  result = replaceMetaContent(result, 'property', 'og:title', metadata.pageTitle);
  result = replaceMetaContent(result, 'property', 'og:description', metadata.description);
  result = replaceMetaContent(result, 'property', 'og:url', metadata.canonicalUrl);
  result = replaceMetaContent(result, 'property', 'og:locale', metadata.ogLocale);
  result = replaceMetaContent(result, 'name', 'twitter:title', metadata.pageTitle);
  result = replaceMetaContent(result, 'name', 'twitter:description', metadata.description);

  result = result.replace(/\s*<script id="page-structured-data"[\s\S]*?<\/script>/i, '');
  if (metadata.structuredData) {
    const json = JSON.stringify(metadata.structuredData).replaceAll('<', '\\u003c');
    result = result.replace('</head>', `<script id="page-structured-data" type="application/ld+json">${json}</script>\n</head>`);
  }

  return result;
}

for (const route of routes) {
  const markup = await ssrEntry.renderPage(route, 'ko');
  const metadata = ssrEntry.getPageMetadata(route, 'ko', origin);
  let html = applyMetadata(template, metadata);
  html = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
  html = html.replace(/\s*<noscript>[\s\S]*?<\/noscript>/i, '<noscript><p>이 페이지를 사용하려면 JavaScript를 활성화해 주세요.</p></noscript>');

  const outputDirectory = route === '/' ? distRoot : join(distRoot, route.slice(1));
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(join(outputDirectory, 'index.html'), html);
}

console.log(`Prerendered ${routes.length} public routes.`);
