import { useTranslation } from 'react-i18next';
import type { EquipItem } from '../../types';
import { ItemIcon } from './ItemIcon';
import { findDye, getLocalizedDyeName } from '../../utils/dyes';
import { getLocalizedItemNames } from '../../utils/formatters';

interface CanvasItemRowProps {
    item: EquipItem;
    sizeMode?: 'comfortable' | 'balanced' | 'compact';
    showDivider?: boolean;
}

/**
 * CanvasItemRow — 캔버스 내 단일 아이템 행
 * Design: 3단 적층 구조 (메인명 / 서브명 / 염색 칩)
 * — 다국어 이름이 길어도 잘리지 않음, 염색 정보를 하단에 칩 형태로 배치
 */
export function CanvasItemRow({ item, sizeMode = 'compact', showDivider = true }: CanvasItemRowProps) {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    if (!item.name) return null;

    const { main, sub } = getLocalizedItemNames(item, lang);

    // 사이즈 모드별 스타일
    const sizes = {
        comfortable: { icon: 48, padding: '8px 0', gap: '14px', mainFont: '1.3rem',  subFont: '0.82rem', textGap: '3px' },
        balanced:    { icon: 42, padding: '6px 0', gap: '12px', mainFont: '1.15rem', subFont: '0.77rem', textGap: '2px' },
        compact:     { icon: 36, padding: '5px 0', gap: '10px', mainFont: '1.05rem', subFont: '0.73rem', textGap: '2px' },
    };
    const s = sizes[sizeMode];

    const activeDyes = [
        item.dye1 && findDye(item.dye1)?.name !== '기본색'
            ? { idx: 1, name: item.dye1 } : null,
        item.dye2 && findDye(item.dye2)?.name !== '기본색'
            ? { idx: 2, name: item.dye2 } : null,
    ].filter((d): d is { idx: number; name: string } => d !== null);

    return (
        <div data-canvas-row="equipment" style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: s.gap,
            padding: s.padding,
            borderBottom: showDivider ? '1px solid var(--card-divider)' : 'none',
        }}
        >
            {/* Icon */}
            <div style={{
                width: `${s.icon}px`,
                height: `${s.icon}px`,
                borderRadius: '2px',
                background: 'var(--card-chip-bg)',
                border: '1px solid var(--card-chip-border)',
                flexShrink: 0,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {(item.nameKo || item.iconPath || item.iconAssetKey) ? (
                    <ItemIcon
                        nameKo={item.nameKo || ''}
                        iconPath={item.iconPath || ''}
                        iconAssetKey={item.iconAssetKey}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span style={{
                        fontSize: '0.5rem',
                        opacity: 0.25,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        color: 'var(--card-text-primary)',
                    }}>
                        {t(`slots.${item.id as string}`).slice(0, 3)}
                    </span>
                )}
            </div>

            {/* 3단 텍스트 영역 */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: s.textGap }}>

                {/* 1단: 메인 아이템명 */}
                <span style={{
                    fontSize: s.mainFont,
                    fontWeight: 800,
                    color: 'var(--card-text-primary)',
                    lineHeight: 1.15,
                    letterSpacing: '-0.03em',
                    display: 'block',
                    wordBreak: 'keep-all',
                }}>
                    {main}
                </span>

                {/* 2단: 서브 아이템명 (다국어) */}
                {sub && (
                    <span style={{
                        fontSize: s.subFont,
                        fontWeight: 500,
                        color: 'var(--card-text-secondary)',
                        lineHeight: 1.2,
                        display: 'block',
                        letterSpacing: '-0.01em',
                        wordBreak: 'break-word',
                    }}>
                        {sub}
                    </span>
                )}

                {/* 3단: 염색 정보 칩 */}
                {activeDyes.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                        {activeDyes.map(({ idx, name }) => {
                            const dye = findDye(name);
                            const hex = dye?.hex ?? '#888888';
                            const dyeLabel = getLocalizedDyeName(dye, lang, name);

                            return (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: 'var(--card-chip-bg)',
                                    border: '1px solid var(--card-chip-border)',
                                    padding: '2px 8px 2px 5px',
                                    borderRadius: '2px',
                                }}>
                                    {/* 색상 스와치 */}
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        background: hex,
                                        borderRadius: '1px',
                                        border: '1px solid var(--card-chip-border)',
                                        flexShrink: 0,
                                    }} />
                                    {/* 염색명 */}
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: 'var(--card-text-secondary)',
                                        letterSpacing: '0.01em',
                                        lineHeight: 1,
                                    }}>
                                        {dyeLabel}
                                    </span>
                                    {/* DYE 번호 뱃지 */}
                                    <span style={{
                                        fontSize: '0.55rem',
                                        fontWeight: 500,
                                        color: 'var(--card-text-muted)',
                                        letterSpacing: '0.05em',
                                    }}>
                                        {idx}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
