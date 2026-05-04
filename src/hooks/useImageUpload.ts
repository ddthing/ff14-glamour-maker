import { useRef, useState, useCallback } from 'react';

// ── useImageUpload — 파일 업로드 전용 훅 ─────────────────────────────────────
// R6: PreviewCanvas에서 파일 입력·드래그앤드롭·파일 읽기 로직을 분리합니다.
// 단일 책임 원칙: 이 훅은 오직 이미지 파일 → Data URL 변환만 담당합니다.
// ─────────────────────────────────────────────────────────────────────────────

interface UseImageUploadReturn {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  pendingImage: string | null;
  setPendingImage: (url: string | null) => void;
  isDragging: boolean;
  loadFile: (file: File) => void;
  dragHandlers: {
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
  };
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') setPendingImage(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    },
    onDragLeave: () => setIsDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
    },
  };

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) loadFile(e.target.files[0]);
      e.target.value = '';
    },
    [loadFile]
  );

  return {
    fileInputRef,
    pendingImage,
    setPendingImage,
    isDragging,
    loadFile,
    dragHandlers,
    onFileInputChange,
  };
}
