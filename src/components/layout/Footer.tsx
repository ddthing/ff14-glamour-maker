export function Footer() {

    return (
        <footer className="w-full border-t border-[var(--border)] py-6 px-6 md:px-10 shrink-0 bg-[var(--bg-app)]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-end gap-6">

                {/* ── Left: Copyright & Brand ── */}
                <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
                    <div className="flex items-center gap-2 mb-1">
                        <img src="/favicon.svg" alt="" width="14" height="14" className="opacity-60 grayscale" />
                        <span className="text-[0.65rem] font-black tracking-widest text-[var(--text-primary)] uppercase">
                            FFXIV Glamour Maker
                        </span>
                    </div>
                    <p className="text-[0.6rem] text-[var(--text-muted)] font-medium">
                        FINAL FANTASY XIV © SQUARE ENIX CO., LTD. All Rights Reserved.
                    </p>
                    <p className="text-[0.55rem] text-[var(--text-secondary)] opacity-70">
                        본 웹사이트는 SQUARE ENIX와 공식적인 관련이 없는 비영리 팬 프로젝트입니다.
                    </p>
                </div>

                {/* ── Right: Links ── */}
                <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-5 gap-y-3 text-[0.65rem] font-semibold text-[var(--text-muted)]">
                    <a href="/terms" className="hover:text-[var(--text-primary)] transition-colors">이용약관</a>
                    <a href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">개인정보처리방침</a>
                    <a href="mailto:contact@example.com" className="hover:text-[var(--text-primary)] transition-colors">문의하기</a>

                    <span className="w-px h-3 bg-[var(--border)] hidden sm:block mx-1" />

                    <a href="https://ko-fi.com/reconeur" target="_blank" rel="noopener" className="hover:text-[var(--accent)] transition-colors uppercase tracking-wider text-[0.6rem] flex items-center gap-1">
                        <span className="text-[0.7rem] leading-none">☕</span> Support
                    </a>
                </div>
            </div>
        </footer>

    );
}
