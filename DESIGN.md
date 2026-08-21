# FF14 Glamour Maker Design System

현재 운영 중인 투영 세트 메이커의 시각 언어와 UI 규칙을 기록한 문서입니다.
새 화면이나 다른 프로젝트를 만들 때 이 문서를 먼저 읽고, 임의의 색상·radius·shadow를 추가하지 않습니다.

## 0. 문서 기준

이 문서는 현재 구현을 기준으로 정리한 디자인 계약입니다.

- 구현 기준: <code>src/index.css</code>
- 작업공간: <code>src/App.tsx</code>, <code>src/components/canvas</code>, <code>src/components/controls</code>
- 콘텐츠 페이지: <code>src/components/layout</code>, <code>src/pages</code>
- 아이콘: Hugeicons
- 폰트: Pretendard Variable
- CSS: Tailwind CSS v4 utility와 <code>src/index.css</code>의 공통 클래스 혼용

스타일의 핵심은 “차분한 중성색 작업공간 + 사진에서 추출한 카드 배경 + 조밀하지만 충분한 터치 여백”입니다.
브랜드 경험은 화려한 장식보다 사진과 투영 정보의 가독성을 우선합니다.

## 1. Visual Direction

### 키워드

- Quiet utility: 도구처럼 명확하고 조용한 화면
- Neutral studio: 흰색·회색·검정 중심의 중성 표면
- Editorial card: 완성 결과물은 사진과 정보가 균형을 이루는 한 장의 카드
- Soft density: 간격은 조밀하게 유지하되 입력과 터치 영역은 답답하지 않게
- Adaptive contrast: 사진 색상에 따라 카드의 텍스트 톤을 자동 조정

### 지켜야 할 것

- 앱 외곽은 순수한 장식용 그라디언트보다 표면 단계와 1px border로 깊이를 만듭니다.
- primary text는 순수 검정 대신 <code>--text-primary</code>를 사용합니다.
- 정보 패널의 배경은 사용자 사진에서 추출한 팔레트로 만들고, 텍스트 대비를 먼저 계산합니다.
- 카드 내부의 장식은 정보 위에 놓이지 않습니다. scrim, noise, divider는 가독성을 보조하는 수준으로 제한합니다.
- 화면 전체의 radius는 6·8·12px 계열을 사용하고, 태그와 상태 chip만 pill을 사용합니다.

## 2. Design Tokens

### 2.1 Typography

기본 폰트는 Pretendard Variable입니다. 외부 폰트를 사용할 수 없을 때도 동일한 인상을 유지하도록 fallback을 둡니다.

~~~css
--font-sans: 'Pretendard Variable', Pretendard, sans-serif;
~~~

| 역할 | 크기 | 굵기 | 규칙 |
| --- | ---: | ---: | --- |
| 일반 본문 | 브라우저 기본 또는 0.94rem | 400–500 | line-height 1.7–1.75 |
| 입력·검색 UI | 0.875rem | 400–600 | 한 줄 truncation 허용 |
| 섹션 라벨 | 0.68–0.75rem | 600–750 | 필요한 경우 uppercase, tracking 0.08–0.16em |
| 콘텐츠 페이지 제목 | clamp(1.9rem, 5vw, 3.1rem) | 750 | line-height 1.08, tracking -0.045em |
| 카드 아이템명 | 1.05–1.30rem | 800 | line-height 1.15, tracking -0.03em |
| 카드 보조명 | 0.73–0.82rem | 500 | line-height 1.2 |
| 카드 메타 | 0.50–0.60rem | 600–800 | uppercase, tracking 0.05–0.12em |

### 2.2 Light theme

색상은 중성 OKLCH를 기본으로 합니다. hex로 임의 변환하지 말고 아래 역할 토큰을 사용합니다.

