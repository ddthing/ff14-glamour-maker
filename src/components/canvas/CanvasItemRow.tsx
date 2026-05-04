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
 * PreviewCanvas의 renderItem()에서 추출된 순수 표현 컴포넌트
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
        <div className="flex items-center gap-4 py-3.5 border-b border-white/10 last:border-0">
            {/* 아이콘 */}
            <div className="w-[58px] h-[58px] rounded-lg bg-white/10 border border-white/20 shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
                {(item.nameKo || item.iconPath) ? (
                    <ItemIcon
                        nameKo={item.nameKo || ''}
                        iconPath={item.iconPath || ''}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-[0.55rem] opacity-30 uppercase font-medium tracking-widest">
                        {t(`slots.${item.id as string}`).slice(0, 3)}
                    </span>
                )}
            </div>

            {/* 이름 */}
            <div className="flex-1 flex flex-col min-w-0">
                <span className="text-[1.2rem] font-extrabold text-white leading-tight tracking-tight truncate drop-shadow-sm">
                    {main}
                </span>
                {sub && (
                    <span className="text-[0.7rem] font-medium text-white/55 truncate mt-1">
                        {sub}
                    </span>
                )}
            </div>

            {/* 염색 */}
            {activeDyes.length > 0 && (
                <div className="flex flex-col gap-1 items-end shrink-0">
                    {activeDyes.map(({ idx, name }) => {
                        const dye = FF14_DYES.find(d => d.name === name);
                        const dyeName = lang.startsWith('ja') ? dye?.nameJa
                            : lang.startsWith('en') ? dye?.nameEn
                            : dye?.name;
                        return (
                            <div
                                key={idx}
                                className="flex items-center gap-1.5 bg-black/40 border border-white/15 rounded-full px-2.5 py-1 text-[0.65rem] text-white/80 font-medium"
                            >
                                <span className="opacity-40 tracking-wider">[{idx}]</span>
                                <span
                                    className="w-2.5 h-2.5 rounded-full border border-white/30"
                                    style={{ background: dye?.hex ?? '#888' }}
                                />
                                <span className="truncate max-w-[80px]">{dyeName}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
