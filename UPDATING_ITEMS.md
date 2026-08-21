# 파이널판타지14 룩템 시뮬레이터 - 아이템 업데이트 가이드

새 패치가 나왔을 때 사이트에 새로운 장비를 추가하는 방법을 설명합니다.
아이템 이름(한/영/일)과 이미지가 **자동으로 처리**됩니다. 글로벌 데이터에 없는 한국 서버 전용 예외는 `scripts/item-overrides.json`에서 ID 기준으로 관리합니다.

---

## ✅ 패치 당일 해야 할 일 (딱 두 줄)

```bash
# 1. 최신 아이템 DB를 GitHub 데이터마이닝에서 자동으로 가져옵니다.
node scripts/makeKoItems.mjs

# 생성 결과의 언어 상태·asset key를 검사합니다.
npm run validate:data

# 2. GitHub에 푸시 → Cloudflare Pages가 1~2분 내 자동 배포합니다.
git add . && git commit -m "update: 7.x 패치 아이템 추가" && git push
```

글로벌 아이콘은 XIVAPI CDN에서 직접 불러오고, 한국 서버 전용 예외 아이콘은 저장소의 `public/item-icons/ko/{ID}.png`에서 불러옵니다.

---

## 🔧 이미지가 뜨지 않는 아이템이 있다면

한국 서버 전용 아이콘은 다음처럼 저장소에 추가합니다.

1. `public/item-icons/ko/{아이템 ID}.png` 경로에 파일을 넣습니다.
2. `scripts/item-overrides.json`에 `iconAssetKey: "ko/{아이템 ID}"`를 추가합니다.
3. 아래 명령어로 누락 파일을 검사합니다.

```bash
npm run validate:data
```

글로벌 아이콘의 일시적인 오류만 기존 Cloudinary 동기화 도구로 보정할 수 있습니다. 한국 전용 예외는 이 동기화 대상에서 제외됩니다.

---

## 🗂️ 아이템 데이터 구조 (참고)

`src/data/items.json`은 스크립트가 자동으로 생성합니다. 직접 편집하지 않아도 됩니다.

```json
"99999": {
  "ko": "알라미고 제작자용 터번",
  "en": "Ala Mhigan Turban of Crafting",
  "ja": "アラミガン・クラフターターバン",
  "uiCategory": 34,
  "iconPath": "/i/040000/040012.png"
}
```

| 필드 | 설명 |
|---|---|
| `ko` / `en` / `ja` | 다국어 이름 (검색에 사용)
| `uiCategory` | 장비 슬롯 필터링 ID |
| `iconPath` | XIVAPI 아이콘 경로 (이미지 자동 로딩) |
| `translationStatus` | `partial` / `kr-only` / `review` 상태일 때만 기록 |
| `iconAssetKey` | 저장소의 정적 아이콘 key (예: `ko/21036` → `public/item-icons/ko/21036.png`) |

`items.json`은 생성 파일이므로 직접 수정하지 않습니다. 공식 번역이 없는 아이템은 억지로 글로벌 이름을 추정하지 않고 한국어 fallback을 유지하며, 확인된 매핑만 `scripts/item-overrides.json`에 추가합니다.
