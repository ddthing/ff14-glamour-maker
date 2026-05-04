import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../../hooks/useDarkMode';
import { LanguageSelector } from './LanguageSelector';
import { ChangelogModal } from './ChangelogModal';
import { Sun, Moon, Sparkles } from 'lucide-react';
import updates from '../../data/updates.json';

/**
 * Header (Global Navigation Bar)
 * Design Reference: Cursor Warm Minimalism
 *
 * P2 UX 개선: 3초 자동 팝업(인터럽트) 제거 → 헤더 배지 클릭 방식으로 전환
 * - 유저가 먼저 앱을 경험한 뒤 스스로 변경사항 확인 가능
 * - 신규 업데이트가 있을 때만 오렌지 배지 표시
 */
export function Header() {
    const { t } = useTranslation();
    const [isDark, toggleDark] = useDarkMode();
    const [showChangelog, setShowChangelog] = useState(false);

    const latestVersion = (updates as { version: string }[])[0]?.version;
    const hideVersion = typeof window !== 'undefined'
        ? localStorage.getItem('hideChangelogVersion')
        : null;
    const hasNewUpdate = latestVersion && hideVersion !== latestVersion;

    return (
        <>
            <ChangelogModal
                isOpen={showChangelog}
                onClose={() => setShowChangelog(false)}
            />

            <header
                aria-label="메인 내비게이션"
                className="w-full shrink-0 z-50 transition-all duration-300 bg-[var(--bg-app)]/85 backdrop-blur-xl sticky top-0"
            >

                <div className="max-w-7xl mx-auto w-full flex items-center justify-between h-[64px] px-6 md:px-10">
                    {/* ── 로고 & 브랜드 ─── */}
                    <div className="flex items-center gap-3 min-w-0">
                        <img
                            src="/favicon.svg"
                            alt=""
                            aria-hidden="true"
                            width="32"
                            height="32"
                            className="w-8 h-8 shrink-0 object-contain"
                        />
                        <div className="flex flex-col min-w-0 justify-center">
                            <span
                                translate="no"
                                className="text-[1rem] md:text-[1.1rem] font-black tracking-tight text-[var(--text-primary)] whitespace-nowrap leading-none"
                            >
                                {t('common.title_brand', '투영 메이커')}
                            </span>
                            <span
                                translate="no"
                                className="text-[0.6rem] md:text-[0.65rem] font-semibold text-[var(--text-muted)] whitespace-nowrap tracking-[0.15em] uppercase mt-0.5"
                            >
                                FFXIV Glamour Maker
                            </span>
                        </div>
                    </div>

                    {/* ── 우측 버튼 그룹 ─── */}
                    <div className="flex items-center gap-1.5 md:gap-3">
                        {/* 업데이트 배지 — 신규 업데이트 있을 때만 표시 */}
                        {hasNewUpdate && (
                            <button
                                id="changelog-badge"
                                onClick={() => setShowChangelog(true)}
                                aria-label={t('common.update', '업데이트 확인')}
                                className="relative flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] bg-[var(--surface-300)] text-[var(--text-primary)] text-[0.65rem] md:text-[0.7rem] font-bold hover:text-[var(--error)] transition-colors border border-[var(--border)] group"
                            >
                                <Sparkles size={12} className="text-[var(--accent)] group-hover:scale-110 transition-transform" aria-hidden="true" />
                                <span>v{latestVersion}</span>
                                {/* 붉은 점 — 읽지 않음 표시 */}
                                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                            </button>
                        )}

                        <div className="flex items-center gap-1 md:gap-2">
                            {/* 언어 선택 */}
                            <LanguageSelector />

                            {/* 구분선 */}
                            <div
                                role="separator"
                                aria-hidden="true"
                                className="w-px h-3.5 bg-[var(--border)] mx-1"
                            />

                            {/* 다크모드 토글 */}
                            <button
                                id="dark-mode-toggle"
                                onClick={toggleDark}
                                aria-label={isDark
                                    ? t('common.to_light', '라이트 모드로 전환')
                                    : t('common.to_dark', '다크 모드로 전환')}
                                aria-pressed={isDark}
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent border-none text-[var(--text-secondary)] cursor-pointer transition-all hover:bg-[var(--surface-300)] hover:text-[var(--accent)] hover:rotate-12 touch-manipulation"
                            >
                                {isDark ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

        </>
    );
}
