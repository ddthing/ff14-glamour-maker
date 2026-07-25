import { lazy, StrictMode, Suspense } from 'react'
import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'
import { installVitePreloadRecovery } from './features/runtime/vitePreloadRecovery'
import { resolvePublicPath } from './features/seo/routeMetadata'

const Terms = lazy(() => import('./pages/Terms.tsx').then(module => ({ default: module.Terms })))
const Privacy = lazy(() => import('./pages/Privacy.tsx').then(module => ({ default: module.Privacy })))
const Guide = lazy(() => import('./pages/Guide.tsx').then(module => ({ default: module.Guide })))
const About = lazy(() => import('./pages/About.tsx').then(module => ({ default: module.About })))
const NotFound = lazy(() => import('./pages/NotFound.tsx').then(module => ({ default: module.NotFound })))

function getSessionStorage(): Storage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

installVitePreloadRecovery({
  eventTarget: window,
  storage: getSessionStorage(),
  reload: () => window.location.reload(),
})

// 초경량 라우팅 시스템 (react-router 불필요)
const path = resolvePublicPath(window.location.pathname);
let Component: ComponentType = App;

if (path === '/terms') {
  Component = Terms;
} else if (path === '/privacy') {
  Component = Privacy;
} else if (path === '/guide') {
  Component = Guide;
} else if (path === '/about') {
  Component = About;
} else if (path === '/404') {
  Component = NotFound;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="min-h-[100dvh] bg-[var(--bg-app)]" aria-busy="true" />}>
      <Component />
    </Suspense>
  </StrictMode>,
)
