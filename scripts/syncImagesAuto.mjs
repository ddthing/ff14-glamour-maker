import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import PQueue from 'p-queue';

// .env 파일 불러오기
dotenv.config();

// 클라우디너리 환경 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const ITEMS_FILE = './src/data/items.json';
const CLOUDINARY_FOLDER = 'ff14-items';
const XIVAPI_BASE = 'https://xivapi.com';

// 동시성 제어 및 속도 제한 (초당 약 10~20건 정도로 조절하여 매너 있게 사용)
const queue = new PQueue({ 
  concurrency: 5, 
  interval: 100, // 100ms마다 실행
  intervalCap: 1  // 해당 간격에 1건만
});

async function syncImages() {
  if (!fs.existsSync(ITEMS_FILE)) {
    console.error(`🚨 [${ITEMS_FILE}] 파일을 찾을 수 없습니다. 먼저 node scripts/makeKoItems.mjs를 실행해 주세요.`);
    return;
  }

  const items = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf-8'));
  const entries = Object.entries(items);

  console.log(`\n🚀 총 ${entries.length}개의 아이템에 대한 이미지 동기화를 검토합니다...`);

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  // 모든 아이템을 한 번에 다 올리면 너무 오래 걸리므로, 
  // 실제로는 '최근 추가된 아이템'이나 '특정 카테고리'만 필터링해서 사용하는 것이 좋으나
  // 여기서는 전체를 순회하며 존재 여부를 확인하거나 업로드를 시도합니다.
  
  for (const [id, item] of entries) {
    if (!item.ko || !item.iconPath || item.iconAssetKey) {
      skipCount++;
      continue;
    }

    const stablePublicId = item.iconAssetKey || 'ko/' + id;
    const imageUrl = `${XIVAPI_BASE}${item.iconPath}`;

    // 큐에 업로드 작업 추가
    queue.add(async () => {
      try {
        // Cloudinary의 uploadFromUrl 기능을 사용 (로컬 다운로드 없이 직접 전송)
        // overwrite: false로 설정하면 이미 있는 파일은 건너뛰어 속도가 더 빨라집니다.
        await cloudinary.uploader.upload(imageUrl, {
          folder: CLOUDINARY_FOLDER,
          public_id: stablePublicId,
          overwrite: false // 중복 업로드 방지 (속도 향상 및 비용 절감)
        });
        successCount++;
        process.stdout.write(`\r✅ 진행 상황: ${successCount + failCount + skipCount} / ${entries.length} (${item.ko} 완료)        `);
      } catch (err) {
        // 이미 존재하는 경우 에러가 나지 않고 응답에 결과가 오지만, 
        // 만약 에러가 발생한다면 로깅
        failCount++;
        console.error(`\n❌ [실패] ${item.ko} (${id}) 에러:`, err.message);
      }
    });

    // 너무 많은 작업을 한 번에 큐에 쌓으면 메모리 문제가 생길 수 있으므로 적절히 대기
    if (queue.size > 500) {
      await queue.onEmpty();
    }
  }

  await queue.onIdle();

  console.log(`\n\n🎉 동기화 작업이 완료되었습니다!`);
  console.log(`=========================`);
  console.log(`✅ 신규 업로드: ${successCount}건`);
  console.log(`⏭️ 건너뜀/실패: ${failCount + skipCount}건`);
  console.log(`=========================\n`);
}

syncImages();