| 토큰 | 값 | 역할 |
| --- | --- | --- |
| <code>--bg-app</code> | <code>oklch(0.985 0 0)</code> | 앱 전체 배경 |
| <code>--bg-panel</code> | <code>oklch(1 0 0)</code> | 입력 패널·카드 표면 |
| <code>--bg-slot</code> | <code>oklch(0.97 0 0)</code> | slot 보조 배경 |
| <code>--surface-100</code> | <code>oklch(1 0 0)</code> | 가장 밝은 표면 |
| <code>--surface-200</code> | <code>oklch(0.985 0 0)</code> | 앱 배경과 가까운 표면 |
| <code>--surface-300</code> | <code>oklch(0.97 0 0)</code> | hover·button·선택 보조 표면 |
| <code>--surface-400</code> | <code>oklch(0.922 0 0)</code> | 깊은 보조 표면 |
| <code>--surface-500</code> | <code>oklch(0.87 0 0)</code> | 강한 보조 표면 |
| <code>--text-primary</code> | <code>oklch(0.145 0 0)</code> | 제목·핵심 값 |
| <code>--text-secondary</code> | <code>oklch(0.371 0 0)</code> | 일반 본문·보조 제목 |
| <code>--text-muted</code> | <code>oklch(0.556 0 0)</code> | hint·metadata |
| <code>--border</code> | <code>oklch(0.922 0 0)</code> | 기본 1px 경계 |
| <code>--border-medium</code> | <code>oklch(0.708 0 0 / 55%)</code> | hover·focus·선택 경계 |
| <code>--border-strong</code> | <code>oklch(0.371 0 0 / 60%)</code> | 강한 구분선 |
| <code>--accent</code> | <code>oklch(0.97 0 0)</code> | 상호작용 보조 배경 |
| <code>--accent-strong</code> | <code>oklch(0.145 0 0)</code> | 선택 상태·강조 |
| <code>--error</code> | <code>oklch(0.577 0.245 27.325)</code> | 오류·hover 피드백 |
| <code>--success</code> | <code>#23866b</code> | 복사 완료·성공 상태 |

### 2.3 Dark theme

<code>.dark</code>가 <code>html</code>에 적용되면 같은 역할 토큰이 어두운 표면으로 교체됩니다.

| 토큰 | 값 |
| --- | --- |
| <code>--bg-app</code> | <code>oklch(0.145 0 0)</code> |
| <code>--bg-panel</code> | <code>oklch(0.205 0 0)</code> |
| <code>--bg-slot</code> | <code>oklch(0.269 0 0)</code> |
| <code>--surface-100</code> | <code>oklch(0.205 0 0)</code> |
| <code>--surface-200</code> | <code>oklch(0.235 0 0)</code> |
| <code>--surface-300</code> | <code>oklch(0.269 0 0)</code> |
| <code>--surface-400</code> | <code>oklch(0.32 0 0)</code> |
| <code>--surface-500</code> | <code>oklch(0.371 0 0)</code> |
| <code>--text-primary</code> | <code>oklch(0.985 0 0)</code> |
| <code>--text-secondary</code> | <code>oklch(0.87 0 0)</code> |
| <code>--text-muted</code> | <code>oklch(0.708 0 0)</code> |
| <code>--border</code> | <code>oklch(1 0 0 / 10%)</code> |
| <code>--border-medium</code> | <code>oklch(1 0 0 / 20%)</code> |
| <code>--border-strong</code> | <code>oklch(1 0 0 / 44%)</code> |
| <code>--accent</code> | <code>oklch(0.269 0 0)</code> |
| <code>--accent-strong</code> | <code>oklch(0.985 0 0)</code> |
| <code>--error</code> | <code>oklch(0.704 0.191 22.216)</code> |
| <code>--success</code> | <code>#65c9a8</code> |

### 2.4 Radius, shadow, motion

~~~css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;

--shadow-elevated:
  0 12px 40px var(--shadow-color-1),
  0 2px 10px var(--shadow-color-2);

--shadow-focus: 0 0 0 4px var(--shadow-color-focus);
~~~

