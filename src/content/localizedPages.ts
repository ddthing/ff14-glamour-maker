import { useTranslation } from 'react-i18next';

export type SupportedLanguage = 'ko' | 'en' | 'ja';

interface PageMeta {
  title: string;
  description: string;
  eyebrow: string;
  lastUpdated: string;
  lastUpdatedIso: string;
}

interface TextLink {
  label: string;
  href: string;
}

interface TextSection {
  title: string;
  paragraphs: string[];
  links?: TextLink[];
}

export interface LocalizedPageContent {
  backHome: string;
  about: PageMeta & {
    sections: TextSection[];
    contactLabel: string;
    contactText: string;
  };
  faq: PageMeta & {
    entries: Array<{ question: string; answer: string }>;
  };
  guide: PageMeta & {
    intro: string[];
    howTitle: string;
    steps: Array<{ title: string; description: string }>;
    tipsTitle: string;
    tips: Array<{ title: string; description: string }>;
    checklistTitle: string;
    checklist: string[];
    faqTitle: string;
    entries: Array<{ question: string; answer: string }>;
    localNoteTitle: string;
    localNote: string;
  };
  terms: PageMeta & {
    effectiveDate: string;
    sections: TextSection[];
  };
  privacy: PageMeta & {
    effectiveDate: string;
    sections: TextSection[];
  };
}

