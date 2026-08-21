# 투영 세트 메이커

파이널판타지14(FF14/FFXIV) 캐릭터 스크린샷과 투영 정보를 한 장의 공유용 카드로 만드는 무료 브라우저 도구입니다.

> 스크린샷을 고르고, 장비와 염색 정보를 입력하고, 바로 저장·공유한다.
> 투영 정보를 이미지 편집기에서 따로 정리해야 하는 시간을 줄이는 것이 이 프로젝트의 핵심 가치입니다.

[운영 서비스](https://ff14-glamour.pages.dev/) · [사용 가이드](https://ff14-glamour.pages.dev/guide) · [FAQ](https://ff14-glamour.pages.dev/faq)

## 제품 포지셔닝: 마케터의 질문에 대한 개발자의 답

15년차 수석 마케터의 관점에서는 “사용자가 예쁜 투영을 얼마나 빨리 게시할 수 있는가”가 가장 중요한 지표입니다. 시니어 개발자의 관점에서는 그 경험이 데이터 지연, 번역 오류, 외부 이미지 장애에 흔들리지 않아야 합니다.

| 사용자와 비즈니스의 질문 | 기술 설계로 내린 답 |
| --- | --- |
| 게시용 이미지를 빠르게 만들 수 있는가? | 사진 업로드·크롭 → 장비 입력 → 고해상도 PNG 저장의 짧은 흐름으로 구성했습니다. |
| 아이템 검색이 API 응답 속도에 종속되지 않는가? | 다국어 아이템 카탈로그를 빌드 산출물로 제공하고, 브라우저에서 부위 필터와 검색어 랭킹을 처리합니다. |
| 한국 서버 전용 아이템을 억지로 번역하지 않는가? | 공식 번역이 없는 항목은 한국어 fallback을 유지하고, 확인된 아이콘만 ID 기반 로컬 예외로 관리합니다. |
| 운영 비용과 장애 지점을 통제할 수 있는가? | 사진·프리셋은 계정 서버에 저장하지 않고, 정적 데이터·캐시·명시적 fallback을 우선합니다. |
| X(Twitter) 게시까지 이어지는가? | 기본 설정에서 한국·일본·글로벌 대표 해시태그를 개별 또는 다중 선택해 복사할 수 있습니다. |

## 사용자 기능

- 캐릭터 이미지 업로드 또는 드래그 앤 드롭
- 이미지 위치·확대 비율을 조정하는 크롭 편집
- 주 무기, 보조무기, 방어구, 장신구, 얼굴 소품 검색
- 패션 소품과 얼굴 액세서리 같은 선택 항목 지원
- 한국어·영어·일본어 아이템명 검색과 화면 전환
- 아이템별 1·2번 염색 입력 및 색상 정보 표시
- 투영 세트명·제작자명 입력
- 브라우저에 저장되는 프리셋과 다크 모드
- 반응형 미리보기와 고해상도 PNG 저장
- 모바일 환경의 파일 공유 기능 지원
- 기본 설정의 해시태그 도구
  - 개별 태그를 <code>#단어</code> 형태로 복사
  - 선택한 태그를 공백으로 연결해 한 번에 복사
  - 현재 코드에 등록된 한국·일본·글로벌 대표 태그 제공

## 현재 데이터 범위

저장소에 생성된 데이터 기준입니다. 게임 패치와 원천 데이터 갱신에 따라 수치는 달라질 수 있습니다.

| 데이터 | 현재 범위 |
| --- | ---: |
| 장비·아이템 레코드 | 51,156개 |
| 얼굴 소품 데이터 | 684개 |
| 한국어 이름 보유 | 51,128개 |
| 영어 이름 보유 | 50,773개 |
| 일본어 이름 보유 | 50,773개 |
| 영어·일본어까지 완성된 레코드 | 50,773개 |
| 한국어만 존재하는 레코드 | 383개 |
| 수동 로컬 아이콘 예외 | 6개 |

한국 서버에만 존재하거나 글로벌 데이터에서 확인되지 않는 항목은 이름을 추정해 채우지 않습니다. 현재는 383개 항목을 한국어-only 상태로 표시하고, 아이콘이 필요한 6개 항목은 저장소의 정적 PNG와 ID 기반 override로 관리합니다.

## 기술 설계

### 검색과 데이터

- 한국어·영어·일본어 이름과 장비 부위 정보를 생성 시점에 병합합니다.
- 런타임에는 <code>src/data/items.json</code>과 <code>src/data/facewear.json</code>을 필요할 때 불러옵니다.
- 검색은 브라우저에서 수행하며, 정확히 일치하는 결과·접두사·부분 일치 순으로 정렬합니다.
- 장비 부위와 얼굴 소품을 별도 source로 구분해 잘못된 슬롯의 결과를 줄입니다.
- 원천 데이터는 한국어 GitHub 데이터마이닝 저장소와 XIVAPI 데이터마이닝 CSV에서 가져옵니다.

### 아이콘과 한국 전용 예외

아이콘은 다음 순서로 시도합니다.

1. 저장소의 ID 기반 로컬 아이콘: <code>public/item-icons/ko/{ID}.png</code>
2. XIVAPI v2 Asset API를 통한 아이콘
3. 기존 수동 업로드 자산을 위한 Cloudinary 이름 기반 fallback

Cloudinary는 현재 전체 아이콘의 기본 생성 경로가 아니라 레거시 fallback과 유지보수 스크립트에 남아 있습니다. 지역별 ID가 다른 항목을 이름으로 추측해 연결하지 않고, 확인된 예외만 <code>scripts/item-overrides.json</code>에 선언합니다.

정적 아이콘 경로는 SPA fallback보다 먼저 처리해야 합니다. 따라서 <code>public/_redirects</code>에는 <code>/item-icons/*</code> 예외가 있고, <code>public/_headers</code>에는 정적 자산 장기 캐시 정책이 있습니다.

### 개인정보와 브라우저 저장

- 로그인, 계정 동기화, 온라인 갤러리는 제공하지 않습니다.
- 업로드한 캐릭터 사진과 크롭 결과는 카드 생성 중 브라우저 메모리에서 처리합니다.
- 프리셋, 테마, 언어 설정은 현재 브라우저의 로컬 저장 영역에 보관됩니다.
- 외부 아이콘·폰트·광고 제공자에 대한 네트워크 요청은 각 제공자의 정책과 가용성에 영향을 받습니다.

## 로컬 개발

권장 환경은 Node.js 22입니다. CI의 데이터 갱신 workflow도 Node.js 22를 사용합니다.

~~~bash
npm install
npm run dev
~~~

개발 서버가 시작되면 Vite가 안내하는 로컬 주소를 엽니다. 기본적으로 <code>/xivapi</code> 요청은 개발 서버 프록시를 통해 XIVAPI로 전달됩니다.

### 검증 명령

~~~bash
# 생성 데이터와 로컬 아이콘 연결 검사
npm run validate:data

# 정적 분석
npm run lint

# 테스트
npm test

# 타입 검사와 프로덕션 번들
npm run build
~~~

테스트를 감시 모드로 실행하려면 <code>npm run test:watch</code>, 프로덕션 번들을 로컬에서 확인하려면 <code>npm run preview</code>를 사용합니다.

## 아이템 데이터 갱신

패치 데이터 갱신의 전체 절차는 [UPDATING_ITEMS.md](./UPDATING_ITEMS.md)에 기록되어 있습니다.

~~~bash
# 한국어·영어·일본어 아이템 CSV와 장비 슬롯 정보를 다시 생성
node scripts/makeKoItems.mjs

# 번역 상태, override, 로컬 PNG 존재 여부 확인
npm run validate:data

# 변경 범위에 맞춰 품질 게이트 실행
npm run lint
npm test
npm run build
~~~

한국 서버 전용 아이콘을 추가해야 할 때:

1. <code>public/item-icons/ko/{ID}.png</code>에 PNG를 넣습니다.
2. <code>scripts/item-overrides.json</code>에 <code>"iconAssetKey": "ko/{ID}"</code>를 추가합니다.
3. <code>npm run validate:data</code>로 파일과 매핑을 함께 검사합니다.
4. 데이터와 아이콘을 함께 커밋합니다.

<code>npm run sync</code>, <code>npm run sync:facewear</code>, <code>npm run upload</code>은 Cloudinary 레거시 자산을 관리하는 선택적 도구입니다. 기본 패치 갱신 경로에 포함하지 않으며, 사용 시 <code>.env.example</code>의 서버 외부 노출 금지 환경변수를 확인해야 합니다.

## 자동 갱신과 배포

### 데이터 자동 갱신

<code>.github/workflows/update-items.yml</code>은 매일 한국 시간 04:00에 실행되며 수동 실행도 지원합니다.

workflow는 다음을 수행합니다.

1. 원천 CSV에서 아이템 데이터를 생성합니다.
2. 번역 상태와 로컬 아이콘 override를 검증합니다.
3. lint, 테스트, production build를 실행합니다.
4. 변경이 있으면 생성 데이터와 override를 <code>main</code>에 커밋하고 push합니다.

저장소에 넣은 한국 전용 PNG는 별도 자산으로 버전 관리합니다. 자동 workflow가 이름 기반 아이콘을 추측하거나 로컬 예외 파일을 생성하지 않습니다.

### Cloudflare Pages

GitHub의 <code>main</code> 변경을 Cloudflare Pages가 감지해 <code>npm run build</code>를 실행하고 배포합니다. SPA 라우팅과 보안 헤더는 다음 파일에서 관리합니다.

- <code>public/_redirects</code>: 페이지 fallback과 정적 아이콘 예외
- <code>public/_headers</code>: 보안 헤더와 자산 캐시
- <code>functions/</code>: Cloudflare Pages Functions

### 환경 변수

~~~dotenv
# Cloudflare Pages에서만 사용하는 서버 측 누락 아이템 보고용 binding
DISCORD_WEBHOOK_URL=

# 로컬 Cloudinary 유지보수 스크립트 전용
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
~~~

<code>VITE_</code> 접두사가 붙은 변수는 브라우저 번들에 노출됩니다. 서버 전용 값에는 사용하지 말고, 실제 비밀값은 저장소에 커밋하지 않습니다.

## 프로젝트 구조

~~~text
src/
├─ components/       화면·입력·캔버스 UI
├─ features/
│  ├─ glamour/       투영 상태와 액션
│  ├─ search/        아이템 로딩·검색·슬롯 필터
│  └─ export/        카드 이미지 렌더링
├─ data/             생성된 아이템·얼굴 소품 데이터
├─ constants/        슬롯·염색·해시태그 상수
├─ hooks/            업로드·프리셋·테마·내보내기 훅
└─ pages/            가이드·FAQ·소개·약관·개인정보 페이지
functions/
├─ api/              누락 아이템 보고 API
└─ xivapi/           XIVAPI 프록시
scripts/
├─ makeKoItems.mjs   다국어 아이템 데이터 생성
├─ itemData.mjs      CSV 파싱·병합·상태 계산
└─ validateItemData.mjs
public/
└─ item-icons/ko/    한국 서버 전용 정적 아이콘
.github/workflows/
└─ update-items.yml  일일 데이터 갱신 workflow
~~~

## 운영 원칙과 알려진 한계

- 공식 영어·일본어 번역이 없는 항목은 한국어 fallback으로 남깁니다. 번역 품질보다 출처의 정확성을 우선합니다.
- 아이콘 제공 경로가 외부 서비스에 의존하는 항목은 네트워크 상태에 따라 표시가 늦거나 실패할 수 있습니다.
- 프리셋은 브라우저별 저장이므로 다른 기기와 자동 동기화되지 않습니다. 중요한 결과는 PNG로 별도 보관해야 합니다.
- 이 프로젝트는 SQUARE ENIX의 공식 서비스가 아닌 비공식 팬 프로젝트입니다. FINAL FANTASY XIV와 관련 지식재산권은 각 권리자에게 귀속됩니다.
- 서비스 내부의 [가이드](https://ff14-glamour.pages.dev/guide), [소개](https://ff14-glamour.pages.dev/about), [이용약관](https://ff14-glamour.pages.dev/terms), [개인정보처리방침](https://ff14-glamour.pages.dev/privacy)에서 사용자용 정책을 확인할 수 있습니다.
