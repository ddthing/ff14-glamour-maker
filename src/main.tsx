import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'
import { Terms } from './pages/Terms.tsx'
import { Privacy } from './pages/Privacy.tsx'
import { Guide } from './pages/Guide.tsx'
import { Faq } from './pages/Faq.tsx'
import { About } from './pages/About.tsx'

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
let Component = App;

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
    <Component />
  </StrictMode>,
)
