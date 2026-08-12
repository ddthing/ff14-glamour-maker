import { useEffect, useRef, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

// ── AdBanner — Apple UX 원칙 ───────────────────────────────────────────────────
// · 광고는 사용자 흐름이 자연스럽게 끊기는 지점에만 배치합니다.
// · data-ad-client / data-ad-slot 값은 AdSense 대시보드에서 발급받은 값으로 교체하세요.
// ─────────────────────────────────────────────────────────────────────────────

interface AdBannerProps {
  slot: string;
  format?: string;
  className?: string;
  style?: CSSProperties;
}

function ensureAdSenseScript(): void {
  if (document.querySelector('script[data-adsense-loader]')) return;

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.dataset.adsenseLoader = 'true';
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2169729065542563';
  document.head.appendChild(script);
}

export function AdBanner({ slot, format = 'auto', className, style }: AdBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.split('-')[0] || i18n.language.split('-')[0];
  const fallbackLabel = language === 'ja' ? '広告領域' : language === 'en' ? 'Advertisement' : '광고 영역';

  useEffect(() => {
    ensureAdSenseScript();

    if (!pushed.current && ref.current) {
      pushed.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* AdSense 스크립트 로드 전 안전하게 무시 */
      }
    }
  }, []);

  return (
    <div ref={ref} className={`relative flex items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-200)] transition-[background-color,border-color,opacity] duration-300 ${className || ''}`} style={style} aria-label={fallbackLabel}>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--bg-app)] p-6 text-center">
        <span className="text-[0.7rem] font-medium tracking-[0.08em] text-[var(--text-muted)]">
          {fallbackLabel}
        </span>
      </div>

      <ins
        className="adsbygoogle relative z-10"
        style={{ display: 'block', width: '100%', height: '100%', minHeight: '90px' }}
        data-ad-client="ca-pub-2169729065542563"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );

}