- 기본 card와 panel은 shadow를 거의 사용하지 않고 border로 구분합니다.
- dropdown처럼 떠야 하는 요소만 <code>--shadow-elevated</code>를 사용합니다.
- 입력 focus는 border-medium + shadow-focus를 사용합니다.
- 색상·background transition은 150–200ms, slot과 레이아웃 상태는 160–300ms입니다.
- 클릭 피드백은 <code>scale(0.97)</code> 또는 <code>scale(0.98)</code> 이하로 작게 사용합니다.
- <code>prefers-reduced-motion: reduce</code>에서는 transition과 animation을 사실상 제거합니다.

## 3. Layout

### 3.1 앱 셸

- header는 sticky이며 높이는 mobile 44px, larger viewport 46px입니다.
- 콘텐츠 최대 너비는 1480px입니다.
- 외곽 horizontal padding은 mobile 12px, small 20px, large 40px입니다.
- footer는 작은 metadata와 링크만 제공하고, 본문보다 시각적 우선순위를 낮춥니다.
- 앱은 <code>min-height: 100dvh</code>와 <code>overflow-x: hidden</code>을 기본으로 합니다.

### 3.2 작업공간

메인 작업공간은 작은 화면에서 한 열, xl breakpoint부터 미리보기와 컨트롤 패널 두 열입니다.

~~~css
display: grid;
grid-template-columns: 1fr;
gap: 20px;

@media (min-width: 1280px) {
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: 32px;
}
~~~

- 미리보기는 flex로 남은 공간을 사용합니다.
- 컨트롤 패널은 고정 폭 400px을 넘지 않습니다.
- 패널 내부는 세로 flex이며, 입력 영역은 scroll, action dock은 하단에 고정됩니다.

### 3.3 정보 페이지

- 본문 최대 너비: 900px
- hero 텍스트 최대 너비: 760px
- 본문 설명 최대 너비: 64ch
- 기본 padding: <code>clamp(1.5rem, 4vw, 4rem) 1rem 4rem</code>
- mobile 600px 이하에서는 좌우 padding 0.75rem, 하단 padding 2.5rem
- section card는 border + 12px radius + surface background

## 4. Hero Output Card

완성 결과물은 1080 × 900px 고정 캔버스입니다.

| 영역 | 크기 | 역할 |
| --- | ---: | --- |
| photo panel | 480 × 900px | 캐릭터 사진 업로드·교체 |
| info panel | 600 × 900px | 세트명·제작자·장비 목록 |
| info padding | 32px 40px 24px | 정보 밀도와 여백의 기준 |

외부 wrapper가 available width에 맞춰 scale하고, 내부 canvas는 1080 × 900을 유지합니다.
이 방식으로 responsive preview와 export 결과의 비율을 분리합니다.

### 4.1 Photo panel

- 기본 배경: <code>#17191c</code>
- 이미지: 전체 영역 object-cover
- 빈 상태: 안쪽 margin 24px, 큰 화면 32px의 얇은 border frame
- 업로드 아이콘: 56 × 56px, white 4–12% surface
- hover 교체 버튼: 하단 16px inset, min-height 44px, dark translucent surface
- drag 상태: inset 16px, dashed white border, dark scrim

### 4.2 Dynamic info background

사진이 있으면 <code>useImagePalette</code>가 색상 3개와 text tone을 계산합니다.

1. primary 색상으로 base background를 채웁니다.
2. 원본의 blurred preview image를 크게 확대해 ambient 색을 만듭니다.
3. primary·secondary·tertiary radial/linear gradient를 중첩합니다.
4. 좌우 linear scrim으로 텍스트 영역의 대비를 확보합니다.
5. 낮은 opacity의 noise texture를 추가합니다.

사진이 없을 때는 <code>#17191c</code> fallback을 사용합니다. 배경 효과가 정보보다 강해지면 안 됩니다.

