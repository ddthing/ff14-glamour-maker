import { useEffect, useRef } from 'react';

/**
 * useUpdateCheck Hook
 * 백그라운드에서 주기적으로 서버의 version.json을 확인하여 새로운 배포 여부를 감시합니다.
 * 새 버전이 감지되면 사용자에게 알리거나 새로고침을 유도할 수 있습니다.
 */
export function useUpdateCheck() {
    const initialVersionRef = useRef<string | null>(null);
    const checkInterval = 1000 * 60 * 10; // 10분마다 확인

    useEffect(() => {
        // 처음 로드 시점의 버전을 기록
        const fetchCurrentVersion = async () => {
            try {
                // 캐시를 피하기 위해 timestamp 쿼리 파라미터 추가
                const res = await fetch(`/version.json?t=${Date.now()}`);
                if (!res.ok) return;
                const data = await res.json();
                initialVersionRef.current = data.version;
            } catch {
                // Ignore initial fetch error silently
            }
        };

        fetchCurrentVersion();

        // 주기적인 체크 타이머 설정
        const intervalId = setInterval(async () => {
            try {
                const res = await fetch(`/version.json?t=${Date.now()}`);
                if (!res.ok) return;
                const data = await res.json();
                
                if (initialVersionRef.current && data.version !== initialVersionRef.current) {
                    window.dispatchEvent(new CustomEvent('app-update-available', { detail: data }));
                }
            } catch {
                // Ignore background check errors silently
            }
        }, checkInterval);

        return () => clearInterval(intervalId);
    }, [checkInterval]);
}
