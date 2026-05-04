import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ko',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      ko: {
        translation: {
          common: {
            title: '투영 세트명',
            creator: '제작자',
            reset: '초기화',
            save: '이미지 저장',
            saving: '저장 중...',
            input_set_name: '예) 여코테 소소한 캐주얼룩',
            input_creator: '예) @트위터아이디 또는 서버-닉네임',
            info_entry: '투영 정보 입력',
            search_item: '아이템 검색...',
            search_dye: '염색',
            close: '닫기',
            update: '업데이트',
            new_updates: '새로운 소식',
            confirm: '확인',
            hide_version: '이 버전 다시 보지 않기',
            title_brand: '투영 메이커',
            view_changelog: '공지사항 및 업데이트',
            to_light: '라이트 모드로 전환',
            to_dark: '다크 모드로 전환',
            zoom: '크기 조절',
            cancel: '취소',
            replace_image: '이미지 교체',
            upload_hint: '클릭하거나 사진을 끌어다 놓으세요',
            drop_image: '사진을 여기에 놓으세요',
            loading: '데이터를 불러오는 중...',
            no_results: '결과 없음',
            presets_title: '저장된 프리셋',
            presets_placeholder: '새 프리셋 이름 (예: 본캐 닌자)',
            presets_save: '저장',
            presets_empty: '프리셋 이름을 입력해주세요.'
          },
          slots: {
            mainhand: '무기',
            head: '머리',
            body: '상의',
            hands: '장갑',
            legs: '하의',
            feet: '신발',
            ears: '귀걸이',
            neck: '목걸이',
            wrists: '팔찌',
            rings: '반지',
            face: '얼굴 소품'
          }
        }
      },
      en: {
        translation: {
          common: {
            title: 'Glamour Set Name',
            creator: 'Creator',
            reset: 'Reset',
            save: 'Save Image',
            saving: 'Saving...',
            input_set_name: 'e.g. Casual Look',
            input_creator: 'e.g. @TwitterID or Server-Name',
            info_entry: 'Item Info',
            search_item: 'Search Item...',
            search_dye: 'Dye',
            close: 'Close',
            update: 'UPDATE',
            new_updates: "What's New",
            confirm: 'Confirm',
            hide_version: "Don't show for this version",
            title_brand: 'FFXIV Glamour Maker',
            view_changelog: 'View Changelog',
            to_light: 'Switch to light mode',
            to_dark: 'Switch to dark mode',
            zoom: 'Zoom',
            cancel: 'Cancel',
            replace_image: 'Replace Image',
            upload_hint: 'Click or drag and drop your photo',
            drop_image: 'Drop to load image',
            loading: 'Loading data...',
            no_results: 'No results',
            presets_title: 'Saved Presets',
            presets_placeholder: 'New preset name (e.g. Healer)',
            presets_save: 'Save',
            presets_empty: 'Please enter a preset name.'
          },
          slots: {
            mainhand: 'Main Hand',
            head: 'Head',
            body: 'Body',
            hands: 'Hands',
            legs: 'Legs',
            feet: 'Feet',
            ears: 'Earrings',
            neck: 'Necklace',
            wrists: 'Bracelets',
            rings: 'Ring',
            face: 'Face Accessory'
          }
        }
      },
      ja: {
        translation: {
          common: {
            title: 'ミラプリセット名',
            creator: '製作者',
            reset: '初期化',
            save: '画像保存',
            saving: '保存中...',
            input_set_name: '例) カジュアルルック',
            input_creator: '例) @TwitterID または サーバー-名前',
            info_entry: '投影情報入力',
            search_item: 'アイテム検索...',
            search_dye: 'カララント',
            close: '閉じる',
            update: 'アップデート',
            new_updates: '最新情報',
            confirm: '確認',
            hide_version: 'このバージョンを再表示しない',
            title_brand: 'FFXIV ミラプリメーカー',
            view_changelog: 'お知らせとアップデート',
            to_light: 'ライトモードに切り替え',
            to_dark: 'ダークモードに切り替え',
            zoom: 'ズーム',
            cancel: 'キャンセル',
            replace_image: '画像変更',
            upload_hint: 'クリック または 写真をドラッグ＆ドロップ',
            drop_image: 'ここへドロップ',
            loading: 'データを読み込み中...',
            no_results: '結果なし',
            presets_title: '保存されたプリセット',
            presets_placeholder: '新しいプリセット名（例：メイン忍者）',
            presets_save: '保存',
            presets_empty: 'プリセット名を入力してください。'
          },
          slots: {
            mainhand: '主武器',
            head: '頭防具',
            body: '胴防具',
            hands: '手防具',
            legs: '脚防具',
            feet: '足防具',
            ears: '耳飾り',
            neck: '首飾り',
            wrists: '腕輪',
            rings: '指輪',
            face: 'フェイスアクセサリー'
          }
        }
      }
    }
  });

export default i18n;
