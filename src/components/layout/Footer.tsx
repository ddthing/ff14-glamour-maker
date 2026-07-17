import { useTranslation } from 'react-i18next';

/**
 * Footer — Minimal Legal Strip
 * Design: Apple Senior — max height 44px, single-row, zero visual weight.
 */
export function Footer() {
    const { t } = useTranslation();

    return (
        <footer
            className="w-full shrink-0"
            style={{
                borderTop: '1px solid rgba(38,37,30,0.08)',
                background: 'var(--bg-app)',
            }}
        >
            <div
                className="max-w-7xl mx-auto px-4 md:px-10 flex flex-row justify-between items-center"
                style={{ height: '44px' }}
            >
                {/* Left: Brand + Copyright */}
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <span
                        className="text-[0.6rem] font-bold tracking-[0.18em] uppercase shrink-0"
                        style={{ color: 'rgba(38,37,30,0.35)' }}
                    >
                        FFXIV Glamour Set Maker
                    </span>
                    <span style={{ color: 'rgba(38,37,30,0.15)', fontSize: '0.5rem' }}>·</span>
                    <span
                        className="text-[0.55rem] truncate"
                        style={{ color: 'rgba(38,37,30,0.25)' }}
                    >
                        © SQUARE ENIX. Fan Project
                    </span>
                </div>

                {/* Right: Links */}
                <div className="flex items-center gap-4 shrink-0">
                    {[
                        { href: '/guide', label: t('common.footer_guide') },
                        { href: '/faq', label: t('common.footer_faq') },
                        { href: '/about', label: t('common.footer_about') },
                        { href: '/terms', label: t('common.footer_terms') },
                        { href: '/privacy', label: t('common.footer_privacy') },
                    ].map(({ href, label }) => (
                        <a
                            key={href}
                            href={href}
                            className="text-[0.6rem] font-medium transition-colors"
                            style={{ color: 'rgba(38,37,30,0.3)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(38,37,30,0.65)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(38,37,30,0.3)')}
                        >
                            {label}
                        </a>
                    ))}
                    <span style={{ width: '1px', height: '10px', background: 'rgba(38,37,30,0.1)', display: 'inline-block' }} />
                    <a
                        href="https://ko-fi.com/reconeur"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.6rem] font-bold tracking-wider uppercase flex items-center gap-1 transition-colors"
                        style={{ color: 'rgba(38,37,30,0.3)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(38,37,30,0.7)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(38,37,30,0.3)')}
                    >
                        ☕ Support
                    </a>
                </div>
            </div>
        </footer>
    );
}
