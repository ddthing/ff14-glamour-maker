import { lazy, StrictMode, Suspense } from 'react'
import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'

const Terms = lazy(() => import('./pages/Terms.tsx').then(module => ({ default: module.Terms })))
const Privacy = lazy(() => import('./pages/Privacy.tsx').then(module => ({ default: module.Privacy })))
const Guide = lazy(() => import('./pages/Guide.tsx').then(module => ({ default: module.Guide })))
const Faq = lazy(() => import('./pages/Faq.tsx').then(module => ({ default: module.Faq })))
const About = lazy(() => import('./pages/About.tsx').then(module => ({ default: module.About })))

// ── 자동 업데이트 대응: 새 배포 시 이전 버전의 JS 청크 파일을 불러오지 못하는 경우(404) 처리 ──
window.addEventListener('error', (e) => {
  // 스크립트 로드 실패 등 리소스 에러 확인
  if (e.target instanceof HTMLScriptElement || (e.target as HTMLElement)?.tagName === 'LINK') {
    console.warn('[AutoUpdate] Resource load failed. Refreshing to pull latest version...');
    window.location.reload();
  }
}, true);

// 초경량 라우팅 시스템 (react-router 불필요)
const path = window.location.pathname;
let Component: ComponentType = App;

if (path === '/terms') {
  Component = Terms;
} else if (path === '/privacy') {
  Component = Privacy;
} else if (path === '/guide') {
  Component = Guide;
} else if (path === '/faq') {
  Component = Faq;
} else if (path === '/about') {
  Component = About;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="min-h-[100dvh] bg-[var(--bg-app)]" aria-busy="true" />}>
      <Component />
    </Suspense>
  </StrictMode>,
)
