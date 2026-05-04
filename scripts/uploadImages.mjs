import fs from 'fs';
import path from 'path';
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

// 업로드할 이미지가 있는 폴더 경로 (여기에 다운받으신 이미지들을 다 넣어주세요!)
const UPLOAD_DIR = './images_to_upload';
// 클라우디너리에 올라갈 폴더 이름
const CLOUDINARY_FOLDER = 'ff14-items';

async function uploadImages() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`\n📁 [${UPLOAD_DIR}] 폴더를 생성했습니다!`);
    console.log(`📌 다운받으신 이미지 파일들을 모두 저 폴더 안에 넣고, 다시 스크립트를 실행해 주세요!\n`);
    return;
  }

  const files = fs.readdirSync(UPLOAD_DIR).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
  });

  if (files.length === 0) {
    console.log(`\n🚨 [${UPLOAD_DIR}] 폴더에 업로드할 이미지 파일이 없습니다.\n사진을 넣고 다시 실행해 주세요!\n`);
    return;
  }

  console.log(`\n🚀 총 ${files.length}개의 이미지 업로드를 시작합니다...`);

  let successCount = 0;
  let failCount = 0;

  // 한 번에 5개씩 동시에 업로드 (너무 빠르면 에러가 날 수 있으므로 조절)
  // p-queue가 설치되어 있지 않을 경우 대비하여 자체 Promise.all 동시성 제어 로직 구현
  const maxConcurrentUploads = 5;
  
  async function processUpload(file) {
    const filePath = path.join(UPLOAD_DIR, file);
    // 확장자를 제외한 순수 파일명 추출
    const originalBaseName = path.basename(file, path.extname(file));
    
    // 표준화 규칙: 한글/영문/숫자 외 모든 문자를 단일 언더바로 변환
    const safeBaseName = originalBaseName
      .replace(/[^\uAC00-\uD7A30-9a-zA-Z]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    try {
      await cloudinary.uploader.upload(filePath, {
        folder: CLOUDINARY_FOLDER,
        public_id: safeBaseName,
        overwrite: true
      });
      successCount++;
      process.stdout.write(`\r✅ 진행 상황: ${successCount + failCount} / ${files.length} (${file} 업로드 완료)        `);
    } catch (err) {
      failCount++;
      console.error(`\n❌ [실패] ${file} 업로드 에러:`, err.message);
    }
  }

  // 동시성 제어를 위한 배열 청크 분할 함수
  for (let i = 0; i < files.length; i += maxConcurrentUploads) {
    const chunk = files.slice(i, i + maxConcurrentUploads);
    await Promise.all(chunk.map(file => processUpload(file)));
  }

  console.log(`\n\n🎉 업로드 완료!`);
  console.log(`=========================`);
  console.log(`✅ 성공: ${successCount}건`);
  console.log(`❌ 실패: ${failCount}건`);
  console.log(`=========================\n`);
}

uploadImages();
