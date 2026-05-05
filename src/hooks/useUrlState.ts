import { useEffect, useState, useRef } from 'react';
import type { AppState, EquipmentPart } from '../types';
import { INITIAL_STATE } from '../constants/initialState';

// ── URL Serializable State ───────────────────────────────────────────────────
// imageSrc / croppedImageSrc 는 base64 data URL (수백 KB) 이므로 URL에서 제외.
// URL에는 텍스트 메타데이터와 items 정보만 직렬화한다.
type SerializableState = Omit<AppState, 'imageSrc' | 'croppedImageSrc'>;

// ── Unicode-safe Base64 (TextEncoder 사용 — unescape/escape는 deprecated) ──
function encodeData(data: object): string {
    const json = JSON.stringify(data);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
}

function decodeData(encoded: string): unknown {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
}

// ── Type Guard ───────────────────────────────────────────────────────────────
// URL 파싱 결과는 unknown이므로 런타임에 형태를 검증한다.
function isPartialAppState(value: unknown): value is Partial<SerializableState> {
    return typeof value === 'object' && value !== null;
}

function mergeWithInitial(parsed: Partial<SerializableState>): AppState {
    const mergedItems = { ...INITIAL_STATE.items };
    if (parsed.items && typeof parsed.items === 'object') {
        (Object.keys(parsed.items) as EquipmentPart[]).forEach(key => {
            if (key in INITIAL_STATE.items) {
                mergedItems[key] = {
                    ...INITIAL_STATE.items[key],
                    ...parsed.items![key],
                };
            }
        });
    }
    // 이미지 필드는 URL에서 복원하지 않음 (data URL은 URL에 넣지 않는다)
    return {
        ...INITIAL_STATE,
        ...parsed,
        imageSrc: null,
        croppedImageSrc: null,
        items: mergedItems,
    };
}

export function useUrlState(): [AppState, React.Dispatch<React.SetStateAction<AppState>>] {
    const [state, setState] = useState<AppState>(() => {
        try {
            const hash = window.location.hash;
            if (hash && hash.startsWith('#data=')) {
                const encoded = hash.replace('#data=', '');
                const parsed = decodeData(encoded);
                if (isPartialAppState(parsed)) {
                    return mergeWithInitial(parsed);
                }
            }
        } catch (e) {
            console.error('[useUrlState] URL 파싱 실패 — 기본값으로 시작', e);
        }
        return INITIAL_STATE;
    });

    const isFirstMount = useRef(true);

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            try {
                // 이미지 필드 제외 후 직렬화 (URL 크기 폭발 방지)
                const { imageSrc: _img, croppedImageSrc: _crop, ...rest } = state;
                void _img; void _crop; // 명시적으로 미사용 처리

                // items에서 빈 문자열과 error 필드를 제거해 URL을 최소화
                const cleanItems = Object.fromEntries(
                    Object.entries(rest.items).map(([key, item]) => {
                        const cleanItem = Object.fromEntries(
                            Object.entries(item).filter(([prop, val]) =>
                                val !== '' && prop !== 'error'
                            )
                        );
                        return [key, cleanItem];
                    })
                );

                const serializable: SerializableState = { ...rest, items: cleanItems as AppState['items'] };
                const encoded = encodeData(serializable);
                window.history.replaceState(null, '', `#data=${encoded}`);
            } catch (e) {
                console.error('[useUrlState] URL 인코딩 실패', e);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [state]);

    return [state, setState];
}
