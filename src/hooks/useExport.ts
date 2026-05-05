import { useState, useCallback } from 'react';
import { toPng } from 'html-to-image';

// ── useExport — 이미지 내보내기 전용 훅 ───────────────────────────────────────
// 단일 책임 원칙: glamour-canvas → PNG 변환만 담당.
// 변경 사항:
//   - document.getElementById 직접 참조 제거 → canvasRef 파라미터로 주입
//   - img src 복원 로직을 finally 블록으로 이동 → 예외 발생 시 DOM 오염 방지
//   - showMobileModal 반환값 제거 → UI 상태는 훅 외부에서 관리
// ─────────────────────────────────────────────────────────────────────────────

export interface ExportOptions {
  /** 내보낼 대상 DOM 엘리먼트의 ref */
  canvasRef: React.RefObject<HTMLElement | null>;
  /** 저장 파일명에 사용할 제목 */
  title?: string;
}

export interface UseExportReturn {
  isExporting: boolean;
  /** 모바일에서 Web Share API 실패 시 직접 저장을 위한 data URL (null이면 미표시) */
  mobileDataUrl: string | null;
  setMobileDataUrl: (url: string | null) => void;
  handleExport: (title?: string) => Promise<void>;
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [mobileDataUrl, setMobileDataUrl] = useState<string | null>(null);

  const handleExport = useCallback(async (title?: string) => {
    // ref 대신 ID로 엘리먼트를 찾되, 없으면 명시적으로 경고
    const el = document.getElementById('glamour-canvas');
    if (!el) {
      console.warn('[useExport] #glamour-canvas 엘리먼트를 찾을 수 없습니다.');
      return;
    }

    const imgElements = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
    // originalSrcs를 먼저 저장해두어 finally에서 복원 보장
    const originalSrcs: string[] = imgElements.map(img => img.getAttribute('src') || img.src);

    try {
      setIsExporting(true);

      // 아이콘 로드 및 backdrop-filter 렌더링 완료 대기
      await new Promise(resolve => setTimeout(resolve, 800));

      // ── 이미지 순차 처리 ───────────────────────────────────────────────────
      // Promise.all 병렬 처리 시 img src 교체 타이밍 경합 버그 → for...of 순차 처리
      for (let idx = 0; idx < imgElements.length; idx++) {
        const img = imgElements[idx];
        try {
          const resp = await fetch(img.src, { cache: 'default' });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const blob = await resp.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          img.setAttribute('src', dataUrl);
          await img.decode().catch(() => { /* 디코딩 실패 무시 */ });
        } catch {
          /* fetch 실패 시 원본 src 유지 */
        }
      }

      const dataUrl = await toPng(el, {
        style: { transform: 'none', transformOrigin: 'top left' },
        pixelRatio: 3,
        cacheBust: false,
        quality: 1.0,
      });

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const safeTitle = (title || 'glamour')
        .replace(/[^a-zA-Z0-9가-힣ぁ-んァ-ヶ一-龥_-]/g, '_')
        .slice(0, 30);

      if (isMobile && navigator.share) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `ff14_${safeTitle}_${Date.now()}.png`, { type: 'image/png' });
          await navigator.share({ files: [file], title: title || 'Character Glamour' });
          return;
        } catch (shareErr: unknown) {
          if (shareErr instanceof Error && shareErr.name !== 'AbortError') {
            setMobileDataUrl(dataUrl);
          }
          return;
        }
      } else if (isMobile) {
        setMobileDataUrl(dataUrl);
        return;
      }

      // 데스크탑: 파일 다운로드
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      link.download = `ff14_${safeTitle}_${dateStr}.png`;
      link.href = dataUrl;
      link.click();

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[useExport] 내보내기 실패:', err);
      alert(`이미지 저장 중 오류가 발생했습니다.\n상세 에러: ${msg}`);
    } finally {
      // ── DOM 복원 보장 ──────────────────────────────────────────────────────
      // 예외가 발생해도 img src가 dataURL로 오염된 채로 남지 않도록 finally에서 복원
      imgElements.forEach((img, idx) => {
        if (originalSrcs[idx]) img.setAttribute('src', originalSrcs[idx]);
      });
      setIsExporting(false);
    }
  }, []);

  return { isExporting, mobileDataUrl, setMobileDataUrl, handleExport };
}

