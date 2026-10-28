import { useRef, useState, useCallback, useEffect } from 'react';
import { isSupportedImageMimeType, normalizeImageDataUrl } from '../constants/imageFormats';

export const MAX_IMAGE_FILE_BYTES = 20 * 1024 * 1024;

export function isSupportedImageFile(file: File): boolean {
  return isSupportedImageMimeType(file.type) && file.size <= MAX_IMAGE_FILE_BYTES;
}

export type ImageUploadError = 'invalidType' | 'tooLarge' | 'readFailed';

// ── useImageUpload — 파일 업로드 전용 훅 ─────────────────────────────────────
// R6: PreviewCanvas에서 파일 입력·드래그앤드롭·파일 읽기 로직을 분리합니다.
// 단일 책임 원칙: 이 훅은 오직 이미지 파일 → Data URL 변환만 담당합니다.
// ─────────────────────────────────────────────────────────────────────────────

export interface UseImageUploadReturn {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  pendingImage: string | null;
  setPendingImage: (url: string | null) => void;
  error: ImageUploadError | null;
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
  const [error, setError] = useState<ImageUploadError | null>(null);
  const readerRef = useRef<FileReader | null>(null);
  const requestRef = useRef(0);

  useEffect(() => () => {
    requestRef.current += 1;
    readerRef.current?.abort();
    readerRef.current = null;
  }, []);

  const loadFile = useCallback((file: File) => {
    const requestId = ++requestRef.current;
    readerRef.current?.abort();
    readerRef.current = null;
    setError(null);

    if (!isSupportedImageMimeType(file.type)) {
      setError('invalidType');
      return;
    }
    if (file.size > MAX_IMAGE_FILE_BYTES) {
      setError('tooLarge');
      return;
    }

    const reader = new FileReader();
    readerRef.current = reader;
    reader.onload = () => {
      if (requestRef.current !== requestId) return;
      if (typeof reader.result === 'string') {
        setPendingImage(normalizeImageDataUrl(reader.result));
      } else {
        setError('readFailed');
      }
      readerRef.current = null;
    };
    reader.onerror = () => {
      if (requestRef.current !== requestId) return;
      setError('readFailed');
      readerRef.current = null;
    };
    reader.onabort = () => {
      if (requestRef.current === requestId) {
        setError('readFailed');
        readerRef.current = null;
      }
    };
    try {
      reader.readAsDataURL(file);
    } catch {
      if (requestRef.current === requestId) {
        setError('readFailed');
        readerRef.current = null;
      }
    }
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
    error,
    isDragging,
    loadFile,
    dragHandlers,
    onFileInputChange,
  };
}
