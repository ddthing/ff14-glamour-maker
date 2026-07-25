import { useTranslation } from 'react-i18next';

type SupportedLanguage = 'ko' | 'en' | 'ja';

interface TextSection {
  title: string;
  paragraphs: string[];
}

interface LocalizedPageContent {
  backHome: string;
  about: {
    title: string;
    sections: TextSection[];
    contactLabel: string;
  };
  faq: {
    title: string;
    entries: Array<{ question: string; answer: string }>;
  };
  guide: {
    title: string;
    intro: string[];
    howTitle: string;
    steps: Array<{ title: string; description: string }>;
    tipsTitle: string;
    tips: Array<{ title: string; description: string }>;
    faqTitle: string;
    entries: Array<{ question: string; answer: string }>;
  };
  terms: {
    title: string;
    effectiveDate: string;
    sections: TextSection[];
  };
  privacy: {
    title: string;
    effectiveDate: string;
    sections: TextSection[];
  };
}

export const localizedPageContent: Record<SupportedLanguage, LocalizedPageContent> = {
  ko: {
    backHome: '메인으로 돌아가기',
    about: {
      title: '투영 세트 메이커 소개',
      contactLabel: 'Twitter/X',
      sections: [
        {
          title: '서비스 기능',
          paragraphs: [
            '투영 세트 메이커는 파이널판타지14 캐릭터 사진과 부위별 장비·염색 정보를 한 장의 카드로 정리하는 브라우저 웹앱입니다.',
            '사진 자르기, 한국어·영어·일본어 아이템 검색, 프리셋 저장, 고해상도 PNG 내보내기를 지원합니다.',
          ],
        },
        {
          title: '데이터와 운영',
          paragraphs: [
            '아이템 이름과 아이콘 경로는 XIVAPI 기반 데이터에서 가져오며, 누락되거나 잘못된 항목은 사이트의 오류 제보 기능으로 접수합니다.',
            '현재 사이트의 광고 제공은 중단되어 있습니다. 기능 문의, 오류 제보, 데이터 수정 요청은 운영자에게 전달해 주세요.',
          ],
        },
        {
          title: '권리 및 비공식 서비스 고지',
          paragraphs: [
            '이 웹사이트는 SQUARE ENIX CO., LTD.와 제휴하거나 공식적으로 승인받은 서비스가 아닌 팬 프로젝트입니다.',
            'FINAL FANTASY는 Square Enix Holdings Co., Ltd.의 등록 상표이며 게임 내 명칭, 아이콘, 스크린샷 등 관련 자료의 권리는 각 권리자에게 귀속됩니다. © SQUARE ENIX',
          ],
        },
      ],
    },
    faq: {
      title: '자주 묻는 질문',
      entries: [
        {
          question: '아이템 언어는 어떻게 바꾸나요?',
          answer: '오른쪽 위 언어 선택기에서 KR, EN, JA 중 원하는 언어를 선택하면 화면과 아이템 표시 언어가 함께 바뀝니다.',
        },
        {
          question: '모바일에서 저장한 이미지가 흐리게 보입니다.',
          answer: '카드는 고해상도로 생성됩니다. 일부 메신저가 이미지를 압축하므로 기기에 먼저 저장한 원본 파일을 사용해 주세요.',
        },
      ],
    },
    guide: {
      title: '투영 세트 메이커 공식 사용 가이드',
      intro: [
        '최종 수정일: 2026년 7월 25일',
        '이 문서는 현재 배포된 투영 세트 메이커의 실제 화면과 동작을 기준으로 작성되었습니다.',
        '사진 편집과 카드 생성은 브라우저에서 처리됩니다. 업로드한 사진은 카드 생성을 위해 서비스 서버에 업로드되지 않습니다.',
      ],
      howTitle: '카드 제작 순서',
      steps: [
        { title: '1. 사진 선택', description: '미리보기의 사진 영역을 누르거나 파일을 끌어다 놓습니다. JPEG, PNG, WebP, AVIF 형식을 지원하며 파일 크기는 25MB 이하여야 합니다.' },
        { title: '2. 사진 편집', description: '사진을 드래그해 위치를 옮기고 크기 조절 슬라이더로 확대합니다. 적용하기를 누르면 카드 비율에 맞춘 PNG 이미지가 브라우저 메모리에 생성됩니다.' },
        { title: '3. 장비 선택', description: '설정 영역에서 장비 부위를 선택한 뒤 아이템 이름을 검색합니다. 검색 결과를 선택하면 이름과 아이콘이 카드에 반영됩니다.' },
        { title: '4. 염색과 카드 정보 입력', description: '장비에 적용한 염색 이름을 선택하고 투영 세트명과 제작자 정보를 입력합니다. 입력 결과는 왼쪽 미리보기에 바로 반영됩니다.' },
        { title: '5. 프리셋 관리', description: '프리셋 이름을 입력해 현재 제목, 제작자, 장비, 염색 정보를 브라우저의 로컬 저장소에 저장합니다. 사진은 프리셋에 포함되지 않습니다.' },
        { title: '6. PNG 이미지 저장', description: '미리보기를 확인한 뒤 이미지 저장 버튼을 누릅니다. 기기 환경에 맞춰 2배 또는 3배 해상도로 렌더링한 PNG 파일을 내려받습니다.' },
      ],
      tipsTitle: '지원 범위와 주의사항',
      tips: [
        { title: '브라우저 저장소', description: '프리셋, 언어, 테마 설정은 현재 브라우저에 저장됩니다. 브라우저 사이트 데이터를 삭제하면 함께 제거될 수 있습니다.' },
        { title: '사진 처리', description: '선택한 사진은 브라우저 메모리에서 처리됩니다. 페이지를 새로 열면 사진을 다시 선택해야 합니다.' },
        { title: '아이템 데이터', description: '한국어·영어·일본어 이름을 검색할 수 있습니다. 최신 패치 직후에는 일부 아이템이 아직 검색되지 않을 수 있습니다.' },
        { title: '내보내기', description: '모바일·저사양 기기에서는 메모리 사용을 줄이기 위해 2배 해상도를 사용합니다. 데스크톱 환경에서는 최대 3배 해상도를 사용합니다.' },
      ],
      faqTitle: '문제 해결',
      entries: [
        { question: '사진을 선택할 수 없습니다.', answer: '파일 형식이 JPEG, PNG, WebP, AVIF 중 하나인지, 크기가 25MB 이하인지 확인해 주세요.' },
        { question: '사진 편집에서 적용하기 버튼이 활성화되지 않습니다.', answer: '편집 화면에서 사진을 한 번 움직이거나 확대해 자르기 영역 계산이 완료됐는지 확인해 주세요.' },
        { question: '저장한 프리셋이 보이지 않습니다.', answer: '프리셋은 저장한 브라우저의 로컬 저장소에만 보관됩니다. 다른 브라우저나 기기에는 자동으로 동기화되지 않습니다.' },
        { question: '프리셋을 불러왔는데 사진이 없습니다.', answer: '프리셋은 제목, 제작자, 장비, 염색 정보만 저장합니다. 사진은 서버나 로컬 저장소에 저장하지 않으므로 다시 선택해야 합니다.' },
        { question: 'PNG 이미지 저장에 실패했습니다.', answer: '잠시 후 다시 시도하고, 계속 실패하면 다른 탭을 닫아 메모리를 확보하거나 더 작은 원본 사진을 사용해 주세요.' },
        { question: '검색하려는 장비가 없습니다.', answer: '다른 지원 언어의 아이템명으로 검색해 보고, 그래도 나오지 않으면 오류 제보 기능으로 아이템 정보를 보내 주세요.' },
      ],
    },
    terms: {
      title: '이용약관',
      effectiveDate: '시행일: 2026년 7월 25일',
      sections: [
        { title: '1. 약관의 적용', paragraphs: ['투영 세트 메이커를 이용하면 본 약관에 동의한 것으로 봅니다. 본 약관은 서비스 이용에 필요한 권리와 책임을 정합니다.'] },
        { title: '2. 서비스의 성격', paragraphs: ['본 서비스는 파이널판타지14 이용자가 캐릭터 투영을 카드 이미지로 만들 수 있도록 돕는 비공식 팬 프로젝트이며 SQUARE ENIX CO., LTD.의 공식 서비스가 아닙니다. FFXIV 자료의 수익화 권리 확인 전까지 사이트의 광고 제공을 중단합니다.'] },
        { title: '3. 지적재산권', paragraphs: ['게임 관련 이미지, 아이템 명칭과 데이터의 권리는 각 원저작자에게 귀속됩니다. 사용자는 생성한 이미지를 게시하거나 공유할 때 SQUARE ENIX의 최신 자료 이용 조건을 확인하고 따라야 합니다.'] },
        { title: '4. 서비스 변경', paragraphs: ['개발자는 품질 개선을 위해 기능과 디자인을 변경할 수 있습니다. 개인 프로젝트의 특성상 서비스가 사전 안내 없이 중단될 수 있습니다.'] },
        { title: '5. 면책', paragraphs: ['서비스는 현재 상태로 제공됩니다. 법이 허용하는 범위에서 이용 중 발생한 데이터 유실이나 손해에 대한 책임을 보증하지 않습니다.'] },
      ],
    },
    privacy: {
      title: '개인정보처리방침',
      effectiveDate: '시행일: 2026년 7월 25일',
      sections: [
        { title: '1. 개인정보 최소 수집', paragraphs: ['투영 세트 메이커는 회원가입을 요구하지 않으며 이름, 이메일, 전화번호처럼 사용자를 식별할 수 있는 개인정보를 직접 수집하지 않습니다.'] },
        { title: '2. 브라우저에서 처리하는 정보', paragraphs: ['프리셋, 테마, 언어 설정은 사용자 브라우저의 로컬 저장소에 보관됩니다. 업로드한 이미지는 카드 생성을 위해 브라우저 메모리에서 처리되며 서비스 서버에 영구 저장되지 않습니다.'] },
        { title: '3. 광고 및 제3자 서비스', paragraphs: ['광고 제공은 현재 중단되어 있으며 페이지는 Google 광고 요청을 전송하지 않습니다. 사이트 소유권 확인을 위한 게시자 식별 정보와 ads.txt 파일은 유지될 수 있습니다.', '향후 광고를 다시 제공하는 경우 개인정보처리방침을 먼저 갱신하고, Google과 광고 기술 제공자가 쿠키, 로컬 저장소, IP 주소, 웹 비콘 및 기타 식별자를 처리하는 목적과 사용자 선택 방법을 공개합니다. 필요한 지역에는 Google 인증 동의 관리 플랫폼을 적용합니다.'] },
        { title: '4. 데이터 삭제', paragraphs: ['브라우저의 사이트 데이터 또는 인터넷 사용 기록을 삭제하면 로컬에 저장된 설정과 프리셋을 지울 수 있습니다.'] },
        { title: '5. 문의', paragraphs: ['개인정보 처리와 관련된 문의는 개발자 Twitter/X 계정으로 전달해 주세요.'] },
      ],
    },
  },
  en: {
    backHome: 'Back to maker',
    about: {
      title: 'About Glamour Set Maker',
      contactLabel: 'Twitter/X',
      sections: [
        {
          title: 'Service features',
          paragraphs: [
            'Glamour Set Maker is a browser app that combines a Final Fantasy XIV character portrait with equipment and dye details in one card.',
            'It supports portrait cropping, Korean, English, and Japanese item search, local presets, and high-resolution PNG export.',
          ],
        },
        {
          title: 'Data and operation',
          paragraphs: [
            'Item names and icon paths come from XIVAPI-based data. Use the site report function for missing or incorrect entries.',
            'Advertising is currently paused. Send product questions, bug reports, and data corrections to the operator.',
          ],
        },
        {
          title: 'Disclaimer',
          paragraphs: [
            'This website is a fan project and is not affiliated with or endorsed by SQUARE ENIX CO., LTD. FINAL FANTASY and all in-game names and images belong to their respective owners.',
          ],
        },
      ],
    },
    faq: {
      title: 'Frequently asked questions',
      entries: [
        {
          question: 'How do I change the item language?',
          answer: 'Choose KR, EN, or JA from the language selector in the upper-right corner. The interface and item display language change together.',
        },
        {
          question: 'Why does my saved image look blurry on mobile?',
          answer: 'Cards are generated at high resolution. Some messaging apps compress images, so save the original file to your device before sharing it.',
        },
      ],
    },
    guide: {
      title: 'Official Glamour Set Maker user guide',
      intro: [
        'Last updated: July 25, 2026',
        'This guide describes the controls and behavior in the current deployed version.',
        'Portrait editing and card generation run in your browser. Selected photos are not uploaded to the service server.',
      ],
      howTitle: 'Card creation workflow',
      steps: [
        { title: '1. Choose a photo', description: 'Select the photo panel or drop a JPEG, PNG, WebP, or AVIF file of 25 MB or less.' },
        { title: '2. Edit the photo', description: 'Drag the portrait to position it, adjust zoom, and apply the crop for the card.' },
        { title: '3. Select equipment', description: 'Choose an equipment slot, search by item name, and select a result to add its name and icon.' },
        { title: '4. Add dyes and card details', description: 'Choose dye names, then enter the glamour set title and creator shown in the preview.' },
        { title: '5. Manage presets', description: 'Save the title, creator, equipment, and dyes in this browser’s local storage. Photos are not included.' },
        { title: '6. Save a PNG', description: 'Use Save Image to export the preview at 2× or 3× resolution according to the device environment.' },
      ],
      tipsTitle: 'Supported behavior and limitations',
      tips: [
        { title: 'Browser storage', description: 'Presets, language, and theme settings can be removed when you clear this site’s browser data.' },
        { title: 'Photo processing', description: 'The photo stays in browser memory and must be selected again after reopening the page.' },
        { title: 'Item data', description: 'New patch items may not appear immediately. Search with another supported language or report a missing entry.' },
        { title: 'Export resolution', description: 'Mobile and lower-memory devices use 2× output; suitable desktop environments use up to 3× output.' },
      ],
      faqTitle: 'Troubleshooting',
      entries: [
        { question: 'Why can’t I select my photo?', answer: 'Confirm that the file is JPEG, PNG, WebP, or AVIF and no larger than 25 MB.' },
        { question: 'Why is Apply disabled in the crop editor?', answer: 'Move or zoom the portrait once and wait for the crop area to be calculated.' },
        { question: 'Where are presets stored?', answer: 'Presets remain only in the current browser’s local storage and do not sync to other devices.' },
        { question: 'Why is the photo missing from a restored preset?', answer: 'Presets contain card text, equipment, and dyes. They intentionally do not store the photo.' },
        { question: 'What should I do if PNG export fails?', answer: 'Retry after closing other tabs to free memory, or use a smaller source image.' },
      ],
    },
    terms: {
      title: 'Terms of service',
      effectiveDate: 'Effective date: July 25, 2026',
      sections: [
        { title: '1. Acceptance', paragraphs: ['By using Glamour Set Maker, you agree to these terms. They describe the rights and responsibilities involved in using the service.'] },
        { title: '2. Nature of the service', paragraphs: ['This is an unofficial fan project that helps Final Fantasy XIV players create card images of their character outfits. It is not an official SQUARE ENIX CO., LTD. service. Advertising remains paused while monetization rights for FFXIV materials are reviewed.'] },
        { title: '3. Intellectual property', paragraphs: ['Game images, item names, and data belong to their respective owners. Generated images must follow the SQUARE ENIX Materials Usage License and may not be sold commercially.'] },
        { title: '4. Changes and availability', paragraphs: ['Features and design may change to improve the service. As a personal project, the service may be interrupted or discontinued without advance notice.'] },
        { title: '5. Disclaimer', paragraphs: ['The service is provided as is. To the extent permitted by law, no guarantee is made against data loss or other damage arising from its use.'] },
      ],
    },
    privacy: {
      title: 'Privacy policy',
      effectiveDate: 'Effective date: July 25, 2026',
      sections: [
        { title: '1. Minimal data collection', paragraphs: ['Glamour Set Maker does not require an account and does not directly collect identifying information such as your name, email address, or phone number.'] },
        { title: '2. Browser data', paragraphs: ['Presets, theme, and language settings remain in your browser storage. Uploaded images are processed in browser memory and are not permanently stored on the service server.'] },
        { title: '3. Advertising and third-party services', paragraphs: ['Advertising is currently paused and pages do not send Google ad requests. Publisher ownership metadata and ads.txt may remain for site verification.', 'Before advertising resumes, this policy will disclose how Google and advertising providers use cookies, local storage, IP addresses, web beacons, and other identifiers, and a certified consent solution will be applied where required.'] },
        { title: '4. Deleting data', paragraphs: ['Clear this site’s browser data or browsing history to remove locally stored settings and presets.'] },
        { title: '5. Contact', paragraphs: ['Send privacy questions to the developer through the Twitter/X account listed on the About page.'] },
      ],
    },
  },
  ja: {
    backHome: 'メイン画面に戻る',
    about: {
      title: 'ミラプリセットメーカーについて',
      contactLabel: 'Twitter/X',
      sections: [
        {
          title: 'サービス機能',
          paragraphs: [
            'ミラプリセットメーカーは、ファイナルファンタジーXIVのキャラクター写真と装備・カララント情報を一枚のカードにまとめるブラウザアプリです。',
            '写真のトリミング、韓国語・英語・日本語のアイテム検索、ローカルプリセット、高解像度PNG出力に対応します。',
          ],
        },
        {
          title: 'データと運営',
          paragraphs: ['アイテム名とアイコンパスはXIVAPIベースのデータを使用しています。広告配信は現在停止中です。お問い合わせやデータ修正依頼は運営者までお寄せください。'],
        },
        {
          title: '免責事項',
          paragraphs: [
            '本サイトはファンプロジェクトであり、SQUARE ENIX CO., LTD.との提携や公式な承認を受けたサービスではありません。FINAL FANTASYおよびゲーム内の名称・画像の権利は各権利者に帰属します。',
          ],
        },
      ],
    },
    faq: {
      title: 'よくある質問',
      entries: [
        {
          question: 'アイテムの表示言語はどう変更しますか？',
          answer: '右上の言語選択でKR、EN、JAから選んでください。画面とアイテムの表示言語が一緒に切り替わります。',
        },
        {
          question: 'モバイルで保存した画像がぼやけて見えます。',
          answer: 'カードは高解像度で生成されます。一部のメッセージアプリは画像を圧縮するため、端末に保存した元のファイルをご利用ください。',
        },
      ],
    },
    guide: {
      title: 'ミラプリセットメーカー公式ガイド',
      intro: [
        '最終更新日：2026年7月25日',
        'このガイドは現在公開中の画面と動作に基づいています。',
        '写真編集とカード生成はブラウザ内で処理され、選択した写真はサービスのサーバーへアップロードされません。',
      ],
      howTitle: 'カード作成手順',
      steps: [
        { title: '1. 写真を選択', description: '写真エリアを押すか、25MB以下のJPEG、PNG、WebP、AVIFファイルをドロップします。' },
        { title: '2. 写真を編集', description: '写真をドラッグして位置を調整し、ズーム後に適用します。' },
        { title: '3. 装備を選択', description: '部位を選び、アイテム名で検索して結果をカードに追加します。' },
        { title: '4. カララントとカード情報を入力', description: 'カララント名、セット名、製作者情報を入力します。' },
        { title: '5. プリセットを管理', description: 'タイトル、製作者、装備、カララントをこのブラウザのローカルストレージに保存します。写真は含まれません。' },
        { title: '6. PNG画像を保存', description: '画像保存を押し、端末環境に応じた2倍または3倍解像度のPNGを出力します。' },
      ],
      tipsTitle: '対応範囲と注意事項',
      tips: [
        { title: 'ブラウザ保存', description: 'プリセット、言語、テーマはサイトデータを削除すると消える場合があります。' },
        { title: '写真処理', description: '写真はブラウザメモリで処理され、ページを開き直すと再選択が必要です。' },
        { title: 'アイテムデータ', description: '最新パッチ直後は一部アイテムが検索できない場合があります。' },
        { title: '出力解像度', description: 'モバイルや低メモリ端末は2倍、対応するデスクトップ環境は最大3倍で出力します。' },
      ],
      faqTitle: 'トラブルシューティング',
      entries: [
        { question: '写真を選択できません。', answer: 'JPEG、PNG、WebP、AVIF形式で25MB以下か確認してください。' },
        { question: '写真編集の適用ボタンが有効になりません。', answer: '写真を一度移動または拡大し、切り抜き範囲の計算を待ってください。' },
        { question: 'プリセットはどこに保存されますか？', answer: '現在のブラウザのローカルストレージだけに保存され、他の端末へ同期されません。' },
        { question: 'プリセットに写真がありません。', answer: 'プリセットはカード情報、装備、カララントのみを保存し、写真は保存しません。' },
        { question: 'PNG保存に失敗します。', answer: '他のタブを閉じてメモリを確保するか、より小さい元画像で再試行してください。' },
      ],
    },
    terms: {
      title: '利用規約',
      effectiveDate: '施行日：2026年7月25日',
      sections: [
        { title: '1. 規約への同意', paragraphs: ['ミラプリセットメーカーを利用することで、本規約に同意したものとみなします。本規約はサービス利用に関する権利と責任を定めます。'] },
        { title: '2. サービスの性質', paragraphs: ['本サービスは、ファイナルファンタジーXIVのプレイヤーがキャラクターコーデをカード画像にするための非公式ファンプロジェクトです。SQUARE ENIX CO., LTD.の公式サービスではありません。FFXIV素材の収益化権利を確認するまで広告配信を停止します。'] },
        { title: '3. 知的財産権', paragraphs: ['ゲーム画像、アイテム名、データの権利は各権利者に帰属します。生成画像の利用はSQUARE ENIXの著作物利用条件に従い、商業目的で販売することはできません。'] },
        { title: '4. 変更・提供', paragraphs: ['品質向上のため機能やデザインを変更する場合があります。個人プロジェクトのため、事前の告知なく中断または終了することがあります。'] },
        { title: '5. 免責', paragraphs: ['本サービスは現状のまま提供されます。法令で認められる範囲において、利用により生じたデータ消失その他の損害を保証しません。'] },
      ],
    },
    privacy: {
      title: 'プライバシーポリシー',
      effectiveDate: '施行日：2026年7月25日',
      sections: [
        { title: '1. 最小限の情報収集', paragraphs: ['ミラプリセットメーカーは会員登録を求めず、氏名、メールアドレス、電話番号など個人を特定できる情報を直接収集しません。'] },
        { title: '2. ブラウザ内のデータ', paragraphs: ['プリセット、テーマ、言語設定はブラウザのローカル保存領域に保管されます。アップロード画像はブラウザメモリで処理され、サービスのサーバーに恒久保存されません。'] },
        { title: '3. 広告・外部サービス', paragraphs: ['広告配信は現在停止しており、ページからGoogle広告リクエストは送信されません。サイト確認用のパブリッシャー情報とads.txtは保持される場合があります。', '広告を再開する前に、Cookie、ローカルストレージ、IPアドレス、ウェブビーコンなどの処理目的と選択方法を開示し、必要な地域では認定同意管理プラットフォームを適用します。'] },
        { title: '4. データの削除', paragraphs: ['ブラウザのサイトデータまたは閲覧履歴を削除すると、端末内に保存された設定とプリセットを削除できます。'] },
        { title: '5. お問い合わせ', paragraphs: ['プライバシーに関するご質問は、概要ページに記載された開発者のTwitter/Xアカウントまでお寄せください。'] },
      ],
    },
  },
};

export function useLocalizedPageContent(): LocalizedPageContent {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.split('-')[0] || i18n.language.split('-')[0];
  return localizedPageContent[language as SupportedLanguage] || localizedPageContent.ko;
}
