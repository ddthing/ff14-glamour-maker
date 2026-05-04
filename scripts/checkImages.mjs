import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// .env 파일 불러오기
dotenv.config();

// 클라우디너리 환경 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function getAllCloudinaryImages() {
  console.log("☁️ 클라우디너리에서 업로드된 이미지 목록을 가져오는 중...(시간이 조금 걸릴 수 있습니다)");
  let allImages = new Set();
  let nextCursor = null;

  try {
    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'image',
        max_results: 500, // 한 번에 최대로 가져올 개수
        next_cursor: nextCursor,
      });

      // 가져온 파일명(public_id)들을 Set에 저장 (보통 'folder/name' 혹은 'name' 형태임)
      result.resources.forEach(img => {
        // 경로 제거 후 파일명만 추출
        const filename = img.public_id.split('/').pop(); 
        allImages.add(filename);
      });

      nextCursor = result.next_cursor;
      console.log(`...지금까지 ${allImages.size}개의 이미지 확인 완료!`);
      
    } while (nextCursor);

    console.log(`✅ 총 ${allImages.size}개의 이미지가 업로드되어 있습니다.\n`);
    return allImages;
    
  } catch (err) {
    console.error("🚨 클라우디너리 접속 에러! 혹시 .env에 키를 잘못 넣으셨나요?", err);
    process.exit(1);
  }
}

async function run() {
  // 1. 내가 업로드한 서버 이미지 목록 가져오기
  const uploadedImages = await getAllCloudinaryImages();

  // 2. 4만 개짜리 로컬 아이템 DB 가져오기
  const itemsData = JSON.parse(fs.readFileSync('./src/data/items.json', 'utf8'));
  let totalItemsCount = 0;
  let missingItems = [];

  console.log("🔍 로컬 로스터(items.json)와 대조를 시작합니다...");

  for (const item of Object.values(itemsData)) {
    if (!item.ko) continue;
    totalItemsCount++;

    // 우리는 아이템 한국어 이름을.png 파일명으로 쓰고 있습니다.
    // Cloudinary에는 NFC 정규화(맥/윈도우 한글 차이) 등을 거쳐서 올라갔으므로 동일하게 변환해서 대조할 수도 있지만
    // 보통 윈도우에서 올린 그대로 판단하기 위해 띄어쓰기 정도만 체크합니다.
    const expectedFilename = item.ko.normalize('NFC').trim();
    // 띄어쓰기가 밑줄(_)로 치환되는 경우도 함께 대비해서 두 가지 경우 다 검사.
    const expectedFilenameUnder = expectedFilename.replace(/\s+/g, '_');

    if (!uploadedImages.has(expectedFilename) && !uploadedImages.has(expectedFilenameUnder)) {
       missingItems.push(item.ko);
    }
  }

  console.log(`\n======================================`);
  console.log(`📊 결과 요약:`);
  console.log(`- 전체 아이템 갯수: ${totalItemsCount}개`);
  console.log(`- 이미지가 없는 아이템: ${missingItems.length}개`);
  console.log(`======================================\n`);

  // 3. 누락된 파일명들을 찾기 쉽게 텍스트 파일로 뽑아주기
  const fileContent = missingItems.length > 0
    ? `[누락된 아이템 이미지 체크리스트 - 총 ${missingItems.length}개]\n\n` + missingItems.join('\n')
    : `🎉 누락된 이미지가 하나도 없습니다! 완벽합니다!`;

  fs.writeFileSync('./missing_images_checklist.txt', fileContent);
  console.log(`📝 [missing_images_checklist.txt] 파일이 만들어졌습니다. 여기서 확인하세요!`);
}

run();
