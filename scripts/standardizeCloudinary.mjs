import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import pQueue from 'p-queue'; // 동시성 제어를 위한 패키지 (없으면 설치 필요)

// .env 파일 불러오기
dotenv.config();

// 클라우디너리 환경 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// 동시 실행 수 제한 (Cloudinary API Rate Limit 방지)
// p-queue가 없을 경우를 대비해 간단한 delay 함수 사용
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function standardizeCloudinaryNames() {
  console.log('🔍 Cloudinary 이미지 이름 표준화 스크립트를 시작합니다...\n');

  let allResources = [];
  let nextCursor = null;
  let pageCount = 1;

  // 1. 모든 리소스 가져오기 (비용 때문에 folder 지정 없이 전체를 돌면서 필터링 하거나 folder 지정)
  console.log('🔄 이미지 목록을 서버에서 불러오는 중...');
  try {
    do {
      const result = await cloudinary.search
        .expression('resource_type:image')
        .max_results(500)
        .next_cursor(nextCursor || '')
        .execute();

      allResources = allResources.concat(result.resources);
      nextCursor = result.next_cursor;
      console.log(`- ${pageCount}번째 페이지 완료 (현재까지 ${allResources.length}개 찾음)`);
      pageCount++;
      await delay(500); // API Rate Limit 방지
    } while (nextCursor);
  } catch (err) {
    console.error('❌ 목록 불러오기 실패:', err.message);
    return;
  }

  console.log(`\n✅ 총 ${allResources.length}개의 이미지를 찾았습니다.`);

  // 2. 변경 대상 필터링
  // 대상 1: 이름에 띄어쓰기가 포함된 파일
  // 대상 2: ff14-items 폴더 밖에 있는 아이템 관련 파일 (이름으로 추론)
  // 대상 3: 폴더 안/밖 상관없이 일단 ff14 아이템이면 무조건 ff14-items/언더바_이름 으로 강제 이동
  
  const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
  
  const toRename = [];
  
  for (const res of allResources) {
    const publicId = res.public_id;
    const folder = res.asset_folder || '';

    // public_id에서 폴더를 제외한 순수 이름을 가져옵니다. (res.filename이 undefined인 경우 대비)
    const baseNameFromId = publicId.split('/').pop();
    const sourceName = res.filename || baseNameFromId || '';

    // 한글이 포함된 아이템 이미지인 경우에만 처리
    if (koreanRegex.test(sourceName)) {
      // 이상적인 목표 ID 규칙: 한글/영문/숫자 외 모든 문자를 단일 언더바로 변환
      const idealBaseName = sourceName
        .replace(/[^\uAC00-\uD7A30-9a-zA-Z]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      const idealPublicId = `ff14-items/${idealBaseName}`;

      // 이미 이상적인 위치와 이름을 가지고 있다면 스킵
      if (publicId === idealPublicId) {
        continue;
      }

      toRename.push({
        oldId: publicId,
        newId: idealPublicId,
        name: sourceName
      });
    }
  }

  if (toRename.length === 0) {
    console.log('✨ 변경이 필요한 이미지가 없습니다! 모두 완벽하게 표준화되어 있습니다.');
    return;
  }

  console.log(`\n⚠️ 총 ${toRename.length}개의 파일 이름/폴더를 교정해야 합니다.`);
  console.log(`교정 예시: [${toRename[0].oldId}] -> [${toRename[0].newId}]`);
  
  // 3. 순차적으로 이름 변경 실행
  let successCount = 0;
  let failCount = 0;

  console.log('\n🚀 파일명 교정 작업을 시작합니다...\n');

  // p-queue를 사용하여 5개씩 동시 처리 (Cloudinary API Rate Limit을 고려한 안전한 수치)
  const queue = new pQueue({ concurrency: 5 });

  for (let i = 0; i < toRename.length; i++) {
    const item = toRename[i];
    queue.add(async () => {
      try {
        await cloudinary.uploader.rename(item.oldId, item.newId, {
          overwrite: true,
          invalidate: true // 중요: 변경 즉시 기존 CDN 캐시 날려버려서 404 도배 방지
        });
        successCount++;
        if (successCount % 50 === 0) {
            console.log(`✅ 진행 상황: ${successCount} / ${toRename.length} 완료...`);
        }
      } catch (err) {
        failCount++;
        console.log(`\n❌ [실패] ${item.oldId} 교정 에러:`, err.message);
      }
    });
  }

  await queue.onIdle();

  console.log(`\n\n🎉 표준화 작업이 완료되었습니다!`);
  console.log(`=========================`);
  console.log(`✅ 성공: ${successCount}건`);
  console.log(`❌ 실패: ${failCount}건`);
  console.log(`=========================\n`);
  console.log(`이제 사이트에서 콘솔 에러 없이 한 번에(200 OK) 깔끔하게 이미지를 불러올 것입니다!`);
}

standardizeCloudinaryNames();
