import { useRef, useEffect } from 'react';

// ── AdBanner — Apple UX 원칙 ───────────────────────────────────────────────────
// · 광고는 사용자 흐름이 자연스럽게 끊기는 지점에만 배치합니다.
// · data-ad-client / data-ad-slot 값은 AdSense 대시보드에서 발급받은 값으로 교체하세요.
// ─────────────────────────────────────────────────────────────────────────────

interface AdBannerProps {
  slot: string;
  format?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function AdBanner({ slot, format = 'auto', className, style }: AdBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
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
    <div ref={ref} className={`relative flex items-center justify-center bg-[var(--surface-200)] border border-[var(--border)] rounded-xl overflow-hidden transition-all duration-300 ${className || ''}`} style={style} aria-label="광고">
      {/* Fallback UI (광고 미승인/차단 상태일 때 보임) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-auto bg-[var(--bg-app)]">
        <div className="flex flex-col items-center gap-3">
          <span className="text-[1.5rem]">☕</span>
          <span className="text-[0.7rem] font-bold tracking-widest uppercase text-[var(--text-secondary)] leading-relaxed">
            Support<br/>the Developer
          </span>
          <p className="text-[0.65rem] text-[var(--text-muted)] mt-1 mb-2 px-2">
            광고 차단기가 활성화되어 있습니다.<br/>개발자를 후원해 주시면 큰 힘이 됩니다!
          </p>
          <a
            href="https://ko-fi.com/reconeur"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-[var(--surface-300)] hover:bg-[var(--accent)] hover:text-white text-[var(--text-primary)] rounded-lg text-[0.7rem] font-bold tracking-wider transition-colors"
          >
            후원하기
          </a>
        </div>
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
