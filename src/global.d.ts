/**
 * Global type declarations for third-party scripts
 * AdSense window.adsbygoogle 타입 안전성 확보
 */
interface Window {
  adsbygoogle: Record<string, unknown>[];
}
