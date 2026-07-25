import { useCallback, useEffect, useRef, useState } from 'react';
import {
  validateImageFile,
  type ImageFileError,
} from '../features/image/imageFile';

interface UseImageUploadReturn {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  pendingImage: string | null;
  clearPendingImage: () => void;
  isDragging: boolean;
  error: ImageFileError | null;
  loadFile: (file: File) => void;
  dragHandlers: {
    onDragOver: (event: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (event: React.DragEvent) => void;
  };
  onFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImageRef = useRef<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<ImageFileError | null>(null);

  const clearPendingImage = useCallback(() => {
    const currentUrl = pendingImageRef.current;
    pendingImageRef.current = null;
    setPendingImage(null);
    if (currentUrl) URL.revokeObjectURL(currentUrl);
  }, []);

  const loadFile = useCallback((file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    const previousUrl = pendingImageRef.current;
    pendingImageRef.current = nextUrl;
    setPendingImage(nextUrl);
    setError(null);
    if (previousUrl) URL.revokeObjectURL(previousUrl);
  }, []);

  useEffect(() => () => {
    const currentUrl = pendingImageRef.current;
    pendingImageRef.current = null;
    if (currentUrl) URL.revokeObjectURL(currentUrl);
  }, []);

  const dragHandlers = {
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(true);
    },
    onDragLeave: () => setIsDragging(false),
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) loadFile(file);
    },
  };

  const onFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) loadFile(file);
      event.target.value = '';
    },
    [loadFile],
  );

  return {
    fileInputRef,
    pendingImage,
    clearPendingImage,
    isDragging,
    error,
    loadFile,
    dragHandlers,
    onFileInputChange,
  };
}
