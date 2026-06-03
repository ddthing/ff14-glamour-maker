import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../../hooks/useDarkMode';
import { LanguageSelector } from './LanguageSelector';
import { Sun, Moon } from 'lucide-react';

/**
 * Header (Global Navigation Bar)
 * Design Reference: Cursor Warm Minimalism
 */
export function Header() {
    const { t } = useTranslation();
    const [isDark, toggleDark] = useDarkMode();

    return (
        <>
            <header
                aria-label="메인 내비게이션"
                className="w-full shrink-0 z-50 transition-all duration-300 bg-[var(--bg-app)]/85 backdrop-blur-xl sticky top-0"
            >

                <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between h-[64px] px-4 md:px-10">
                    {/* ── 로고 & 브랜드 ─── */}
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
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
                                {t('common.title_brand', '투영 세트 메이커')}
                            </span>
                            <span
                                translate="no"
                                className="text-[0.6rem] md:text-[0.65rem] font-semibold text-[var(--text-muted)] whitespace-nowrap tracking-[0.15em] uppercase mt-0.5"
                            >
                                FFXIV Glamour Set Maker
                            </span>
                        </div>
                    </div>

                    {/* ── 우측 버튼 그룹 ─── */}
                    <div className="flex items-center gap-1.5 md:gap-3">
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
