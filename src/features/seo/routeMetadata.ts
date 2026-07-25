export const PRODUCTION_ORIGIN = 'https://ff14-glamour-maker.pages.dev';

export const INDEXABLE_PATHS = [
  '/',
  '/guide',
  '/about',
  '/privacy',
  '/terms',
] as const;

export type IndexablePath = typeof INDEXABLE_PATHS[number];
export type PublicPath = IndexablePath | '/404';
export type SupportedLanguage = 'ko' | 'en' | 'ja';

interface LocalizedSearchCopy {
  title: string;
  description: string;
}

interface RouteDefinition {
  copy: Record<SupportedLanguage, LocalizedSearchCopy>;
  structuredDataType: 'WebApplication' | null;
}

export interface RouteMetadata extends LocalizedSearchCopy {
  path: PublicPath;
  canonical: string | null;
  robots: 'index, follow' | 'noindex, nofollow';
  structuredDataType: 'WebApplication' | null;
}

const ROUTES: Record<PublicPath, RouteDefinition> = {
  '/': {
    copy: {
      ko: {
        title: '투영 세트 메이커 | 파이널판타지14 투영 카드 제작',
        description: '캐릭터 사진과 장비·염색 정보를 한 장의 투영 카드로 저장하는 파이널판타지14 웹 도구입니다.',
      },
      en: {
        title: 'Glamour Set Maker | Final Fantasy XIV Outfit Cards',
        description: 'Create a Final Fantasy XIV glamour card from a character portrait, equipment, and dye details.',
      },
      ja: {
        title: 'ミラプリセットメーカー | ファイナルファンタジーXIV',
        description: 'キャラクター写真と装備・カララント情報を一枚のミラプリカードにまとめるウェブツールです。',
      },
    },
    structuredDataType: 'WebApplication',
  },
  '/guide': {
    copy: {
      ko: {
        title: '공식 사용 가이드 | 투영 세트 메이커',
        description: '사진 업로드부터 장비·염색 입력, 프리셋 관리, PNG 저장까지 투영 세트 메이커의 실제 사용 방법을 안내합니다.',
      },
      en: {
        title: 'Official User Guide | Glamour Set Maker',
        description: 'Learn how to upload a portrait, add equipment and dyes, manage presets, and export a glamour card.',
      },
      ja: {
        title: '公式の使い方ガイド | ミラプリセットメーカー',
        description: '写真のアップロード、装備・カララント入力、プリセット管理、画像保存の手順を案内します。',
      },
    },
    structuredDataType: null,
  },
  '/about': {
    copy: {
      ko: {
        title: '서비스 소개 및 운영 정보 | 투영 세트 메이커',
        description: '투영 세트 메이커의 제작 목적, 데이터 출처, 지원 범위, 운영자 연락처와 팬 프로젝트 고지를 확인합니다.',
      },
      en: {
        title: 'Service and Operations | Glamour Set Maker',
        description: 'Read about the maker, its data sources, supported scope, operator contact, and fan-project notice.',
      },
      ja: {
        title: 'サービス・運営情報 | ミラプリセットメーカー',
        description: 'サービスの目的、データ出典、対応範囲、運営者への連絡方法、ファンプロジェクト表記を案内します。',
      },
    },
    structuredDataType: null,
  },
  '/privacy': {
    copy: {
      ko: {
        title: '개인정보처리방침 | 투영 세트 메이커',
        description: '사진의 브라우저 내 처리, 프리셋과 설정의 로컬 저장, 외부 서비스 사용 여부를 설명합니다.',
      },
      en: {
        title: 'Privacy Policy | Glamour Set Maker',
        description: 'Learn how photos are processed in the browser, how presets are stored locally, and which external services are used.',
      },
      ja: {
        title: 'プライバシーポリシー | ミラプリセットメーカー',
        description: '写真のブラウザ内処理、プリセットのローカル保存、外部サービスの利用状況を説明します。',
      },
    },
    structuredDataType: null,
  },
  '/terms': {
    copy: {
      ko: {
        title: '이용약관 | 투영 세트 메이커',
        description: '투영 세트 메이커의 제공 범위, 이용 책임, 지적재산권과 팬 프로젝트 운영 조건을 안내합니다.',
      },
      en: {
        title: 'Terms of Service | Glamour Set Maker',
        description: 'Review the service scope, user responsibilities, intellectual property notice, and fan-project terms.',
      },
      ja: {
        title: '利用規約 | ミラプリセットメーカー',
        description: 'サービスの提供範囲、利用責任、知的財産権、ファンプロジェクトの運営条件を案内します。',
      },
    },
    structuredDataType: null,
  },
  '/404': {
    copy: {
      ko: {
        title: '페이지를 찾을 수 없습니다 | 투영 세트 메이커',
        description: '요청한 페이지가 없거나 이동되었습니다.',
      },
      en: {
        title: 'Page Not Found | Glamour Set Maker',
        description: 'The requested page does not exist or has moved.',
      },
      ja: {
        title: 'ページが見つかりません | ミラプリセットメーカー',
        description: '指定されたページは存在しないか、移動しました。',
      },
    },
    structuredDataType: null,
  },
};

const INDEXABLE_PATH_SET = new Set<string>(INDEXABLE_PATHS);

export function resolvePublicPath(pathname: string): PublicPath {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return INDEXABLE_PATH_SET.has(normalized) ? normalized as IndexablePath : '/404';
}

export function getRouteMetadata(
  path: PublicPath,
  language: SupportedLanguage,
): RouteMetadata {
  const definition = ROUTES[path];
  return {
    ...definition.copy[language],
    path,
    canonical: path === '/404'
      ? null
      : `${PRODUCTION_ORIGIN}${path === '/' ? '/' : path}`,
    robots: path === '/404' ? 'noindex, nofollow' : 'index, follow',
    structuredDataType: definition.structuredDataType,
  };
}
