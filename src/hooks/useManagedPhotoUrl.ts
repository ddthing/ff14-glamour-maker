import { useCallback, useEffect, useRef } from 'react';

export function useManagedPhotoUrl(
  currentUrl: string | null,
  setCurrentUrl: (url: string) => void,
): (blob: Blob) => void {
  const ownedUrlsRef = useRef(new Set<string>());

  const confirmPhoto = useCallback((blob: Blob) => {
    const nextUrl = URL.createObjectURL(blob);
    ownedUrlsRef.current.add(nextUrl);
    setCurrentUrl(nextUrl);
  }, [setCurrentUrl]);

  useEffect(() => {
    for (const ownedUrl of ownedUrlsRef.current) {
      if (ownedUrl === currentUrl) continue;
      URL.revokeObjectURL(ownedUrl);
      ownedUrlsRef.current.delete(ownedUrl);
    }
  }, [currentUrl]);

  useEffect(() => () => {
    for (const ownedUrl of ownedUrlsRef.current) {
      URL.revokeObjectURL(ownedUrl);
    }
    ownedUrlsRef.current.clear();
  }, []);

  return confirmPhoto;
}
