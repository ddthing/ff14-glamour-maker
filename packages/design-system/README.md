# @ff14-glamour/design-system

FF14 Glamour Maker의 색상, 다크 모드, typography, radius, shadow를 공유하는 CSS 패키지입니다.
제품 기능이나 특정 화면의 markup은 포함하지 않습니다.

## Tailwind v4 프로젝트

이 저장소 안의 앱은 root package.json의 file dependency로 이 패키지를 사용합니다.
다른 저장소에서는 패키지 경로를 지정해 설치할 수 있습니다.

~~~sh
npm install ../ff14-glamour-maker/packages/design-system
~~~

앱의 전역 CSS에서 기존 <code>@import "tailwindcss";</code>를 아래 한 줄로 교체합니다.

~~~css
@import "@ff14-glamour/design-system/theme.css";
~~~

<code>dark</code> 모드는 기존처럼 <code>html</code> 또는 상위 요소에
<code>dark</code> 클래스를 붙이면 됩니다.

~~~html
<html class="dark">
~~~

## Tailwind를 사용하지 않는 프로젝트

토큰과 폰트 import를 사용하려면 다음 entry를 가져옵니다.

~~~css
@import "@ff14-glamour/design-system/fonts.css";
@import "@ff14-glamour/design-system/tokens.css";
~~~

컴포넌트 CSS에서는 <code>var(--bg-panel)</code>, <code>var(--text-primary)</code>,
<code>var(--border)</code>, <code>var(--radius-lg)</code>처럼 역할 기반 토큰을 사용합니다.

## pnpm workspace

같은 monorepo 안에서 사용할 때는 workspace package로 연결합니다.

~~~yaml
packages:
  - "packages/*"
~~~

소비하는 package의 dependency는 다음처럼 선언합니다.

~~~sh
pnpm add @ff14-glamour/design-system@workspace:*
~~~

## 운영 배포용 패키지

현재 패키지는 이 저장소 안에서 재사용하기 위한 <code>private</code> workspace package입니다.
여러 독립 저장소에서 계속 사용할 때는 이 폴더를 별도 저장소로 옮기거나,
private npm registry에 publish한 뒤 버전으로 고정해 설치합니다.

~~~sh
npm install @ff14-glamour/design-system@0.1.0
~~~

publish할 때는 package.json의 <code>private: true</code>를 제거하고 registry 정책에 맞는
package name과 access 설정을 추가합니다.

## 범위

이 패키지는 공통 design foundation만 담당합니다. FF14 Glamour Maker에만 필요한
canvas, item slot, hashtag chip, control panel 등의 selector는 앱의 src/index.css에
남겨 두어 다른 제품에 불필요한 CSS와 결합되지 않게 합니다.
