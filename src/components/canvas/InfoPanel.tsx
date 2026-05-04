import { Sparkles } from 'lucide-react';
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
 * PreviewCanvas에서 분리된 표현 컴포넌트
 */
export function InfoPanel({ state, bgSrc }: InfoPanelProps) {
    return (
        <div className="relative flex-1 h-full overflow-hidden flex flex-col">
            {/* 배경 블러 이미지 */}
            {bgSrc ? (
                <>
                    <img
                        src={bgSrc}
                        alt=""
                        aria-hidden
                        className="absolute inset-[-10%] w-[120%] h-[120%] object-cover blur-3xl saturate-150 opacity-55 pointer-events-none transform-gpu will-change-transform will-change-filter"
                    />
                    <div className="absolute inset-0 bg-[rgba(20,19,15,0.72)] z-[1]" />
                </>
            ) : (
                <div
                    className="absolute inset-0 z-[1]"
                    style={{
                        background: 'linear-gradient(160deg, rgba(38,37,30,0.0) 0%, rgba(38,37,30,0.15) 100%)'
                    }}
                />
            )}

            {/* 콘텐츠 */}
            <div className="relative z-10 flex flex-col h-full p-10">
                {/* 헤더 */}
                <div className="mb-6">
                    <h1 className="text-[2.2rem] font-bold text-white leading-[1.1] tracking-tight drop-shadow-lg">
                        {state.title || 'CHARACTER GLAMOUR'}
                    </h1>
                    {state.creator && (
                        <p className="text-[1rem] font-medium text-white/60 mt-2 flex items-center gap-2">
                            <span className="w-6 h-px bg-white/30" />
                            {state.creator}
                        </p>
                    )}
                </div>

                {/* 아이템 목록 */}
                <div className="flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
                    <div className="flex flex-col">
                        {SLOT_ORDER.map(id => (
                            <CanvasItemRow key={id} item={state.items[id]} />
                        ))}
                    </div>
                </div>

                {/* 푸터 */}
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-end">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[0.6rem] font-bold text-white/40 uppercase tracking-[0.15em]">
                            FFXIV GLAMOUR MAKER
                        </span>
                        <span className="text-[0.52rem] text-white/20 uppercase tracking-[0.1em] font-medium">
                            © SQUARE ENIX CO., LTD. ALL RIGHTS RESERVED.
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-60">
                        <Sparkles size={10} className="text-white" />
                        <span className="text-[0.6rem] font-bold text-white uppercase tracking-widest">
                            ff14-glamour.pages.dev
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