### 4.3 Card text tone

정보 패널은 배경 밝기에 따라 아래 변수를 주입합니다.

| 역할 | dark text tone | light text tone |
| --- | --- | --- |
| primary | rgba(18, 22, 26, 0.94) | rgba(255, 255, 255, 0.98) |
| secondary | rgba(18, 22, 26, 0.72) | rgba(255, 255, 255, 0.76) |
| muted | rgba(18, 22, 26, 0.54) | rgba(255, 255, 255, 0.56) |
| divider | rgba(18, 22, 26, 0.14) | rgba(255, 255, 255, 0.12) |
| chip background | rgba(255, 255, 255, 0.38) | rgba(255, 255, 255, 0.08) |
| chip border | rgba(18, 22, 26, 0.14) | rgba(255, 255, 255, 0.12) |

### 4.4 Equipment row

장비 행은 메인명 → 보조 다국어명 → 염색 chip의 3단 구조입니다.

| mode | icon | row padding | text gap | main font |
| --- | ---: | --- | ---: | ---: |
| comfortable | 48px | 8px 0 | 3px | 1.30rem |
| balanced | 42px | 6px 0 | 2px | 1.15rem |
| compact | 36px | 5px 0 | 2px | 1.05rem |

- icon radius는 2px로 작게 유지합니다.
- row divider는 <code>--card-divider</code>를 사용합니다.
- 염색 chip은 4px gap, 2px 8px 2px 5px padding, 2px radius입니다.
- 색상 swatch는 10 × 10px입니다.
- 아이템명이 길어도 word-break와 sub line을 이용해 카드 내 정보 손실을 줄입니다.

## 5. Control Panel Components

### 5.1 Panel and tabs

- panel: <code>--bg-panel</code>, 1px <code>--border</code>, shadow 없음, 12px radius
- tabs: 2열 grid, gap 6px, padding 8px, bottom border
- tab: min-height 44px, 6px radius, 0.875rem, weight 650
- active tab: surface-100 background, border, primary text
- hover: surface-100 background, secondary text

### 5.2 Inputs

공통 input은 최소 높이 44px을 보장합니다.

~~~css
.input-base {
  min-height: 44px;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-panel);
  color: var(--text-primary);
  font-size: 0.875rem;
}
~~~

- focus-visible: border-medium + shadow-focus
- 검색 input은 좌측 icon을 위해 padding-left를 늘립니다.
- 결과 dropdown은 surface-100, border, 6px radius, elevated shadow입니다.
- 검색 결과 행은 min-height 44px, 아이콘 32px, text truncation을 사용합니다.

### 5.3 Slot selector

- 3열 grid, gap 8px
- button min-height 76px, padding 8px, 6px radius
- 빈 slot: surface-100 + border
- hover: surface-200 + border-medium + scale 1.02
- active: surface-300 + border-medium + 1px ring
- filled indicator: 우상단 8px dot, primary 색상
- icon frame: 36 × 36px, 6px radius

선택됨과 입력됨을 동시에 표현해야 합니다. active는 배경·ring, filled는 작은 dot으로 표현해 의미를 겹치지 않게 합니다.

### 5.4 General settings and presets

- 각 section: 세로 flex, gap 12px, padding 16px 20px
- label과 input 사이 gap: 10px
- preset input row height: 40px
- preset list row: surface-100, border, 8px 10px 8px 12px padding, 8px radius
- 삭제는 아이콘 버튼으로 제공하고 hover 시 error 색상을 사용합니다.

### 5.5 Hashtag tools

해시태그는 기본 설정 안에서만 제공해 입력 흐름을 방해하지 않습니다.

- wrapper: margin 16px 20px, padding 12px, surface-200, border, 8px radius
- chip list: flex-wrap, gap 6.4px
- chip: min-height 28px, full pill, surface-100
- selected chip: <code>--accent-strong</code> 배경과 surface-100 text
- 개별 copy button: chip 내부에 배치하고 opacity를 낮춰 시각적 우선순위를 줄입니다.
- 다중 복사 button: width 100%, min-height 32px, surface-300, 6px radius
- 복사 완료: success, 실패: error