const content: Record<SupportedLanguage, LocalizedPageContent> = {
  ko: {
    backHome: '메인으로 돌아가기',
    about: {
      title: '투영 세트 메이커 소개',
      description: '파이널판타지14 캐릭터 사진과 투영 장비를 한 장의 공유용 카드로 정리하는 브라우저 도구입니다.',
      eyebrow: '서비스 안내',
      lastUpdated: '2026년 8월 22일 업데이트',
      lastUpdatedIso: '2026-08-22',
      contactLabel: '문의 채널',
      contactText: '오류 제보, 데이터 누락, 사용성 제안은 개발자에게 보내 주세요. 확인 가능한 재현 방법과 사용 중인 언어를 함께 알려 주시면 도움이 됩니다.',
      sections: [
        {
          title: '무엇을 만드는 도구인가요?',
          paragraphs: [
            '투영 세트 메이커는 파이널판타지14 캐릭터 스크린샷과 투영 장비 정보를 하나의 카드 이미지로 정리하는 무료 웹 도구입니다. 사진을 올리고, 장비 부위별 아이템을 검색하고, 염색과 선택 장비를 함께 기록할 수 있습니다.',
            '주 무기와 보조무기는 따로 입력할 수 있으며, 패션 소품과 얼굴 소품은 필요한 경우에만 추가할 수 있습니다. 결과물은 장비 목록과 캐릭터 이미지가 함께 보이는 공유용 PNG 카드로 만들어집니다.',
          ],
        },
        {
          title: '이 도구가 제공하는 것',
          paragraphs: [
            '복잡한 이미지 편집 프로그램을 별도로 열지 않아도 사진을 자르고, 카드 안에서의 위치와 크기를 조정하고, 장비 정보를 정리할 수 있습니다. 사진의 주요 색상을 분석해 정보 패널에 반영하므로 밝은 사진과 어두운 사진 모두 원본 분위기를 유지하도록 설계했습니다.',
            '화면은 반응형으로 구성되어 데스크톱, 태블릿, 모바일에서 같은 흐름으로 사용할 수 있습니다. 저장 전 미리보기에서 제목, 제작자 표기, 장비 목록을 확인할 수 있습니다.',
          ],
        },
        {
          title: '데이터와 이미지 처리',
          paragraphs: [
            '업로드한 캐릭터 사진은 카드 생성을 위해 사용자의 브라우저에서 처리됩니다. 로그인이나 회원가입은 필요하지 않으며, 저장한 프리셋·테마·언어 설정은 사용자의 브라우저 저장소에 보관됩니다.',
            '장비 아이콘과 아이템 데이터는 서비스 화면에서 필요한 시점에 제공 경로를 통해 불러옵니다. 외부 제공자의 네트워크 요청과 처리 방식은 개인정보처리방침에서 확인할 수 있습니다.',
          ],
        },
        {
          title: '데이터 범위와 업데이트 방식',
          paragraphs: [
            '2026년 8월 22일 생성 데이터 기준으로 검색 카탈로그에는 장비·아이템 51,156개와 얼굴 소품 684개가 포함되어 있습니다. 한국어 이름은 51,128개, 영어와 일본어 이름은 각각 50,773개가 연결되어 있습니다.',
            '영어·일본어 원문이 확인되지 않는 한국 서버 전용 항목 383개는 이름을 추정해 번역하지 않고 한국어 상태로 남깁니다. 그중 확인된 6개 아이콘은 ID 기반 저장소 자산으로 관리해 이름이 비슷한 다른 아이템과 잘못 연결되지 않도록 했습니다.',
            '아이템 원천 CSV를 다시 병합할 때마다 번역 상태, 장비 부위, 로컬 아이콘 파일을 검증하고 lint·테스트·프로덕션 빌드를 통과한 데이터만 배포합니다. 패치에 따라 수치는 달라질 수 있으며, 누락은 문의 채널로 제보할 수 있습니다.',
          ],
          links: [
            { label: '한국어 데이터마이닝 저장소', href: 'https://github.com/Ra-Workspace/ffxiv-datamining-ko' },
            { label: 'XIVAPI 데이터마이닝 저장소', href: 'https://github.com/xivapi/ffxiv-datamining' },
          ],
        },
        {
          title: '팬 프로젝트 고지',
          paragraphs: [
            '이 웹사이트는 SQUARE ENIX CO., LTD.와 제휴하거나 공식적으로 승인받은 서비스가 아닌 비영리 팬 프로젝트입니다. FINAL FANTASY XIV, 게임 내 명칭, 이미지 및 관련 지식재산권은 각 권리자에게 귀속됩니다.',
            '이 서비스는 게임 저작물의 이용 권한을 새로 부여하지 않습니다. 생성한 카드와 게임 관련 자료를 공유하거나 사용할 때에는 SQUARE ENIX 및 각 권리자의 최신 이용 조건을 직접 확인해 주세요.',
          ],
        },
      ],
    },
    faq: {
      title: '자주 묻는 질문',
      description: '사진 업로드, 장비 검색, 선택 항목, 저장, 개인정보와 광고에 관한 질문을 한곳에서 확인하세요.',
      eyebrow: '도움말',
      lastUpdated: '2026년 8월 13일 업데이트',
      lastUpdatedIso: '2026-08-13',
      entries: [
        {
          question: '처음 사용할 때 어떤 순서로 진행하면 되나요?',
          answer: '가이드의 순서대로 사진을 업로드하고, 투영 세트명과 제작자 표기를 입력한 뒤, 장비 부위별 아이템을 검색하세요. 필요하면 염색·패션 소품을 추가하고 미리보기를 확인한 다음 이미지 저장을 누르면 됩니다.',
        },
        {
          question: '아이템 언어는 어떻게 바꾸나요?',
          answer: '오른쪽 위 언어 선택기에서 KR, EN, JA 중 원하는 언어를 선택하면 화면과 아이템 표시 언어가 함께 바뀝니다.',
        },
        {
          question: '주 무기와 보조무기는 따로 입력할 수 있나요?',
          answer: '네. 주 무기와 보조무기는 서로 다른 슬롯으로 표시됩니다. 방패나 보조 도구처럼 보조무기가 없는 직업은 해당 슬롯을 비워 둘 수 있습니다.',
        },
        {
          question: '패션 소품은 꼭 입력해야 하나요?',
          answer: '아니요. 패션 소품과 얼굴 소품은 선택 항목입니다. 필요한 경우 선택 항목 영역을 펼쳐 검색하고, 사용하지 않으면 접어 둔 상태로 둘 수 있습니다.',
        },
        {
          question: '사진이나 프리셋이 서버에 저장되나요?',
          answer: '업로드한 사진은 카드 생성을 위해 브라우저에서 처리되며 서비스 계정이나 서버 갤러리에 저장되지 않습니다. 프리셋과 테마·언어 설정은 현재 기기의 브라우저 저장소에 남으므로 브라우저 사이트 데이터를 삭제하면 함께 사라질 수 있습니다.',
        },
        {
          question: '모바일에서 저장한 이미지가 흐리게 보입니다.',
          answer: '카드는 고해상도로 생성되지만 일부 메신저와 SNS가 업로드 과정에서 이미지를 압축합니다. 먼저 기기에 원본 PNG를 저장한 뒤 공유해 주세요.',
        },
        {
          question: '광고 쿠키나 개인정보 처리 방식은 어디서 확인하나요?',
          answer: '개인정보처리방침에서 Google AdSense 광고 쿠키, 개인 맞춤 광고 선택, 외부 아이콘·폰트 제공자, 브라우저에 저장되는 데이터의 범위를 설명합니다.',
        },
        {
          question: '검색 결과에 원하는 아이템이 없어요.',
          answer: '아이템 이름의 일부만 입력하거나 다른 언어의 이름으로 검색해 보세요. 그래도 누락된 아이템이 있으면 문의 채널로 아이템명과 부위를 알려 주세요.',
        },
      ],
    },
    guide: {
      title: '투영 세트 메이커 사용 가이드',
      description: '캐릭터 사진에서 완성된 투영 카드까지, 처음 사용하는 사람도 따라 할 수 있는 5단계 안내입니다.',
      eyebrow: '시작하기',
      lastUpdated: '2026년 8월 22일 업데이트',
      lastUpdatedIso: '2026-08-22',
      intro: [
        '투영 세트 메이커는 캐릭터 스크린샷, 장비 이름, 염색 정보를 한 장의 읽기 쉬운 카드로 정리합니다. 아래 순서대로 진행하면 필수 항목과 선택 항목을 헷갈리지 않고 완성할 수 있습니다.',
        '사진과 프리셋은 브라우저 중심으로 처리되며, 완성한 결과는 고화질 PNG 파일로 사용자의 기기에 저장됩니다.',
      ],
      howTitle: '5단계로 카드 만들기',
      steps: [
        { title: '사진 업로드와 자르기', description: '사진 첨부 영역을 누르거나 파일을 끌어 놓습니다. 편집 화면에서 캐릭터가 잘 보이도록 위치와 확대 비율을 조정한 뒤 적용하세요.' },
        { title: '투영 정보 입력', description: '투영 세트명과 제작자 표기를 입력합니다. 세트명은 선택 항목이므로 비워도 카드 생성 흐름을 진행할 수 있습니다.' },
        { title: '장비 부위 채우기', description: '주 무기·보조무기부터 머리, 몸통, 손, 다리, 발, 귀걸이, 목걸이, 팔찌, 반지까지 필요한 부위를 검색합니다. 같은 부위의 두 반지는 각각 입력할 수 있습니다.' },
        { title: '선택 항목 다듬기', description: '염색, 패션 소품, 얼굴 소품은 필요할 때만 추가합니다. 패션 소품 영역은 접어 두었다가 사용할 때 펼칠 수 있어 필수 장비 입력을 방해하지 않습니다.' },
        { title: '미리보기 확인 후 저장', description: '사진 색상을 반영한 정보 패널과 장비 목록을 확인하고 이미지 저장을 누릅니다. 모바일에서는 저장이 끝날 때까지 화면을 닫지 말고 원본 PNG를 기기에 보관하세요.' },
      ],
      tipsTitle: '더 좋은 카드를 위한 팁',
      tips: [
        { title: '사진 비율', description: '캐릭터가 화면 중앙에 있고 얼굴과 의상이 충분히 보이는 세로 스크린샷을 사용하면 자르기 작업이 쉽습니다.' },
        { title: '조명과 배경', description: '밝고 대비가 있는 조명은 캐릭터를 또렷하게 합니다. 배경이 너무 복잡하면 정보 패널의 가독성이 떨어질 수 있습니다.' },
        { title: '이름과 염색', description: '아이템 이름과 염색을 한 번 더 확인하면 다른 플레이어가 세트를 재현하기 쉬워집니다.' },
        { title: '모바일 저장', description: '메신저로 바로 공유하기보다 먼저 원본 PNG를 저장하세요. 서비스 밖에서 발생하는 이미지 압축은 카드 품질을 바꿀 수 있습니다.' },
      ],
      checklistTitle: '저장 전 확인할 것',
      checklist: [
        '사진에서 얼굴과 의상이 잘 보이는지 확인하기',
        '카드에 남길 장비 부위와 염색 입력하기',
        '세트명과 제작자 표기 다시 확인하기',
        '원본 PNG를 저장한 뒤 SNS에 업로드하기',
        '필요하면 해시태그 도구에서 게시글용 태그 복사하기',
      ],
      faqTitle: '가이드 질문',
      entries: [
        { question: '모든 장비를 입력해야 하나요?', answer: '아니요. 카드에 보여 주고 싶은 부위만 입력해도 됩니다. 다만 다른 사람이 세트를 재현하기를 원한다면 주요 장비와 염색 정보를 함께 적는 것이 좋습니다.' },
        { question: '투영 세트명은 꼭 입력해야 하나요?', answer: '아니요. 세트명은 선택 항목입니다. 이름이 없으면 카드의 제목 영역을 비워 둔 채 장비 정보만 저장할 수 있습니다.' },
        { question: '사용한 사진과 프리셋을 다른 기기에서도 볼 수 있나요?', answer: '현재 저장은 브라우저와 기기 단위입니다. 계정 동기화 기능이 아니므로 다른 기기에서 같은 사진이나 프리셋을 자동으로 불러오지는 않습니다.' },
        { question: '무료로 사용할 수 있나요?', answer: '네. 서비스 사용 자체에는 별도 결제가 필요하지 않습니다. 광고가 표시될 수 있으며 광고와 쿠키 처리 방식은 개인정보처리방침에 안내합니다.' },
      ],
      localNoteTitle: '브라우저에서 처리되는 항목',
      localNote: '사진은 카드 생성을 위해 브라우저 메모리에서 처리되고, 프리셋·테마·언어 설정은 현재 기기의 저장소에 기록됩니다. 사이트 데이터를 삭제하면 저장한 프리셋이 사라질 수 있으니 필요한 카드는 PNG로 먼저 보관하세요.',
    },
    terms: {
      title: '이용약관',
      description: '투영 세트 메이커의 이용 범위, 사용자 콘텐츠, 지식재산권, 외부 서비스와 책임 범위를 안내합니다.',
      eyebrow: '정책 문서',
      lastUpdated: '2026년 8월 13일 업데이트',
      lastUpdatedIso: '2026-08-13',
      effectiveDate: '시행일: 2026년 5월 5일',
      sections: [
        { title: '1. 약관의 적용', paragraphs: ['투영 세트 메이커에 접속하거나 기능을 사용하면 본 약관과 개인정보처리방침을 읽고 이해한 것으로 봅니다. 약관에 동의하지 않는 경우 서비스를 사용하지 않아야 합니다.'] },
        { title: '2. 서비스의 성격과 제공 범위', paragraphs: ['본 서비스는 파이널판타지14 플레이어가 자신의 캐릭터 사진과 투영 장비 정보를 카드 이미지로 정리하도록 돕는 비영리 팬 프로젝트입니다. 로그인, 계정 동기화, 온라인 갤러리 또는 장기 보관을 제공하지 않습니다.'] },
        { title: '3. 사용자 콘텐츠', paragraphs: ['사용자는 업로드하는 사진과 입력하는 텍스트를 사용할 권리와 필요한 동의를 보유해야 합니다. 타인의 개인정보, 권리를 침해하는 이미지, 불법적인 콘텐츠 또는 서비스 운영을 방해하는 파일을 업로드해서는 안 됩니다.'] },
        { title: '4. 지식재산권과 팬 프로젝트 고지', paragraphs: ['FINAL FANTASY XIV, 게임 이미지, 아이템 명칭과 데이터의 권리는 각 권리자에게 귀속됩니다. 본 서비스는 게임 저작물의 이용 권한을 부여하지 않으며, 생성한 카드의 공유·사용은 SQUARE ENIX 및 각 권리자의 최신 이용 조건을 따라야 합니다.'] },
        { title: '5. 허용되지 않는 이용', paragraphs: ['서비스의 취약점을 악용하거나, 자동화된 대량 요청으로 데이터를 수집하거나, 광고 클릭·노출을 조작하거나, 다른 이용자에게 피해를 주는 방식으로 서비스를 사용해서는 안 됩니다.'] },
        { title: '6. 외부 서비스와 링크', paragraphs: ['장비 아이콘, 아이템 데이터, 글꼴, 광고 등 일부 기능은 외부 제공자와 연결될 수 있습니다. 외부 서비스의 가용성·정확성·정책은 해당 제공자가 책임지며, 사용자는 각 제공자의 약관과 개인정보처리방침을 확인해야 합니다.'] },
        { title: '7. 변경과 중단', paragraphs: ['기능, 디자인, 데이터 범위와 운영 방식을 개선 또는 유지하기 위해 변경할 수 있습니다. 개인 프로젝트의 특성상 서비스의 일부 또는 전부가 사전 안내 없이 일시 중단되거나 종료될 수 있습니다.'] },
        { title: '8. 면책과 문의', paragraphs: ['서비스는 현재 상태로 제공됩니다. 법이 허용하는 범위에서 서비스 이용으로 인한 데이터 유실, 외부 서비스 장애 또는 간접 손해를 보증하지 않습니다. 중요한 결과물은 사용자의 기기에 별도로 보관하세요.'] },
      ],
    },
    privacy: {
      title: '개인정보처리방침',
      description: '브라우저 저장 데이터, 업로드 이미지, Google AdSense 광고 쿠키와 외부 제공자 처리 범위를 설명합니다.',
      eyebrow: '정책 문서',
      lastUpdated: '2026년 8월 13일 업데이트',
      lastUpdatedIso: '2026-08-13',
      effectiveDate: '시행일: 2026년 5월 5일',
      sections: [
        { title: '1. 적용 범위와 운영자', paragraphs: ['본 방침은 투영 세트 메이커 웹사이트와 그 안에서 제공되는 사진 편집·장비 검색·카드 저장 기능에 적용됩니다. 문의는 소개 페이지에 연결된 개발자 채널로 받을 수 있습니다.'] },
        { title: '2. 직접 수집하지 않는 개인정보', paragraphs: ['회원가입을 요구하지 않으며 이름, 이메일 주소, 전화번호, 비밀번호와 같은 계정 정보를 서비스가 직접 수집하지 않습니다. 사진 속 인물이나 입력한 제작자 표기는 사용자가 카드에 표시하기 위해 직접 입력하는 콘텐츠이며, 서비스가 별도 회원 프로필로 등록하지 않습니다.'] },
        { title: '3. 브라우저에 저장되는 정보', paragraphs: ['테마와 언어 선택, 사용자가 저장한 프리셋은 현재 기기의 브라우저 저장소에 보관됩니다. 브라우저 환경에 따라 언어 감지 정보가 저장될 수 있습니다. 이 정보는 로그인 계정과 연결되지 않습니다.'] },
        { title: '4. 업로드 사진과 생성 이미지', paragraphs: ['업로드한 사진과 자르기 결과는 카드 생성 과정에서 브라우저 메모리로 처리됩니다. 서비스가 사진을 서버 갤러리나 계정 저장소에 영구 보관하지 않지만, 사용자의 브라우저·운영체제·네트워크 환경과 외부 아이콘 요청은 별도의 기술 로그를 남길 수 있습니다.'] },
        { title: '5. 외부 제공자와 네트워크 요청', paragraphs: ['장비 아이콘과 관련 데이터는 XIVAPI 프록시 또는 Cloudinary 경로에서 제공될 수 있고, 글꼴은 jsDelivr에서 제공됩니다. 광고 태그를 사용하는 페이지에서는 Google AdSense와 Google의 광고 기술 제공자가 요청·쿠키·기기 정보를 처리할 수 있습니다. 각 제공자의 처리 방식과 보관 기간은 해당 제공자의 정책이 적용됩니다.'], links: [
          { label: 'Google 개인정보처리방침', href: 'https://policies.google.com/privacy' },
          { label: 'Cloudinary 개인정보처리방침', href: 'https://cloudinary.com/privacy' },
          { label: 'jsDelivr 안내', href: 'https://www.jsdelivr.com/about' },
        ] },
        { title: '6. Google AdSense 광고 쿠키와 선택', paragraphs: ['Google 및 제3자 광고 제공자는 사용자의 이전 방문을 바탕으로 광고를 제공하기 위해 쿠키 또는 유사 기술을 사용할 수 있습니다. Google 광고 쿠키와 개인 맞춤 광고에 관한 자세한 내용은 Google의 안내를 확인해 주세요. 사용자는 Google 광고 설정에서 개인 맞춤 광고 선택을 변경할 수 있습니다.'], links: [
          { label: 'Google AdSense 필수 콘텐츠 안내', href: 'https://support.google.com/adsense/answer/1348695' },
          { label: 'Google 광고 설정', href: 'https://adssettings.google.com/' },
        ] },
        { title: '7. 지역별 동의와 광고 제공', paragraphs: ['유럽경제지역(EEA), 영국, 스위스 이용자에게 개인 맞춤 광고를 제공하는 경우 Google의 최신 EU 사용자 동의 정책과 인증된 동의 관리 플랫폼(CMP) 요구사항이 적용될 수 있습니다. 광고를 제공하는 계정 설정과 지역별 법률에 맞는 동의 절차를 확인한 뒤 운영합니다.'] },
        { title: '8. 삭제와 보관', paragraphs: ['브라우저의 사이트 데이터와 저장소를 삭제하면 기기에 저장된 프리셋·테마·언어 설정을 지울 수 있습니다. 외부 제공자가 광고·콘텐츠 요청 과정에서 생성하는 기술 로그와 쿠키의 보관·삭제는 각 제공자의 정책과 사용자의 브라우저 설정에 따릅니다.'] },
        { title: '9. 방침 변경과 문의', paragraphs: ['서비스 기능, 광고 제공 방식 또는 관련 법률이 바뀌면 이 방침을 업데이트하고 페이지의 업데이트 날짜를 변경합니다. 개인정보 처리에 관한 문의나 삭제 요청은 소개 페이지의 개발자 연락처로 보내 주세요.'] },
      ],
    },
  },
  en: {
    backHome: 'Back to maker',
    about: {
      title: 'About Glamour Set Maker',
      description: 'A browser tool for turning a Final Fantasy XIV character screenshot and glamour gear into one shareable card.',
      eyebrow: 'ABOUT THE MAKER',
      lastUpdated: 'Updated August 22, 2026',
      lastUpdatedIso: '2026-08-22',
      contactLabel: 'Contact',
      contactText: 'Send bug reports, missing-item reports, and product suggestions to the developer. Include the steps to reproduce an issue and the language you were using.',
      sections: [
        {
          title: 'What this tool does',
          paragraphs: [
            'Glamour Set Maker turns a Final Fantasy XIV character screenshot and equipment details into a single, readable glamour card. You can upload a photo, crop it, search gear by slot, add dye information, and export the result as a PNG.',
            'Main-hand and off-hand weapons are separate slots. Fashion accessories and face accessories are optional, so they can be added only when they are part of the look.',
          ],
        },
        {
          title: 'Why it is useful',
          paragraphs: [
            'The workflow is designed for players who want a clean, repeatable way to document a glamour set without opening a separate image editor. The card preview adapts its information panel to the main colors of the uploaded photo so both bright and dark screenshots remain coherent.',
            'The interface is responsive and follows the same order on desktop, tablet, and mobile: attach a photo, enter the set information, add equipment, review the preview, and save the image.',
          ],
        },
        {
          title: 'Data and image handling',
          paragraphs: [
            'Uploaded character photos are processed in the browser for card generation. The site does not require an account, and saved presets, theme, and language preferences remain in the browser storage on the current device.',
            'Item data and icons may be requested through external asset providers when the interface needs them. The privacy policy explains those network requests and the advertising providers used by the site.',
          ],
        },
        {
          title: 'Data coverage and update process',
          paragraphs: [
            'The generated catalog on August 22, 2026 contains 51,156 equipment and item records plus 684 face-accessory records. Korean names are available for 51,128 records, while English and Japanese names are each available for 50,773 records.',
            'The 383 Korean-server-only records without verified English or Japanese source names stay marked as Korean instead of receiving guessed translations. Six confirmed regional icons are kept as ID-based repository assets so similarly named items are not matched by guesswork.',
            'Each source-data refresh merges the item CSVs and checks translation status, equipment slots, and local icon files before lint, tests, and the production build run. Counts can change with a patch; missing items can be reported through the contact channel.',
          ],
          links: [
            { label: 'Korean data-mining repository', href: 'https://github.com/Ra-Workspace/ffxiv-datamining-ko' },
            { label: 'XIVAPI data-mining repository', href: 'https://github.com/xivapi/ffxiv-datamining' },
          ],
        },
        {
          title: 'Fan-project notice',
          paragraphs: [
            'This website is a non-commercial fan project and is not affiliated with or endorsed by SQUARE ENIX CO., LTD. FINAL FANTASY XIV, in-game names, images, and related intellectual property belong to their respective owners.',
            'This service does not grant rights to use game materials. Check the current SQUARE ENIX and rights-holder usage terms before sharing or using generated cards outside the service.',
          ],
        },
      ],
    },
    faq: {
      title: 'Frequently asked questions',
      description: 'Answers about uploading photos, entering gear, optional items, saving cards, privacy, and advertising.',
      eyebrow: 'HELP CENTER',
      lastUpdated: 'Updated August 13, 2026',
      lastUpdatedIso: '2026-08-13',
      entries: [
        {
          question: 'What is the recommended order for a first card?',
          answer: 'Follow the guide: upload and crop a photo, enter the set name and creator line, search for equipment by slot, add dyes or optional accessories when needed, review the preview, and save the PNG.',
        },
        {
          question: 'How do I change the item language?',
          answer: 'Choose KR, EN, or JA from the language selector in the upper-right corner. The interface and item display language change together.',
        },
        {
          question: 'Can I enter main-hand and off-hand weapons separately?',
          answer: 'Yes. They are separate equipment slots. If a job has no off-hand item, leave that slot empty.',
        },
        {
          question: 'Do I have to add a fashion accessory?',
          answer: 'No. Fashion accessories and face accessories are optional. Expand the optional-items area only when you want to search for one.',
        },
        {
          question: 'Are my photos or presets stored on a server?',
          answer: 'Uploaded photos are processed in your browser for card generation. Presets, theme, and language settings are stored in the browser on the current device, so clearing site data can remove them.',
        },
        {
          question: 'Why does my saved image look blurry on mobile?',
          answer: 'Cards are generated at high resolution, but messaging apps and social networks may compress uploads. Save the original PNG to your device before sharing it.',
        },
        {
          question: 'Where can I learn about advertising cookies and privacy?',
          answer: 'The Privacy Policy explains Google AdSense advertising cookies, personalized-ad controls, external asset providers, and the data kept in browser storage.',
        },
        {
          question: 'What should I do if an item is missing from search?',
          answer: 'Try part of the item name or search in another supported language. If the item is still missing, send its name and equipment slot through the contact channel.',
        },
      ],
    },
    guide: {
      title: 'Glamour Set Maker guide',
      description: 'A visual five-step walkthrough from a character screenshot to a finished Final Fantasy XIV glamour card.',
      eyebrow: 'GET STARTED',
      lastUpdated: 'Updated August 22, 2026',
      lastUpdatedIso: '2026-08-22',
      intro: [
        'Glamour Set Maker combines a character screenshot, item names, and dye information into one readable card. Follow the steps in order to keep required gear input separate from optional details.',
        'Photos and presets are handled in the browser, and the finished card is downloaded as a high-resolution PNG file to your device.',
      ],
      howTitle: 'Build a card in five steps',
      steps: [
        { title: 'Upload and crop a photo', description: 'Choose a character screenshot or drop it into the photo area. Adjust its position and zoom in the editor so the character reads clearly inside the card.' },
        { title: 'Enter glamour details', description: 'Add a set name and creator line when you want them on the card. The set name is optional, so you can leave it blank.' },
        { title: 'Fill the equipment slots', description: 'Search main-hand, off-hand, head, body, hands, legs, feet, earrings, necklace, bracelets, and both ring slots as needed. Add dye information when it matters to the look.' },
        { title: 'Add optional accessories', description: 'Add a fashion accessory or face accessory only when it is part of the outfit. The optional area can stay collapsed while you enter required gear.' },
        { title: 'Review and save', description: 'Check the photo-color information panel, item list, title, and creator line in the preview. Select Save Image and keep the original PNG before sharing it elsewhere.' },
      ],
      tipsTitle: 'Tips for a clearer card',
      tips: [
        { title: 'Photo composition', description: 'A portrait-oriented screenshot with the face and outfit visible gives the crop editor more useful space.' },
        { title: 'Lighting and background', description: 'Bright, contrasty lighting helps the character remain readable. A less busy background gives the item list more visual room.' },
        { title: 'Names and dyes', description: 'Double-check item and dye names so another player can reproduce the set accurately.' },
        { title: 'Mobile saving', description: 'Save the original PNG before sending it to a messenger or social network, because those services may compress the image.' },
      ],
      checklistTitle: 'Before you save',
      checklist: [
        'Make sure the face and outfit are readable in the photo',
        'Add the equipment slots and dyes you want to document',
        'Double-check the set name and creator line',
        'Save the original PNG before uploading it to social media',
        'Copy post hashtags from the hashtag tool when needed',
      ],
      faqTitle: 'Guide questions',
      entries: [
        { question: 'Do I need to fill every slot?', answer: 'No. Add the slots you want to show. If other players need to reproduce the set, include the main gear and dye information they will need.' },
        { question: 'Is the glamour set name required?', answer: 'No. It is an optional label. You can save a card with the item list and creator line without a set name.', },
        { question: 'Can I see the same preset on another device?', answer: 'Not automatically. Presets are stored per browser and device, not in a synced account.', },
        { question: 'Is the tool free?', answer: 'Yes. The service itself is free to use. Ads may be displayed, and their cookie handling is described in the Privacy Policy.', },
      ],
      localNoteTitle: 'What stays in your browser',
      localNote: 'Photos are processed in browser memory for card creation. Presets, theme, and language settings are kept in the current device’s browser storage. Export important cards as PNG files before clearing site data.',
    },
    terms: {
      title: 'Terms of service',
      description: 'The service scope, user content, intellectual property, third-party services, and limits of responsibility for Glamour Set Maker.',
      eyebrow: 'POLICY',
      lastUpdated: 'Updated August 13, 2026',
      lastUpdatedIso: '2026-08-13',
      effectiveDate: 'Effective date: May 5, 2026',
      sections: [
        { title: '1. Acceptance', paragraphs: ['By visiting Glamour Set Maker or using its photo, search, preset, or export features, you agree to these terms and the Privacy Policy. Do not use the service if you do not accept them.'] },
        { title: '2. Nature and scope of the service', paragraphs: ['This is a non-commercial fan project that helps Final Fantasy XIV players organize character screenshots and glamour equipment into card images. It does not provide accounts, account sync, an online gallery, or long-term hosting.'] },
        { title: '3. User content', paragraphs: ['You must have the rights and permissions needed for photos and text that you upload or enter. Do not upload personal information about another person without permission, unlawful material, infringing material, or files intended to disrupt the service.'] },
        { title: '4. Intellectual property and fan-project notice', paragraphs: ['FINAL FANTASY XIV, game images, item names, and related data belong to their respective rights holders. This service does not grant rights to use game materials; sharing or using generated cards remains subject to current SQUARE ENIX and rights-holder terms.'] },
        { title: '5. Prohibited use', paragraphs: ['Do not exploit vulnerabilities, send automated high-volume requests, scrape the service in a way that harms availability, manipulate advertising clicks or impressions, or use the service to harm other people.'] },
        { title: '6. Third-party services and links', paragraphs: ['Item icons, item data, fonts, and advertising may connect to third-party providers. Their availability, accuracy, terms, and privacy practices are controlled by those providers and should be reviewed separately.'] },
        { title: '7. Changes and availability', paragraphs: ['Features, design, data coverage, and operating methods may change for maintenance or improvement. As a personal project, the service may be interrupted or discontinued without advance notice.'] },
        { title: '8. Disclaimer and contact', paragraphs: ['The service is provided as is. To the extent permitted by law, no guarantee is made against data loss, third-party outages, or indirect damage. Keep important exports on your own device.'] },
      ],
    },
    privacy: {
      title: 'Privacy policy',
      description: 'How browser storage, uploaded photos, Google AdSense advertising cookies, and external providers are handled.',
      eyebrow: 'POLICY',
      lastUpdated: 'Updated August 13, 2026',
      lastUpdatedIso: '2026-08-13',
      effectiveDate: 'Effective date: May 5, 2026',
      sections: [
        { title: '1. Scope and operator', paragraphs: ['This policy applies to the Glamour Set Maker website and its photo editing, equipment search, preset, and image export features. Privacy questions can be sent through the developer contact channel listed on the About page.'] },
        { title: '2. Personal information not directly collected', paragraphs: ['The service does not require an account and does not directly collect an account name, email address, phone number, or password. A character photo or creator line is content you choose to place on a card; it is not registered as a user profile by this service.'] },
        { title: '3. Information stored in your browser', paragraphs: ['Theme, language choice, and saved presets are stored in the browser on the current device. Depending on the browser and language detector, a language preference may also be cached. This data is not linked to a sign-in account.'] },
        { title: '4. Uploaded photos and generated images', paragraphs: ['Uploaded photos and crop results are processed in browser memory while a card is generated. The service does not permanently store photos in an account gallery or server library, but browsers, networks, and external asset requests can create technical logs outside the service’s control.'] },
        { title: '5. External providers and requests', paragraphs: ['Item icons and related data may be delivered through an XIVAPI proxy or Cloudinary, and the site font may be delivered through jsDelivr. Pages using advertising tags may send requests to Google AdSense and Google advertising technology providers. Each provider’s own policy governs its processing and retention.'], links: [
          { label: 'Google Privacy Policy', href: 'https://policies.google.com/privacy' },
          { label: 'Cloudinary Privacy Policy', href: 'https://cloudinary.com/privacy' },
          { label: 'jsDelivr information', href: 'https://www.jsdelivr.com/about' },
        ] },
        { title: '6. Google AdSense advertising cookies and choices', paragraphs: ['Google and third-party advertising providers may use cookies or similar technologies to serve ads based on a user’s previous visits to this site or other sites. Users can change personalized advertising choices in Google Ads Settings.'], links: [
          { label: 'Google AdSense required content', href: 'https://support.google.com/adsense/answer/1348695' },
          { label: 'Google Ads Settings', href: 'https://adssettings.google.com/' },
        ] },
        { title: '7. Regional consent and advertising', paragraphs: ['When personalized ads are served to users in the EEA, the UK, or Switzerland, Google’s current EU User Consent Policy and certified consent-management requirements may apply. The account and consent configuration must be reviewed before serving personalized ads in those regions.'] },
        { title: '8. Deletion and retention', paragraphs: ['Clear this site’s browser data or storage to remove local presets, theme, and language settings. Retention and deletion of cookies or technical logs created by external providers during ad or asset requests are controlled by those providers and your browser settings.'] },
        { title: '9. Changes and contact', paragraphs: ['This policy may be updated when the service, advertising configuration, or applicable requirements change. The update date on this page will be changed with material revisions. Send privacy questions or requests to the developer contact listed on the About page.'] },
      ],
    },
  },
  ja: {
    backHome: 'メイン画面に戻る',
    about: {
      title: 'ミラプリセットメーカーについて',
      description: 'ファイナルファンタジーXIVのキャラクター写真とミラプリ装備を、共有しやすい一枚のカードにまとめるブラウザツールです。',
      eyebrow: 'サービス案内',
      lastUpdated: '2026年8月22日更新',
      lastUpdatedIso: '2026-08-22',
      contactLabel: 'お問い合わせ',
      contactText: '不具合報告、アイテムの欠落、使い勝手に関する提案は開発者までお寄せください。再現手順と使用言語を添えていただくと確認しやすくなります。',
      sections: [
        {
          title: 'このツールでできること',
          paragraphs: [
            'ミラプリセットメーカーは、ファイナルファンタジーXIVのキャラクタースクリーンショットと装備情報を、一枚の見やすいミラプリカードにまとめる無料のウェブツールです。写真のアップロード、トリミング、部位ごとの装備検索、カララントの入力、PNG保存に対応しています。',
            '主武器と副武器は別々のスロットに入力できます。ファッションアクセサリーと顔アクセサリーは任意項目なので、コーデに含まれる場合だけ追加できます。',
          ],
        },
        {
          title: '利用するメリット',
          paragraphs: [
            '別の画像編集ソフトを開かなくても、写真の位置と拡大率を調整し、装備とカララントを整理できます。アップロード写真の主な色を情報パネルに反映するため、明るい写真でも暗い写真でもカード全体の雰囲気がまとまりやすくなっています。',
            'デスクトップ、タブレット、モバイルで同じ順序を使えるレスポンシブ画面です。写真を添付し、情報を入力し、装備を確認してから画像を保存できます。',
          ],
        },
        {
          title: 'データと画像の処理',
          paragraphs: [
            'アップロードしたキャラクター写真はカード作成のためブラウザ内で処理されます。ログインや会員登録は不要で、保存したプリセット、テーマ、言語設定は現在のブラウザの保存領域に保管されます。',
            '装備アイコンやアイテムデータは必要なときに外部の提供経路から読み込まれる場合があります。ネットワーク通信と各提供者の扱いについてはプライバシーポリシーをご確認ください。',
          ],
        },
        {
          title: 'データ範囲と更新方法',
          paragraphs: [
            '2026年8月22日に生成したカタログには、装備・アイテム51,156件とフェイスアクセサリー684件が含まれています。韓国語名は51,128件、英語名と日本語名はそれぞれ50,773件に用意されています。',
            '英語・日本語の原文を確認できない韓国サーバー専用の383件は、推測で翻訳せず韓国語の状態で表示します。確認済みの地域限定アイコン6件は、似た名前の別アイテムと誤って結び付かないようIDベースのリポジトリアセットで管理しています。',
            '原データを更新するたびに、翻訳状態、装備部位、ローカルアイコンを検証し、lint・テスト・プロダクションビルドを通過したデータだけを公開します。パッチにより件数は変わる場合があり、見つからないアイテムはお問い合わせから報告できます。',
          ],
          links: [
            { label: '韓国語データマイニングリポジトリ', href: 'https://github.com/Ra-Workspace/ffxiv-datamining-ko' },
            { label: 'XIVAPIデータマイニングリポジトリ', href: 'https://github.com/xivapi/ffxiv-datamining' },
          ],
        },
        {
          title: 'ファンプロジェクトに関する注意',
          paragraphs: [
            '本サイトは非営利のファンプロジェクトであり、SQUARE ENIX CO., LTD.との提携や公式な承認を受けたサービスではありません。FINAL FANTASY XIV、ゲーム内の名称・画像および関連する知的財産権は各権利者に帰属します。',
            '本サービスはゲーム素材の利用権を付与するものではありません。生成したカードを共有・利用する場合は、SQUARE ENIXおよび各権利者の最新の利用条件をご確認ください。',
          ],
        },
      ],
    },
    faq: {
      title: 'よくある質問',
      description: '写真の添付、装備入力、任意項目、画像保存、プライバシー、広告についてのよくある質問です。',
      eyebrow: 'ヘルプセンター',
      lastUpdated: '2026年8月13日更新',
      lastUpdatedIso: '2026-08-13',
      entries: [
        {
          question: '初めて使うときのおすすめの順番は？',
          answer: 'ガイドの順番に沿って写真を添付・トリミングし、セット名と作者名を入力します。その後、部位ごとに装備を検索し、必要ならカララントや任意アクセサリーを追加して、プレビューを確認してからPNGを保存してください。',
        },
        {
          question: 'アイテムの表示言語はどう変更しますか？',
          answer: '右上の言語選択でKR、EN、JAから選んでください。画面とアイテムの表示言語が一緒に切り替わります。',
        },
        {
          question: '主武器と副武器を別々に入力できますか？',
          answer: 'はい。別々の装備スロットとして表示されます。副武器がない場合は空欄のままにできます。',
        },
        {
          question: 'ファッションアクセサリーは必須ですか？',
          answer: 'いいえ。ファッションアクセサリーと顔アクセサリーは任意項目です。必要なときだけ任意項目のエリアを開いて検索してください。',
        },
        {
          question: '写真やプリセットはサーバーに保存されますか？',
          answer: 'アップロード写真はカード作成のためブラウザ内で処理されます。プリセット、テーマ、言語設定は現在の端末のブラウザに保存されるため、サイトデータを削除すると消える場合があります。',
        },
        {
          question: 'モバイルで保存した画像がぼやけて見えます。',
          answer: 'カードは高解像度で生成されますが、メッセージアプリやSNSが画像を圧縮する場合があります。共有前に元のPNGを端末へ保存してください。',
        },
        {
          question: '広告Cookieやプライバシーについてはどこで確認できますか？',
          answer: 'プライバシーポリシーでGoogle AdSenseの広告Cookie、パーソナライズド広告の設定、外部アセット提供者、ブラウザに保存されるデータを説明しています。',
        },
        {
          question: '検索に目的のアイテムが出てきません。',
          answer: 'アイテム名の一部だけを入力するか、別の対応言語で検索してください。それでも見つからない場合は、アイテム名と装備部位をお問い合わせください。',
        },
      ],
    },
    guide: {
      title: 'ミラプリセットメーカーの使い方',
      description: 'キャラクタースクリーンショットから完成したファイナルファンタジーXIVミラプリカードまでを5段階で案内します。',
      eyebrow: 'はじめに',
      lastUpdated: '2026年8月22日更新',
      lastUpdatedIso: '2026-08-22',
      intro: [
        'ミラプリセットメーカーは、キャラクター写真、アイテム名、カララント情報を一枚の読みやすいカードにまとめます。以下の順番で進めると、必須装備と任意項目を分けて入力できます。',
        '写真とプリセットはブラウザを中心に処理され、完成したカードは高解像度PNGファイルとして端末に保存されます。',
      ],
      howTitle: '5つの手順でカードを作る',
      steps: [
        { title: '写真を添付してトリミング', description: 'キャラクタースクリーンショットを選ぶか写真エリアへドロップします。編集画面でキャラクターがカード内に見やすく収まるよう位置と拡大率を調整します。' },
        { title: 'ミラプリ情報を入力', description: 'セット名と作者名を入力します。セット名は任意なので、空欄のまま進めることもできます。' },
        { title: '装備スロットを埋める', description: '主武器、副武器、頭、胴、手、脚、足、耳飾り、首飾り、腕輪、左右の指輪を必要に応じて検索します。重要な場合はカララントも指定してください。' },
        { title: '任意アクセサリーを追加', description: 'コーデに含まれる場合だけファッションアクセサリーや顔アクセサリーを追加します。必須装備の入力中は任意項目を閉じておけます。' },
        { title: 'プレビューを確認して保存', description: '写真の色を反映した情報パネル、アイテム一覧、タイトル、作者名を確認します。画像保存を押し、共有前に元のPNGを保管してください。' },
      ],
      tipsTitle: '見やすいカードのコツ',
      tips: [
        { title: '写真の構図', description: '顔と衣装が見える縦向きのスクリーンショットを使うと、トリミングの調整がしやすくなります。' },
        { title: '照明と背景', description: '明るくコントラストのある照明はキャラクターを見やすくします。背景が複雑すぎるとアイテム一覧の可読性が下がる場合があります。' },
        { title: '名前とカララント', description: 'アイテム名とカララント名を確認すると、ほかのプレイヤーがセットを再現しやすくなります。' },
        { title: 'モバイル保存', description: 'メッセージアプリやSNSに送る前に元のPNGを保存してください。サービス外の圧縮で画質が変わる場合があります。' },
      ],
      checklistTitle: '保存前の確認',
      checklist: [
        '写真の顔と衣装が見やすく収まっているか確認する',
        '記録したい装備部位とカララントを入力する',
        'セット名と作者名をもう一度確認する',
        'SNSへ投稿する前に元のPNGを保存する',
        '必要ならハッシュタグ機能で投稿用タグをコピーする',
      ],
      faqTitle: 'ガイドの質問',
      entries: [
        { question: 'すべてのスロットを入力する必要がありますか？', answer: 'いいえ。表示したい部位だけを追加できます。ほかのプレイヤーに再現してもらいたい場合は、主要装備とカララントを入力すると便利です。' },
        { question: 'ミラプリセット名は必須ですか？', answer: 'いいえ。任意のラベルです。セット名がなくてもアイテム一覧と作者名を含むカードを保存できます。' },
        { question: '別の端末でも同じプリセットを見られますか？', answer: '自動では同期されません。プリセットはアカウントではなく、現在のブラウザと端末に保存されます。' },
        { question: '無料で使えますか？', answer: 'はい。サービス自体は無料で利用できます。広告が表示される場合があり、Cookieの扱いはプライバシーポリシーで説明しています。' },
      ],
      localNoteTitle: 'ブラウザ内で処理されるもの',
      localNote: '写真はカード作成のためブラウザメモリで処理されます。プリセット、テーマ、言語設定は現在の端末のブラウザ保存領域に記録されます。サイトデータを削除する前に重要なカードをPNGで保存してください。',
    },
    terms: {
      title: '利用規約',
      description: 'ミラプリセットメーカーの利用範囲、ユーザーコンテンツ、知的財産権、外部サービス、責任範囲を説明します。',
      eyebrow: 'ポリシー',
      lastUpdated: '2026年8月13日更新',
      lastUpdatedIso: '2026-08-13',
      effectiveDate: '施行日：2026年5月5日',
      sections: [
        { title: '1. 規約への同意', paragraphs: ['ミラプリセットメーカーへアクセスし、写真編集・検索・プリセット・画像保存機能を使うことで、本規約とプライバシーポリシーに同意したものとみなします。同意できない場合はサービスを利用しないでください。'] },
        { title: '2. サービスの性質と範囲', paragraphs: ['本サービスは、ファイナルファンタジーXIVのプレイヤーがキャラクタースクリーンショットとミラプリ装備をカード画像にまとめるための非営利ファンプロジェクトです。アカウント、同期オンラインギャラリー、長期保管は提供しません。'] },
        { title: '3. ユーザーコンテンツ', paragraphs: ['アップロードまたは入力する写真とテキストについて、必要な権利と許可を持っている必要があります。本人の許可がない個人情報、違法・権利侵害コンテンツ、サービス運用を妨害するファイルをアップロードしてはいけません。'] },
        { title: '4. 知的財産権とファンプロジェクト表示', paragraphs: ['FINAL FANTASY XIV、ゲーム画像、アイテム名、関連データの権利は各権利者に帰属します。本サービスはゲーム素材の利用権を付与しません。生成カードの共有・利用はSQUARE ENIXおよび各権利者の最新条件に従ってください。'] },
        { title: '5. 禁止される利用', paragraphs: ['脆弱性の悪用、自動化による大量リクエスト、可用性を損なうスクレイピング、広告クリックや表示の操作、他者に被害を与える利用は禁止します。'] },
        { title: '6. 外部サービスとリンク', paragraphs: ['アイテムアイコン、データ、フォント、広告は外部提供者に接続する場合があります。提供者の可用性、正確性、規約、プライバシー方針は各提供者が管理します。'] },
        { title: '7. 変更と提供停止', paragraphs: ['保守や改善のため、機能、デザイン、データ範囲、運用方法を変更する場合があります。個人プロジェクトのため、事前の告知なく一部または全部を停止・終了する場合があります。'] },
        { title: '8. 免責とお問い合わせ', paragraphs: ['本サービスは現状のまま提供されます。法令で認められる範囲において、データ消失、外部サービス障害、間接損害を保証しません。重要な保存結果はご自身の端末に保管してください。'] },
      ],
    },
    privacy: {
      title: 'プライバシーポリシー',
      description: 'ブラウザ保存、アップロード写真、Google AdSense広告Cookie、外部提供者による処理について説明します。',
      eyebrow: 'ポリシー',
      lastUpdated: '2026年8月13日更新',
      lastUpdatedIso: '2026-08-13',
      effectiveDate: '施行日：2026年5月5日',
      sections: [
        { title: '1. 適用範囲と運営者', paragraphs: ['本方針はミラプリセットメーカーのウェブサイトと、写真編集、装備検索、プリセット、画像保存の機能に適用されます。プライバシーに関する質問は概要ページに記載された開発者の連絡先へ送ることができます。'] },
        { title: '2. 直接収集しない個人情報', paragraphs: ['会員登録を求めず、氏名、メールアドレス、電話番号、パスワードなどのアカウント情報を直接収集しません。キャラクター写真や作者名はカードに表示するためにユーザーが選ぶコンテンツであり、本サービスがユーザープロフィールとして登録するものではありません。'] },
        { title: '3. ブラウザに保存される情報', paragraphs: ['テーマ、言語選択、保存したプリセットは現在の端末のブラウザに保存されます。ブラウザや言語検出機能により、言語設定がキャッシュされる場合があります。ログインアカウントとは紐づきません。'] },
        { title: '4. アップロード写真と生成画像', paragraphs: ['アップロード写真とトリミング結果はカード作成中にブラウザメモリで処理されます。本サービスは写真をアカウントギャラリーやサーバーライブラリに恒久保存しませんが、ブラウザ、ネットワーク、外部アセットへのリクエストでは本サービスの管理外で技術ログが生成される場合があります。'] },
        { title: '5. 外部提供者と通信', paragraphs: ['アイテムアイコンと関連データはXIVAPIプロキシまたはCloudinaryから、フォントはjsDelivrから配信される場合があります。広告タグを使用するページではGoogle AdSenseやGoogleの広告技術提供者へリクエストが送信される場合があります。各提供者の処理と保存には各自の方針が適用されます。'], links: [
          { label: 'Googleプライバシーポリシー', href: 'https://policies.google.com/privacy' },
          { label: 'Cloudinaryプライバシーポリシー', href: 'https://cloudinary.com/privacy' },
          { label: 'jsDelivrについて', href: 'https://www.jsdelivr.com/about' },
        ] },
        { title: '6. Google AdSenseの広告Cookieと選択', paragraphs: ['Googleおよび第三者の広告提供者は、本サイトまたは他のサイトへの過去の訪問に基づいて広告を配信するため、Cookieまたは類似技術を使用する場合があります。パーソナライズド広告の設定はGoogle広告設定で変更できます。'], links: [
          { label: 'Google AdSense必須コンテンツ', href: 'https://support.google.com/adsense/answer/1348695' },
          { label: 'Google広告設定', href: 'https://adssettings.google.com/' },
        ] },
        { title: '7. 地域別の同意と広告', paragraphs: ['EEA、英国、スイスのユーザーへパーソナライズド広告を配信する場合、Googleの最新EUユーザー同意ポリシーと認証済みの同意管理プラットフォーム要件が適用される場合があります。これらの地域で広告を配信する前にアカウントと同意設定を確認します。'] },
        { title: '8. 削除と保存期間', paragraphs: ['ブラウザのサイトデータや保存領域を削除すると、端末内のプリセット、テーマ、言語設定を削除できます。広告やアセットのリクエストで外部提供者が作成するCookieや技術ログの保存・削除は、各提供者の方針とブラウザ設定に従います。'] },
        { title: '9. 方針の変更とお問い合わせ', paragraphs: ['サービス、広告設定、適用される要件に変更があった場合、この方針を更新し、ページの更新日を変更します。プライバシーに関する質問や依頼は概要ページの開発者連絡先へ送ってください。'] },
      ],
    },
  },
};

export function getLocalizedPageContent(language: string): LocalizedPageContent {
  const baseLanguage = language.split('-')[0];
  return content[baseLanguage as SupportedLanguage] || content.ko;
}

export function useLocalizedPageContent(): LocalizedPageContent {
  const { i18n } = useTranslation();
  return getLocalizedPageContent(i18n.resolvedLanguage || i18n.language);
}
