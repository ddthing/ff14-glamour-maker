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

const content: Record<SupportedLanguage, LocalizedPageContent> = {
  ko: {
    backHome: '메인으로 돌아가기',
    about: {
      title: '투영 세트 메이커 소개',
      contactLabel: 'Twitter/X',
      sections: [
        {
          title: '서비스 목표',
          paragraphs: [
            '투영 세트 메이커는 빛의 전사들이 정성껏 완성한 캐릭터 투영을 보기 좋은 카드로 정리할 수 있도록 만든 도구입니다.',
            '복잡한 편집 프로그램 없이도 고화질 투영 카드를 쉽고 안정적으로 만드는 것을 목표로 합니다.',
          ],
        },
        {
          title: '문의 및 지원',
          paragraphs: ['문의, 오류 제보, 기능 제안은 개발자에게 전달해 주세요.'],
        },
        {
          title: '안내',
          paragraphs: [
            '이 웹사이트는 팬 프로젝트이며 SQUARE ENIX CO., LTD.와 제휴하거나 공식적으로 승인받은 서비스가 아닙니다. FINAL FANTASY 및 게임 내 명칭과 이미지는 각 권리자에게 귀속됩니다.',
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
      title: '투영 세트 메이커 사용 가이드',
      intro: [
        '캐릭터 사진과 장비 정보를 한 장의 투영 카드로 정리할 수 있습니다.',
        '모든 작업은 브라우저에서 진행되며 완성한 카드는 고화질 PNG 이미지로 저장됩니다.',
      ],
      howTitle: '사용 방법',
      steps: [
        { title: '사진 업로드', description: '캐릭터 스크린샷을 선택하고 카드에 맞게 위치와 크기를 조절합니다.' },
        { title: '장비 정보 입력', description: '부위별 장비를 검색하고 필요한 경우 염색 정보를 지정합니다.' },
        { title: '이미지 저장', description: '미리보기를 확인한 뒤 이미지 저장 버튼으로 고화질 카드를 내려받습니다.' },
      ],
      tipsTitle: '더 좋은 카드를 위한 팁',
      tips: [
        { title: '조명', description: '그룹 포즈 조명이나 밝은 장소를 활용하면 캐릭터가 더 또렷하게 보입니다.' },
        { title: '배경', description: '복잡하지 않은 배경은 투영과 장비 정보에 시선을 모아 줍니다.' },
        { title: '염색 정보', description: '염색 이름을 한 번 더 확인하면 다른 사용자가 세트를 재현하기 쉽습니다.' },
      ],
      faqTitle: '가이드 질문',
      entries: [
        { question: '무료로 사용할 수 있나요?', answer: '네. 모든 빛의 전사가 무료로 사용할 수 있습니다.' },
        { question: '사진이 서버에 저장되나요?', answer: '아니요. 업로드한 사진은 카드 생성을 위해 브라우저에서만 처리됩니다.' },
      ],
    },
    terms: {
      title: '이용약관',
      effectiveDate: '시행일: 2026년 5월 5일',
      sections: [
        { title: '1. 약관의 적용', paragraphs: ['투영 세트 메이커를 이용하면 본 약관에 동의한 것으로 봅니다. 본 약관은 서비스 이용에 필요한 권리와 책임을 정합니다.'] },
        { title: '2. 서비스의 성격', paragraphs: ['본 서비스는 파이널판타지14 이용자가 자신의 캐릭터 투영을 카드 이미지로 만들 수 있도록 돕는 비영리 팬 프로젝트이며 SQUARE ENIX CO., LTD.의 공식 서비스가 아닙니다.'] },
        { title: '3. 지적재산권', paragraphs: ['게임 관련 이미지, 아이템 명칭과 데이터의 권리는 각 원저작자에게 귀속됩니다. 생성한 이미지를 사용할 때에는 SQUARE ENIX의 저작물 이용 지침을 따라야 하며 상업적으로 판매할 수 없습니다.'] },
        { title: '4. 서비스 변경', paragraphs: ['개발자는 품질 개선을 위해 기능과 디자인을 변경할 수 있습니다. 개인 프로젝트의 특성상 서비스가 사전 안내 없이 중단될 수 있습니다.'] },
        { title: '5. 면책', paragraphs: ['서비스는 현재 상태로 제공됩니다. 법이 허용하는 범위에서 이용 중 발생한 데이터 유실이나 손해에 대한 책임을 보증하지 않습니다.'] },
      ],
    },
    privacy: {
      title: '개인정보처리방침',
      effectiveDate: '시행일: 2026년 5월 5일',
      sections: [
        { title: '1. 개인정보 최소 수집', paragraphs: ['투영 세트 메이커는 회원가입을 요구하지 않으며 이름, 이메일, 전화번호처럼 사용자를 식별할 수 있는 개인정보를 직접 수집하지 않습니다.'] },
        { title: '2. 브라우저에서 처리하는 정보', paragraphs: ['프리셋, 테마, 언어 설정은 사용자 브라우저의 로컬 저장소에 보관됩니다. 업로드한 이미지는 카드 생성을 위해 브라우저 메모리에서 처리되며 서비스 서버에 영구 저장되지 않습니다.'] },
        { title: '3. 제3자 서비스', paragraphs: ['서비스 운영을 위해 Google AdSense 같은 제3자 도구가 사용될 수 있으며 해당 제공자의 정책에 따라 쿠키나 익명화된 이용 정보가 처리될 수 있습니다.'] },
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
          title: 'Our mission',
          paragraphs: [
            'Glamour Set Maker helps Warriors of Light present their carefully crafted outfits in a clear, polished card.',
            'Our goal is to make high-resolution glamour cards easy to create without requiring image-editing software.',
          ],
        },
        {
          title: 'Contact and support',
          paragraphs: ['Send questions, bug reports, and feature suggestions directly to the developer.'],
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
      title: 'Glamour Set Maker guide',
      intro: [
        'Turn a character portrait and equipment details into one clear glamour card.',
        'Everything runs in your browser, and the finished card downloads as a high-resolution PNG image.',
      ],
      howTitle: 'How to use it',
      steps: [
        { title: 'Upload a portrait', description: 'Choose a character screenshot, then adjust its position and scale for the card.' },
        { title: 'Add equipment', description: 'Search for gear by slot and add dye information when needed.' },
        { title: 'Save the image', description: 'Review the preview and use Save Image to download the high-resolution card.' },
      ],
      tipsTitle: 'Tips for a clearer card',
      tips: [
        { title: 'Lighting', description: 'Use Group Pose lighting or a bright location to keep your character easy to see.' },
        { title: 'Background', description: 'A simple background keeps attention on the outfit and equipment details.' },
        { title: 'Dye names', description: 'Double-check dye names so other players can reproduce the set accurately.' },
      ],
      faqTitle: 'Guide questions',
      entries: [
        { question: 'Is the tool free?', answer: 'Yes. It is free for every Warrior of Light to use.' },
        { question: 'Are my photos stored on a server?', answer: 'No. Uploaded photos are processed in your browser for card generation.' },
      ],
    },
    terms: {
      title: 'Terms of service',
      effectiveDate: 'Effective date: May 5, 2026',
      sections: [
        { title: '1. Acceptance', paragraphs: ['By using Glamour Set Maker, you agree to these terms. They describe the rights and responsibilities involved in using the service.'] },
        { title: '2. Nature of the service', paragraphs: ['This is a non-commercial fan project that helps Final Fantasy XIV players create card images of their character outfits. It is not an official SQUARE ENIX CO., LTD. service.'] },
        { title: '3. Intellectual property', paragraphs: ['Game images, item names, and data belong to their respective owners. Generated images must follow the SQUARE ENIX Materials Usage License and may not be sold commercially.'] },
        { title: '4. Changes and availability', paragraphs: ['Features and design may change to improve the service. As a personal project, the service may be interrupted or discontinued without advance notice.'] },
        { title: '5. Disclaimer', paragraphs: ['The service is provided as is. To the extent permitted by law, no guarantee is made against data loss or other damage arising from its use.'] },
      ],
    },
    privacy: {
      title: 'Privacy policy',
      effectiveDate: 'Effective date: May 5, 2026',
      sections: [
        { title: '1. Minimal data collection', paragraphs: ['Glamour Set Maker does not require an account and does not directly collect identifying information such as your name, email address, or phone number.'] },
        { title: '2. Browser data', paragraphs: ['Presets, theme, and language settings remain in your browser storage. Uploaded images are processed in browser memory and are not permanently stored on the service server.'] },
        { title: '3. Third-party services', paragraphs: ['Third-party tools such as Google AdSense may be used to operate the service. Those providers may process cookies or anonymized usage data under their own policies.'] },
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
          title: 'サービスの目的',
          paragraphs: [
            'ミラプリセットメーカーは、光の戦士がこだわって作ったコーデを見やすいカードにまとめるためのツールです。',
            '画像編集ソフトを使わず、高画質なミラプリカードを簡単かつ安定して作れることを目指しています。',
          ],
        },
        {
          title: 'お問い合わせ・サポート',
          paragraphs: ['ご質問、不具合報告、機能のご提案は開発者までお寄せください。'],
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
      title: 'ミラプリセットメーカーの使い方',
      intro: [
        'キャラクター写真と装備情報を一枚のミラプリカードにまとめられます。',
        'すべてブラウザ内で処理され、完成したカードは高解像度PNG画像として保存されます。',
      ],
      howTitle: '作成手順',
      steps: [
        { title: '写真をアップロード', description: 'キャラクターのスクリーンショットを選び、カードに合わせて位置と大きさを調整します。' },
        { title: '装備情報を入力', description: '部位ごとに装備を検索し、必要に応じてカララントを指定します。' },
        { title: '画像を保存', description: 'プレビューを確認し、画像保存ボタンから高解像度カードをダウンロードします。' },
      ],
      tipsTitle: '見やすいカードのコツ',
      tips: [
        { title: 'ライティング', description: 'グループポーズのライトや明るい場所を使うとキャラクターが見やすくなります。' },
        { title: '背景', description: 'シンプルな背景はミラプリと装備情報を引き立てます。' },
        { title: 'カララント名', description: '名称を再確認すると、ほかのプレイヤーがセットを再現しやすくなります。' },
      ],
      faqTitle: 'ガイドの質問',
      entries: [
        { question: '無料で使えますか？', answer: 'はい。すべての光の戦士が無料で利用できます。' },
        { question: '写真はサーバーに保存されますか？', answer: 'いいえ。アップロードした写真はカード生成のためにブラウザ内で処理されます。' },
      ],
    },
    terms: {
      title: '利用規約',
      effectiveDate: '施行日：2026年5月5日',
      sections: [
        { title: '1. 規約への同意', paragraphs: ['ミラプリセットメーカーを利用することで、本規約に同意したものとみなします。本規約はサービス利用に関する権利と責任を定めます。'] },
        { title: '2. サービスの性質', paragraphs: ['本サービスは、ファイナルファンタジーXIVのプレイヤーがキャラクターコーデをカード画像にするための非営利ファンプロジェクトです。SQUARE ENIX CO., LTD.の公式サービスではありません。'] },
        { title: '3. 知的財産権', paragraphs: ['ゲーム画像、アイテム名、データの権利は各権利者に帰属します。生成画像の利用はSQUARE ENIXの著作物利用条件に従い、商業目的で販売することはできません。'] },
        { title: '4. 変更・提供', paragraphs: ['品質向上のため機能やデザインを変更する場合があります。個人プロジェクトのため、事前の告知なく中断または終了することがあります。'] },
        { title: '5. 免責', paragraphs: ['本サービスは現状のまま提供されます。法令で認められる範囲において、利用により生じたデータ消失その他の損害を保証しません。'] },
      ],
    },
    privacy: {
      title: 'プライバシーポリシー',
      effectiveDate: '施行日：2026年5月5日',
      sections: [
        { title: '1. 最小限の情報収集', paragraphs: ['ミラプリセットメーカーは会員登録を求めず、氏名、メールアドレス、電話番号など個人を特定できる情報を直接収集しません。'] },
        { title: '2. ブラウザ内のデータ', paragraphs: ['プリセット、テーマ、言語設定はブラウザのローカル保存領域に保管されます。アップロード画像はブラウザメモリで処理され、サービスのサーバーに恒久保存されません。'] },
        { title: '3. 外部サービス', paragraphs: ['運営のためGoogle AdSenseなどの外部サービスを利用する場合があります。各提供者の方針に基づきCookieや匿名化された利用情報が処理されることがあります。'] },
        { title: '4. データの削除', paragraphs: ['ブラウザのサイトデータまたは閲覧履歴を削除すると、端末内に保存された設定とプリセットを削除できます。'] },
        { title: '5. お問い合わせ', paragraphs: ['プライバシーに関するご質問は、概要ページに記載された開発者のTwitter/Xアカウントまでお寄せください。'] },
      ],
    },
  },
};

export function useLocalizedPageContent(): LocalizedPageContent {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.split('-')[0] || i18n.language.split('-')[0];
  return content[language as SupportedLanguage] || content.ko;
}
