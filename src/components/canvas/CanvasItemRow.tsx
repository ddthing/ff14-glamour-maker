import { useTranslation } from 'react-i18next';
import { FF14_DYES } from '../../constants/dyes';
import type { EquipItem } from '../../types';
import { ItemIcon } from './ItemIcon';
import { getLocalizedItemNames } from '../../utils/formatters';

interface CanvasItemRowProps {
    item: EquipItem;
}

/**
 * CanvasItemRow — 캔버스 내 단일 아이템 행
 * Design: Apple Senior — 8px grid, refined type hierarchy, breathing room
 */
export function CanvasItemRow({ item }: CanvasItemRowProps) {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    if (!item.name) return null;

    const { main, sub } = getLocalizedItemNames(item, lang);

    const activeDyes = [
        item.dye1 && !['기본색', 'None', 'なし'].includes(item.dye1)
            ? { idx: 1, name: item.dye1 } : null,
        item.dye2 && !['기본색', 'None', 'なし'].includes(item.dye2)
            ? { idx: 2, name: item.dye2 } : null,
    ].filter((d): d is { idx: number; name: string } => d !== null);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '7px 0',
            borderBottom: '1px solid rgba(255,255,255,0.055)',
        }}
            className="last:border-0"
        >
            {/* Icon — 44px, minimal border */}
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '0px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                flexShrink: 0,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {(item.nameKo || item.iconPath) ? (
                    <ItemIcon
                        nameKo={item.nameKo || ''}
                        iconPath={item.iconPath || ''}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span style={{
                        fontSize: '0.5rem',
                        opacity: 0.25,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        color: 'white',
                    }}>
                        {t(`slots.${item.id as string}`).slice(0, 3)}
                    </span>
                )}
            </div>

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'rgba(255,255,255,0.92)',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                }}>
                    {main}
                </span>
                {sub && (
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.4)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        letterSpacing: '0.01em',
                    }}>
                        {sub}
                    </span>
                )}
            </div>

            {/* Dye swatches — visual color bars */}
            {activeDyes.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'stretch', flexShrink: 0 }}>
                    {activeDyes.map(({ idx, name }) => {
                        const dye = FF14_DYES.find(d => d.name === name);
                        const dyeKo = dye?.name || name;
                        const dyeEn = dye?.nameEn || '';
                        const dyeJa = dye?.nameJa || '';

                        let dyeMain: string;
                        let dyeSub: string;
                        if (lang.startsWith('en')) {
                            dyeMain = dyeEn || dyeKo;
                            dyeSub = [dyeKo, dyeJa].filter(Boolean).join(' / ');
                        } else if (lang.startsWith('ja')) {
                            dyeMain = dyeJa || dyeKo;
                            dyeSub = [dyeKo, dyeEn].filter(Boolean).join(' / ');
                        } else {
                            dyeMain = dyeKo;
                            dyeSub = [dyeEn, dyeJa].filter(Boolean).join(' / ');
                        }

                        const hex = dye?.hex ?? '#888888';

                        return (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    width: '56px',
                                    flexShrink: 0,
                                }}
                            >
                                {/* Color bar — prominent swatch */}
                                <div style={{
                                    height: '18px',
                                    background: hex,
                                    flexShrink: 0,
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingLeft: '4px',
                                }}>
                                    <span style={{
                                        fontSize: '0.45rem',
                                        fontWeight: 900,
                                        letterSpacing: '0.05em',
                                        color: 'rgba(255,255,255,0.7)',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                        textTransform: 'uppercase',
                                        mixBlendMode: 'overlay',
                                    }}>
                                        DYE {idx}
                                    </span>
                                </div>
                                {/* Name label */}
                                <div style={{
                                    background: 'rgba(0,0,0,0.45)',
                                    padding: '2px 4px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1px',
                                }}>
                                    <span style={{
                                        fontSize: '0.55rem',
                                        fontWeight: 700,
                                        color: 'rgba(255,255,255,0.8)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        lineHeight: 1.2,
                                    }}>
                                        {dyeMain}
                                    </span>
                                    {dyeSub && (
                                        <span style={{
                                            fontSize: '0.45rem',
                                            fontWeight: 400,
                                            color: 'rgba(255,255,255,0.35)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            lineHeight: 1.2,
                                        }}>
                                            {dyeSub}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
