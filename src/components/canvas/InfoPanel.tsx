import { useTranslation } from 'react-i18next';
import type { AppState, EquipmentPart } from '../../types';
import { CanvasItemRow } from './CanvasItemRow';

interface InfoPanelProps {
    state: AppState;
    bgSrc: string | null;
}

const SLOT_ORDER: EquipmentPart[] = [
    'mainhand', 'head', 'body', 'hands', 'legs',
    'feet', 'ears', 'neck', 'wrists', 'rings', 'face',
];

/**
 * InfoPanel — 캔버스 우측 글래머 정보 패널 (600px)
 * Fix: 블러 이미지를 -25% / 150% / scale(1.1) 로 확장하여 우측 검은 여백 제거
 * Fix: 타이틀 폰트 2.2rem 으로 상향
 */
export function InfoPanel({ state, bgSrc }: InfoPanelProps) {
    const { t } = useTranslation();
    const filledItems = SLOT_ORDER.filter(id => !!state.items[id]?.name);

    return (
        <div className="relative flex-1 h-full overflow-hidden flex flex-col" style={{ background: '#1a1915' }}>

            {/* ── Background Layer ── */}
            {bgSrc ? (
                <>
                    {/*
                     * Blur 여백 완전 제거 전략:
                     * CSS filter:blur()는 img 엘리먼트 경계에서 투명해지는 특성이 있어
                     * img를 아무리 크게 해도 엣지는 투명해짐.
                     * 해결: wrapper div를 InfoPanel 밖으로 60px 확장 →
                     * img가 wrapper를 꽉 채움 → blur 투명 엣지는 wrapper 끝(=InfoPanel 밖)에 생성됨 →
                     * InfoPanel의 overflow:hidden이 그 부분을 잘라냄 → 안쪽엔 완전한 blur만 보임.
                     *)*/}
                    <div
                        aria-hidden
                        className="pointer-events-none"
                        style={{
                            position: 'absolute',
                            top: '-60px',
                            left: '-60px',
                            right: '-60px',
                            bottom: '-60px',
                            zIndex: 0,
                        }}
                    >
                        <img
                            src={bgSrc}
                            alt=""
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: 'blur(36px) saturate(1.8)',
                                opacity: 0.85,
                                willChange: 'transform',
                                transform: 'translateZ(0)',
                                display: 'block',
                            }}
                        />
                    </div>
                    {/* Radial overlay */}
                    <div className="absolute inset-0 z-[1]"
                        style={{
                            background: 'radial-gradient(circle at 45% 50%, rgba(14,13,10,0.18) 0%, rgba(14,13,10,0.6) 60%, rgba(14,13,10,0.88) 100%)'
                        }} />
                    {/* Noise grain */}
                    <div className="absolute inset-0 z-[2] opacity-[0.04] pointer-events-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                </>
            ) : (
                <div className="absolute inset-0 z-[1]"
                    style={{ background: 'linear-gradient(145deg, #1f1e18 0%, #171610 100%)' }} />
            )}

            {/* ── Content ── */}
            <div className="relative z-10 flex flex-col h-full" style={{ padding: '32px 40px 24px' }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: '24px' }}>
                    {/* Eyebrow label */}
                    <div style={{ marginBottom: '10px' }}>
                        <span style={{
                            fontSize: '0.575rem',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.25)',
                            display: 'block',
                        }}>
                            {t('common.canvas_label')}
                        </span>
                    </div>

                    {/* Title — 2.2rem (가독성 향상) */}
                    <h1 style={{
                        fontSize: '2.2rem',
                        fontWeight: 800,
                        lineHeight: 1.08,
                        letterSpacing: '-0.4px',
                        color: '#ffffff',
                        textShadow: '0 2px 20px rgba(0,0,0,0.4)',
                        wordBreak: 'break-word',
                    }}>
                        {state.title || (
                            <span style={{ color: 'rgba(255,255,255,0.18)' }}>—</span>
                        )}
                    </h1>

                    {/* Creator */}
                    {state.creator && (
                        <div style={{
                            marginTop: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <div style={{
                                width: '20px',
                                height: '1px',
                                background: 'rgba(255,255,255,0.2)',
                                flexShrink: 0,
                            }} />
                            <span style={{
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                color: 'rgba(255,255,255,0.45)',
                                letterSpacing: '0.02em',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {state.creator}
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Divider ── */}
                <div style={{
                    height: '1px',
                    background: 'rgba(255,255,255,0.07)',
                    marginBottom: '12px',
                    flexShrink: 0,
                }} />

                {/* ── Item List ── */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {filledItems.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                            {SLOT_ORDER.map(id => (
                                <CanvasItemRow key={id} item={state.items[id]} />
                            ))}
                        </div>
                    ) : (
                        /* Empty state */
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            height: '100%',
                            opacity: 0.2,
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '0px',
                                border: '1px solid rgba(255,255,255,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <span style={{ fontSize: '1rem' }}>✦</span>
                            </div>
                            <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white' }}>
                                {t('common.no_items')}
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Footer — Brand watermark ── */}
                <div style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    flexShrink: 0,
                }}>
                    {/* Left: Site Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color: 'rgba(255,255,255,0.45)',
                        }}>
                            {t('common.title_brand')}
                        </span>
                        <span style={{
                            fontSize: '0.55rem',
                            color: 'rgba(255,255,255,0.2)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontWeight: 600,
                        }}>
                            ff14-glamour.pages.dev
                        </span>
                    </div>

                    {/* Right: Credits */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-end' }}>
                        <span style={{
                            fontSize: '0.5rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'rgba(255,255,255,0.18)',
                        }}>
                            DESIGN & DEVELOPMENT:
                        </span>
                        <a
                            href="https://x.com/reconeur"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontSize: '0.6rem',
                                fontWeight: 800,
                                color: 'rgba(255,255,255,0.4)',
                                textDecoration: 'none',
                                letterSpacing: '0.05em',
                            }}
                        >
                            @RECONEUR
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
