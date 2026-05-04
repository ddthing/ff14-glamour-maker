# 파이널판타지14 룩템 시뮬레이터 - 아이템 업데이트 가이드

새 패치가 나왔을 때 사이트에 새로운 장비를 추가하는 방법을 설명합니다.
아이템 이름(한/영/일)과 이미지가 **자동으로 처리**됩니다. 이미지는 XIVAPI에서 직접 불러오므로 별도 업로드가 필요 없습니다.

---

## ✅ 패치 당일 해야 할 일 (딱 두 줄)

```bash
# 1. 최신 아이템 DB를 GitHub 데이터마이닝에서 자동으로 가져옵니다.
node scripts/makeKoItems.mjs

# 2. GitHub에 푸시 → Cloudflare Pages가 1~2분 내 자동 배포합니다.
git add . && git commit -m "update: 7.x 패치 아이템 추가" && git push
```

끝입니다. 이미지는 사이트가 XIVAPI CDN에서 직접 불러오므로 별도 작업이 없습니다.

---

## 🔧 이미지가 뜨지 않는 아이템이 있다면

아이콘이 XIVAPI에도 없거나 경로가 꼬인 경우, 수동으로 이미지를 업로드할 수 있습니다.

1. `images_to_upload` 폴더에 이미지 파일 넣기 (파일명 = 한국어 아이템 이름)
2. 아래 명령어 실행:

```bash
npm run upload
```

3. 이후에도 엑스박스(404)가 나면:

```bash
node scripts/standardizeCloudinary.mjs
```

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
