import { useCallback, useState } from 'react';
import { exportCanvasElement, type ExportStage } from '../features/export/exportCanvas';

export interface UseExportReturn {
  isExporting: boolean;
  stage: ExportStage | null;
  error: string | null;
  handleExport: (title?: string) => Promise<void>;
}

function safeFileTitle(title?: string): string {
  return (title?.trim() || 'glamour')
    .replace(/[^\p{L}\p{N}-]+/gu, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30) || 'glamour';
}

function downloadImage(dataUrl: string, title?: string): void {
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  link.download = `ff14_${safeFileTitle(title)}_${date}.png`;
  link.href = dataUrl;
  link.click();
}

async function shareImage(dataUrl: string, title?: string): Promise<boolean> {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile || !navigator.share) return false;

  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], `ff14_${safeFileTitle(title)}_${Date.now()}.png`, { type: 'image/png' });
  if (navigator.canShare && !navigator.canShare({ files: [file] })) return false;

  await navigator.share({ files: [file], title: title || 'Character Glamour' });
  return true;
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [stage, setStage] = useState<ExportStage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(async (title?: string) => {
    const element = document.getElementById('glamour-canvas');
    if (!element) {
      setError('canvas-not-found');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const dataUrl = await exportCanvasElement(element, { onStage: setStage });
      setStage('sharing');

      try {
        if (await shareImage(dataUrl, title)) return;
      } catch (shareError) {
        if (shareError instanceof Error && shareError.name === 'AbortError') return;
      }

      downloadImage(dataUrl, title);
    } catch (exportError) {
      console.error('[useExport] Export failed:', exportError);
      setError(exportError instanceof Error ? exportError.message : 'unknown-export-error');
    } finally {
      setIsExporting(false);
      setStage(null);
    }
  }, []);

  return { isExporting, stage, error, handleExport };
}