체크박스를 추가하지 않습니다. chip의 색상과 <code>aria-pressed</code>가 선택 상태를 충분히 전달합니다.

### 5.6 Primary action

- action dock: panel 하단 sticky, top border, surface-100, safe-area bottom padding
- save button: min-height 46px, high-contrast primary background, 6px radius
- 준비 전 disabled: opacity 0.58
- 클릭: scale 0.98
- export 중: icon 대신 작은 spinner

## 6. Header, Footer, Content

### Header

- sticky top, app background, bottom border
- brand mark: 8 × 8px, 1.5px border, 2px radius
- wordmark: 0.78rem, weight 650, secondary text
- language/theme controls: 30 × 30px, 5px radius
- hover/current: surface-200 background
- skip link: focus 시 화면 상단으로 들어오는 dark surface button

### Footer

- top border와 header background
- brand 0.68rem, legal text 0.62rem
- navigation link 0.64rem, muted text, min-height 24px
- 지원 링크는 opacity를 낮춰 primary navigation보다 덜 강조합니다.

### Content pages

- eyebrow: 0.68rem, weight 700, tracking 0.1em, uppercase
- page title: clamp(1.9rem, 5vw, 3.1rem)
- description: 1rem, line-height 1.7, secondary text
- prose: 0.94rem, line-height 1.75
- FAQ row: min-height 52px, 0.9rem 1rem padding, open 시 bottom border
- guide step: desktop 2열 rail + copy, mobile 1열로 전환

## 7. Interaction and Accessibility

- 모든 interactive element는 <code>:focus-visible</code>에서 2px ring + 3px offset을 가집니다.
- input shell이 focus-within일 때도 border와 ring을 함께 표시합니다.
- 주요 버튼과 tab은 min-height 44px을 유지합니다.
- 아이콘만 있는 버튼은 30–44px hit area를 확보하고 aria-label을 제공합니다.
- tab은 role=tab, aria-selected, aria-controls를 사용합니다.
- 이미지는 고정 width/height 또는 aspect-ratio를 지정해 layout shift를 줄입니다.
- hover만으로 핵심 정보를 전달하지 않습니다. active, selected, aria 상태를 함께 제공합니다.
- <code>prefers-reduced-motion</code>과 <code>prefers-reduced-transparency</code>를 지원합니다.
- 캔버스의 사진·배경은 장식이어도 정보 텍스트의 대비를 방해하지 않아야 합니다.

## 8. Responsive Rules

| 영역 | mobile | desktop |
| --- | --- | --- |
| workspace | 1열, panel이 preview 아래 | xl부터 preview + 400px panel |
| shell padding | 12px | 20px → 40px |
| content page | 좌우 12px | max 900px, clamp padding |
| guide step | rail 위 / copy 아래 | rail 왼쪽 / copy 오른쪽 |
| guide tips | 1열 | 2열 |
| control panel | width 100% | width 400px |
| preview | width에 맞춰 scale | available width 안에서 scale |

새 breakpoint를 추가하기보다 기존 xl grid와 600px content-page breakpoint를 우선 재사용합니다.

## 9. Implementation Recipes

### 새 화면을 추가할 때

1. 배경·텍스트·border는 역할 토큰을 선택합니다.
2. panel은 <code>--bg-panel</code> + <code>--border</code> + 12px radius로 시작합니다.
3. 입력은 44px 높이와 focus-visible 상태를 먼저 구현합니다.
4. primary action은 dark primary, secondary action은 surface-300으로 구분합니다.
5. mobile 600px과 xl 1280px에서 layout을 확인합니다.
6. dark mode, keyboard focus, reduced motion을 확인합니다.

### 다른 프로젝트로 이식할 때

