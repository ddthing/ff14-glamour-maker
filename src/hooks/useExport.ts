import { useState } from 'react';
import { toPng } from 'html-to-image';

// ── useExport — 이미지 내보내기 전용 훅 ───────────────────────────────────────
// ControlPanel에서 도메인 로직을 분리합니다.
// 단일 책임 원칙: 이 훅은 오직 glamour-canvas → PNG 변환만 담당합니다.
// ─────────────────────────────────────────────────────────────────────────────

interface UseExportReturn {
  isExporting: boolean;
  showMobileModal: string | null;
  setShowMobileModal: (url: string | null) => void;
  handleExport: (title?: string) => Promise<void>;
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState<string | null>(null);

  const handleExport = async (title?: string) => {
    const el = document.getElementById('glamour-canvas');
    if (!el) return;

    try {
      setIsExporting(true);

      // 아이콘 로드 및 backdrop-filter 렌더링 완료 대기
      await new Promise(resolve => setTimeout(resolve, 800));

      // ── 이미지 순차 처리 (병렬 처리 시 decode() 경합 버그 방지) ──────────────
      // [근본 문제] Promise.all 병렬 처리 시 img src 교체 타이밍 경합 →
      //            다른 img 엘리먼트의 dataURL이 잘못된 위치에 적용됨
      // [해결]     for...of 순차 처리 → 한 번에 한 이미지만 변환·decode·진행
      const imgElements = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
      const originalSrcs: string[] = [];

      for (let idx = 0; idx < imgElements.length; idx++) {
        const img = imgElements[idx];
        const src = img.src;
        originalSrcs[idx] = img.getAttribute('src') || src;
        try {
          const resp = await fetch(src, { cache: 'default' });
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
        pixelRatio: 3, // 3배수 렌더링 — 모바일 디스플레이에서도 선명한 고화질 출력
        cacheBust: false,
        quality: 1.0,
      });

      // 원래 src 속성으로 복원
      imgElements.forEach((img, idx) => {
        if (originalSrcs[idx]) img.setAttribute('src', originalSrcs[idx]);
      });

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile && navigator.share) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const safeTitle = (title || 'glamour').replace(/[^a-zA-Z0-9가-힣ぁ-んァ-ヶ一-龥_-]/g, '_').slice(0, 30);
          const file = new File([blob], `ff14_${safeTitle}_${Date.now()}.png`, { type: 'image/png' });
          await navigator.share({ files: [file], title: title || 'Character Glamour' });
          return;
        } catch (shareErr: unknown) {
          if (shareErr instanceof Error && shareErr.name !== 'AbortError') {
            setShowMobileModal(dataUrl);
          }
          return;
        }
      } else if (isMobile) {
        setShowMobileModal(dataUrl);
        return;
      }

      // 데스크탑: 파일 다운로드
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const safeTitle = (title || 'glamour').replace(/[^a-zA-Z0-9가-힣ぁ-んァ-ヶ一-龥_-]/g, '_').slice(0, 30);
      link.download = `ff14_${safeTitle}_${dateStr}.png`;
      link.href = dataUrl;
      link.click();

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Export failed:', err);
      alert(`이미지 저장 중 오류가 발생했습니다.\n상세 에러: ${msg}`);
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, showMobileModal, setShowMobileModal, handleExport };
}
