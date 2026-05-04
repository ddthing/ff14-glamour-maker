import fs from 'fs';

async function fetchCsv(urls) {
  for (const url of urls) {
    console.log(`🔗 접속 시도 중: ${url}`);
    const res = await fetch(url);
    if (res.ok) {
      console.log(`✅ 다운로드 성공: ${url}`);
      return await res.text();
    }
  }
  return null;
}

function parseCsv(csvText, lang, resultDb) {
  if (!csvText) return;
  const lines = csvText.split('\n');
  let nameIndex = -1;
  let categoryIndex = -1;
  let iconIndex = -1;
  let startRow = 3;

  for (let i = 0; i < 5; i++) {
    if (!lines[i]) continue;
    const headers = lines[i].split(',');
    const foundIdx = headers.findIndex(h => h.replace(/"/g, '') === 'Name');
    const catIdx = headers.findIndex(h => h.replace(/"/g, '') === 'ItemUICategory');
    const icoIdx = headers.findIndex(h => h.replace(/"/g, '') === 'Icon');
    if (foundIdx !== -1) {
      nameIndex = foundIdx;
      if (catIdx !== -1) categoryIndex = catIdx;
      if (icoIdx !== -1) iconIndex = icoIdx;
      startRow = i + 1;
      break;
    }
  }

  if (nameIndex === -1) return;

  for (let i = startRow; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const id = cols[0];
    let name = cols[nameIndex];
    let category = categoryIndex !== -1 ? cols[categoryIndex] : undefined;
    let icon = iconIndex !== -1 ? cols[iconIndex] : undefined;

    if (id && name) {
      name = name.replace(/^"|"$/g, '');
      if (name.length > 0 && name !== "Name" && name !== "0") {
        if (!resultDb[id]) resultDb[id] = {};
        
        resultDb[id][lang] = name;
        
        // uiCategory 및 icon은 한국어 파싱 때나 영어 등 한 번만 넣으면 됨
        if (category && !resultDb[id].uiCategory) {
          resultDb[id].uiCategory = Number(category.replace(/^"|"$/g, ''));
        }
        if (icon && !resultDb[id].iconPath) {
          // Icon 숫자가 들어오는 경우가 많으므로 경로로 변환
          const iconId = Number(icon.replace(/^"|"$/g, ''));
          if (!isNaN(iconId)) {
            const folder = Math.floor(iconId / 1000) * 1000;
            const folderStr = String(folder).padStart(6, '0');
            const fileStr = String(iconId).padStart(6, '0');
            resultDb[id].iconPath = `/i/${folderStr}/${fileStr}.png`;
          }
        }
      }
    }
  }
}

async function buildKoreanItemDB() {
  console.log("🚀 글로벌 다국어 아이템 데이터를 긁어옵니다...");

  const koUrls = [
    "https://raw.githubusercontent.com/Ra-Workspace/ffxiv-datamining-ko/master/csv/Item.csv",
    "https://raw.githubusercontent.com/Ra-Workspace/ffxiv-datamining-ko/main/csv/Item.csv",
    "https://raw.githubusercontent.com/Ra-Workspace/ffxiv-datamining-ko/refactor/csv/Item.csv"
  ];
  const enUrls = ["https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/en/Item.csv"];
  const jaUrls = ["https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/ja/Item.csv"];

  const resultDb = {};

  const koCsv = await fetchCsv(koUrls);
  const enCsv = await fetchCsv(enUrls);
  const jaCsv = await fetchCsv(jaUrls);

  parseCsv(koCsv, 'ko', resultDb);
  parseCsv(enCsv, 'en', resultDb);
  parseCsv(jaCsv, 'ja', resultDb);

  // 한국어 이름이 있는 데이터만 필터링 (한국 섭 기준이니까)
  const filteredDb = {};
  let count = 0;
  for (const [id, item] of Object.entries(resultDb)) {
    if (item.ko) {
      filteredDb[id] = item;
      count++;
    }
  }

  if (!fs.existsSync('./src/data')) {
    fs.mkdirSync('./src/data', { recursive: true });
  }
  fs.writeFileSync('./src/data/items.json', JSON.stringify(filteredDb, null, 2));
  console.log(`🎉 대성공! 총 ${count}개의 다국어 아이템 DB가 [src/data/items.json]에 생성되었습니다!`);
}

buildKoreanItemDB();