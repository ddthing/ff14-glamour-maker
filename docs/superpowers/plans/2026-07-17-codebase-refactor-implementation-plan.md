# FF14 Glamour Maker 리팩터링 구현 계획

## 원칙

- 승인된 설계의 P0 → P1 → P2 → P3 순서를 유지한다.
- 동작 변경 전에 실제 결함을 재현하는 테스트를 작성한다.
- 기존 무버전 공유 링크와 프리셋 fixture를 계속 통과시킨다.
- 사용자 소유 미추적 파일은 수정하거나 커밋하지 않는다.
- 구조 이동과 동작 변경을 가능한 한 분리한다.

## P0.1 테스트 기반

1. Vitest와 jsdom을 개발 의존성으로 추가한다.
2. `test`, `test:watch` 스크립트를 추가한다.
3. 순수 도메인 테스트는 Node 환경, UI 테스트는 jsdom 환경을 사용한다.
4. CI에서 사용할 단일 실행 명령을 확정한다.

검증: 빈 테스트가 아니라 실제 URL·분류 회귀 테스트가 실패하고 통과하는지 확인한다.

## P0.2 URL 상태 스키마와 마이그레이션

대상:

- `src/features/glamour/stateCodec.ts`
- `src/features/glamour/stateCodec.test.ts`
- `src/hooks/useUrlState.ts`
- `src/constants/initialState.ts`

작업:

1. 인코딩·디코딩·검증·마이그레이션을 React 훅에서 순수 모듈로 분리한다.
2. 현재 직렬화 버전을 추가한다.
3. 무버전 fixture를 현재 상태로 마이그레이션한다.
4. 알 수 없는 슬롯, 잘못된 필드 타입, 비정상 숫자 범위를 거부하거나 안전한 기본값으로 복구한다.
5. `mainhand`를 유지하면서 빈 `offhand` 기본값을 추가한다.
6. 이미지 데이터는 URL에서 제외한다.

검증:

- 무버전 fixture 복원
- Unicode KO·EN·JA round trip
- 손상된 base64·JSON 복구
- 알 수 없는 슬롯 무시
- 직렬화 후 역직렬화 동등성

## P0.3 아이템 분류와 검색 완전성

대상:

- `src/features/search/itemCategories.ts`
- `src/features/search/searchItems.ts`
- 대응 단위 테스트
- 기존 `src/domain/itemCategories.ts`, `src/hooks/useFF14Search.ts`

작업:

1. 현재 카테고리 표를 fixture로 고정하고 리퍼 `108` 오분류 테스트를 먼저 실패시킨다.
2. 주무기·보조무기 카테고리를 명시적으로 분리한다.
3. Facewear를 일반 Item 분류에서 제거한다.
4. 슬롯 필터 → 다국어 일치 → 정확/접두/부분 점수 → 결과 제한 순서의 순수 검색 함수를 만든다.
5. 동일 검색 요청의 오래된 결과가 최신 결과를 덮지 않게 한다.
6. 넓은 검색어에서도 정확한 전체 이름 검색으로 모든 항목에 도달하게 한다.

검증:

- `죽음낫`은 무기에서 통과하고 Facewear에서는 제외
- 상의·하의 일치 항목이 200개를 넘어도 슬롯 필터가 먼저 실행
- KO·EN·JA 동일 ID 검색
- `uiCategory`가 없는 항목의 명시적 정책

## P0.4 무손실 데이터 동기화와 감사

대상:

- `scripts/makeKoItems.mjs` 또는 분리된 데이터 생성 모듈
- `scripts/auditItems.mjs`
- 생성기·감사 테스트 fixture

작업:

1. 표준 CSV 파서를 사용한다.
2. KO·EN·JA를 ID 합집합으로 병합하고 한국어 이름 필수 필터를 제거한다.
3. 표시 원문과 검색 정규화 값을 분리한다.
4. `Glasses.csv`에서 Facewear 데이터를 별도 생성한다.
5. 원천 ID와 생성 ID를 슬롯별로 전수 비교한다.
6. 신규 카테고리, 누락 ID, 번역 누락, 비정상 개수 감소 보고서를 생성한다.
7. 감사 실패 시 동기화 명령을 실패 종료한다.

검증: 고정 CSV fixture에 쉼표·따옴표·Unicode·누락 언어·Facewear를 포함해 무손실 병합을 확인한다.

## P0.5 내보내기 복구 경계

대상:

- `src/features/export/exportCanvas.ts`
- `src/features/export/exportCanvas.test.ts`
- `src/hooks/useExport.ts`
- `src/components/controls/ControlPanel.tsx`

작업:

1. DOM 준비·PNG 생성·공유/다운로드를 분리한다.
2. 변경한 이미지 주소와 스타일을 모든 실패 경로에서 복원한다.
3. 단계별 상태와 구조화된 오류를 반환한다.
4. 사용자 공유 취소와 실제 실패를 구분한다.
5. `alert`를 재시도 가능한 인라인 피드백으로 교체한다.

## P1 UI/UX와 접근성

1. 탭 의미 구조와 방향키 조작을 추가한다.
2. 검색 입력을 combobox/listbox 패턴으로 정리한다.
3. 아이콘 버튼에 이름을 제공하고 포커스 표시를 통일한다.
4. 모달 포커스·Escape·스크롤 제어를 구현한다.
5. 문서 스크롤을 복원하고 모바일 고정 패널 높이를 제거한다.
6. 무기 그룹 안에서 주무기·보조무기를 선택하고 한 캔버스 행으로 렌더링한다.
7. Facewear 전용 검색을 연결한다.
8. 번역 fallback에 원문 언어 배지를 표시한다.

## P2 성능

1. 빌드 청크와 8.33 MiB 아이템 데이터 비용을 측정한다.
2. 정규화 인덱스를 한 번만 생성한다.
3. 필요하면 아이템 데이터 지연 로딩 또는 전용 Worker를 적용한다.
4. 검색 p50·p95와 장기 작업을 전후 비교한다.
5. 내보내기 이미지 준비를 안전한 범위에서 병렬화한다.
6. PNG 해상도·메모리·시간의 품질 균형을 검증한다.

## P3 구조

1. `glamour`, `search`, `export`, `canvas` 기능 디렉터리로 책임을 이동한다.
2. 전체 `AppState` 전달을 기능 액션과 선택 값으로 축소한다.
3. 큰 컴포넌트를 연결·표현 컴포넌트로 분리한다.
4. 직접 인라인 이벤트 스타일을 공통 UI 상태 클래스로 옮긴다.

## 최종 검증

1. `npm run test`
2. `npm run lint`
3. `npm run build`
4. 기존 링크·프리셋 fixture
5. 슬롯·Facewear 전체 데이터 감사
6. 데스크톱·모바일·키보드 E2E
7. 검색과 내보내기 성능 전후 보고