실행 가능한 공통 스타일은 <code>packages/design-system</code>으로 분리했습니다.
<code>DESIGN.md</code>가 의사결정과 component recipe를 설명하고,
패키지가 토큰과 Tailwind 연결을 실행합니다.

#### Tailwind v4 프로젝트

다른 저장소에서 로컬 패키지를 시험할 때:

~~~sh
npm install ../ff14-glamour-maker/packages/design-system
~~~

전역 CSS에서 기존 <code>@import "tailwindcss";</code>를 아래 한 줄로 교체합니다.

~~~css
@import "@ff14-glamour/design-system/theme.css";
~~~

이후 <code>html</code> 또는 상위 요소에 <code>dark</code> 클래스를 적용하면
동일한 light/dark 토큰을 사용할 수 있습니다.

#### Tailwind를 사용하지 않는 프로젝트

토큰만 가져오고 컴포넌트 CSS는 각 프로젝트에서 작성합니다.

~~~css
@import "@ff14-glamour/design-system/fonts.css";
@import "@ff14-glamour/design-system/tokens.css";
~~~

<code>var(--bg-panel)</code>, <code>var(--text-primary)</code>,
<code>var(--border)</code>, <code>var(--radius-lg)</code>처럼 역할 기반 토큰을
사용하면 프로젝트가 달라도 색상·상태·radius 기준이 흔들리지 않습니다.

#### 이식 범위와 한계

- 공유 패키지: light/dark 변수, Pretendard entry, Tailwind theme alias, radius, shadow
- 현재 앱에 남긴 규칙: canvas, item slot, hashtag chip, control panel 등 제품 전용 selector
- 정확히 같은 화면이 필요하면 이 문서의 markup/component recipe와 Hugeicons도 함께 적용
- 픽셀 단위의 동일함은 markup, 폰트 렌더링, 아이콘, 브라우저 차이 때문에 보장되지 않음

여러 독립 저장소에서 버전으로 관리하려면 패키지를 별도 저장소로 옮기거나
private npm registry에 publish합니다. 현재는 실수로 공개 배포되지 않도록
<code>private: true</code>인 로컬 workspace package로 두었습니다.

## 10. Anti-patterns

- Cursor 전용 색상이나 다른 프로젝트의 warm cream palette를 다시 섞지 않습니다.
- 순수 검정·순수 흰색을 앱 표면의 기본값으로 남발하지 않습니다.
- panel마다 다른 radius와 임의의 shadow를 추가하지 않습니다.
- 44px 미만의 핵심 입력·tab·action을 만들지 않습니다.
- 선택 상태를 색상 하나로만 표현하지 않습니다. border, ring, aria 상태 중 하나 이상을 함께 사용합니다.
- 사진 카드 안에 고정 흰색 텍스트만 넣지 않습니다. palette text tone을 계산합니다.
- mobile에서 desktop 2열을 억지로 유지하지 않습니다.
- 디자인 문서와 실제 토큰이 달라지면 먼저 <code>src/index.css</code>와 이 문서를 함께 갱신합니다.

## 11. Quick Reference

~~~text
Font       Pretendard Variable
Palette    neutral OKLCH + high-contrast primary action + teal success + red error
Radius     6 / 8 / 12px, pill only for tags and status chips
Spacing    4 / 6 / 8 / 10 / 12 / 16 / 20 / 24 / 32 / 40px
Input      min-height 44px
Header     44px mobile, 46px larger viewport
Workspace  1 column → xl (1280px) preview + 400px controls
Canvas     1080 × 900px, photo 480px + info 600px
Motion     150–200ms transitions, 0.97–0.98 active scale
Focus      2px outline, 3px offset, role-based ring
~~~

이 문서의 목적은 특정 앱의 화면을 묘사하는 데서 끝나지 않고, 같은 의사결정 규칙을 다른 프로젝트에서도 반복해서 사용할 수 있게 하는 것입니다.
