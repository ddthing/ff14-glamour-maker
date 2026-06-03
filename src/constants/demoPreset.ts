import type { AppState } from '../types';

export const DEMO_PRESET: AppState = {
  imageSrc: '/og-image.png',
  croppedImageSrc: '/og-image.png',
  crop: { x: 0, y: 0 },
  zoom: 1,
  title: 'Nier Automata - 2B',
  creator: '@reconeur',
  items: {
    mainhand: { id: 'mainhand', label: '', name: 'Virtu Katana', nameKo: '버츄 카타나', nameEn: 'Virtu Katana', nameJa: 'ヴァーチュ・カタナ', dye1: 'Soot Black' },
    head: { id: 'head', label: '', name: 'No.2 Type B Goggles', nameKo: '2호 B형 고글', nameEn: 'No.2 Type B Goggles', nameJa: '二号B型ゴーグル' },
    body: { id: 'body', label: '', name: 'No.2 Type B Dress', nameKo: '2호 B형 의상', nameEn: 'No.2 Type B Dress', nameJa: '二号B型服' },
    hands: { id: 'hands', label: '', name: 'No.2 Type B Gloves', nameKo: '2호 B형 장갑', nameEn: 'No.2 Type B Gloves', nameJa: '二号B型手袋' },
    legs: { id: 'legs', label: '', name: 'No.2 Type B Tights', nameKo: '2호 B형 타이츠', nameEn: 'No.2 Type B Tights', nameJa: '二号B型タイツ' },
    feet: { id: 'feet', label: '', name: 'No.2 Type B Boots', nameKo: '2호 B형 장화', nameEn: 'No.2 Type B Boots', nameJa: '二号B型ブーツ' },
    ears: { id: 'ears', label: '', name: '' },
    neck: { id: 'neck', label: '', name: '' },
    wrists: { id: 'wrists', label: '', name: '' },
    rings: { id: 'rings', label: '', name: '' },
    rings2: { id: 'rings2', label: '', name: '' },
    face: { id: 'face', label: '', name: '' },
  }
};
