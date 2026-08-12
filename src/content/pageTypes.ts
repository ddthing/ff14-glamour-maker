export type ContentPageKey = 'home' | 'guide' | 'faq' | 'about' | 'terms' | 'privacy';

export type InformationPageKey = Exclude<ContentPageKey, 'home'>;
