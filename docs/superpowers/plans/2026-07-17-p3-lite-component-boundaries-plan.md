# FF14 Glamour Maker P3-lite 구현 계획

## 목표

공개 동작과 데이터 형식을 바꾸지 않고 상태 변경, 검색 상태, 표시 책임을 분리한다. 각 작업은 테스트로 현재 동작을 고정한 뒤 구현한다.

## 작업 1. Glamour 상태 액션 경계

대상:

- `src/features/glamour/useGlamourActions.ts`
- `src/features/glamour/useGlamourActions.test.tsx`
- `src/App.tsx`
- `src/components/controls/ControlPanel.tsx`
- `src/components/controls/GeneralTab.tsx`
- `src/components/controls/EquipmentTab.tsx`
- `src/components/canvas/PreviewCanvas.tsx`

순서:

1. 제목·제작자·장비·염색·초기화·사진 액션 테스트를 작성한다.
2. 함수형 `setState`만 사용하는 액션 훅을 구현한다.
3. `App`에서 액션을 만들고 각 기능 컴포넌트에 필요한 콜백만 전달한다.
4. 기존 URL 직렬화와 상태 타입을 변경하지 않았는지 확인한다.

검증:

- 새 액션 테스트
- 기존 state codec 및 공유 URL 테스트

## 작업 2. ControlPanel 표시 책임 분리

대상:

- `src/components/controls/ControlPanel.tsx`
- `src/components/controls/ControlTabs.tsx`
- `src/components/controls/ControlActions.tsx`
- `src/components/controls/ControlStatus.tsx`

순서:

1. 현재 탭 ARIA 관계와 상태 메시지 동작을 테스트로 고정한다.
2. 탭 내비게이션을 `ControlTabs`로 이동한다.
3. 공유·저장 버튼을 `ControlActions`로 이동한다.
4. 오류 및 실행 취소 메시지를 `ControlStatus`로 이동한다.
5. 하위 표시 컴포넌트가 `AppState` 또는 setter를 받지 않는지 확인한다.

검증:

- 탭 전환 및 `aria-selected`
- 공유·저장 비활성 상태
- 오류·실행 취소 메시지

## 작업 3. 검색 상태 훅 분리

대상:

- `src/components/controls/ItemSearchInput.tsx`
- `src/features/search/useItemSearchCombobox.ts`
- `src/features/search/useItemSearchCombobox.test.tsx`
- `src/hooks/useFF14Search.ts`

순서:

1. 빈 검색어, debounce, 최신 요청 우선, 오류 경로 테스트를 작성한다.
2. 검색 결과와 로딩·오류 상태를 기능 훅으로 이동한다.
3. combobox의 열림·포커스·활성 인덱스·키보드 상태를 훅으로 이동한다.
4. `ItemSearchInput`은 DOM 렌더링과 이벤트 연결만 담당하게 한다.
5. `loadSearchItems(slot)` 계약을 유지한다.

검증:

- 기존 검색 순위 및 데이터 무결성 테스트
- 새 검색 훅 테스트
- combobox 키보드 스모크 테스트

## 작업 4. InfoPanel 표시 분리

대상:

- `src/components/canvas/InfoPanel.tsx`
- `src/components/canvas/CanvasHeading.tsx`
- `src/components/canvas/EquipmentList.tsx`

순서:

1. 현재 제목·제작자·주무기·보조무기·빈 슬롯 출력을 고정한다.
2. 제목과 제작자 표시를 `CanvasHeading`으로 이동한다.
3. 반복 장비 출력을 `EquipmentList`로 이동한다.
4. 1080×900 캔버스 내부 스타일과 줄바꿈 규칙을 유지한다.

검증:

- 주요 장비 슬롯 출력
- 보조무기 조건부 출력
- 다국어 이름과 염색 정보 보존

## 작업 5. 전체 회귀 검증

자동 검증:

1. `npm test`
2. `npm run lint`
3. `npm run build`
4. 빌드 청크에서 아이템 JSON과 크롭·내보내기 지연 로딩 유지 확인

브라우저 검증:

1. 사진 선택과 크롭
2. 얼굴장식 및 각 장비 부위 검색·선택
3. 제목·제작자·염색 변경
4. 초기화와 실행 취소
5. 공유 링크 복원
6. PNG 저장
7. 데스크톱 및 모바일 핵심 흐름

## 커밋 경계

1. `docs: plan p3-lite component refactor`
2. `refactor: centralize glamour state actions`
3. `refactor: split control panel responsibilities`
4. `refactor: isolate item search state`
5. `refactor: split canvas information rendering`
6. 필요한 회귀 수정은 원인별 별도 커밋

사용자 소유 `AGENTS.md`, `page.css`, `page2.html`은 모든 커밋에서 제외한다.
