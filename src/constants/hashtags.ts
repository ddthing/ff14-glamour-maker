const LOCAL_GLAMOUR_HASHTAGS = ['FF14', '파판룩템', 'ミラプリ'] as const;
const JAPANESE_GLAMOUR_HASHTAGS = [
  'FF14SS',
  'ミラプリスナップ',
  'ミラプリレシピ',
  'おしゃれ装備',
] as const;
const GLOBAL_GLAMOUR_HASHTAGS = [
  'FFXIV',
  'FFXIVGlamour',
  'FFXIVScreenshot',
  'GPOSERS',
  'FFXIVGpose',
  'EorzeaPhotos',
] as const;
const KOREAN_GLAMOUR_HASHTAGS = [
  '파판14',
  '파이널판타지14',
  '초코보룩템',
] as const;

export const COMMON_GLAMOUR_HASHTAGS = [
  ...LOCAL_GLAMOUR_HASHTAGS,
  ...JAPANESE_GLAMOUR_HASHTAGS,
  ...GLOBAL_GLAMOUR_HASHTAGS,
  ...KOREAN_GLAMOUR_HASHTAGS,
] as const;
