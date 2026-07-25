import { describe, expect, it } from 'vitest';
import { localizedPageContent } from './localizedPages';

describe('official Korean product documentation', () => {
  it('documents the verified maker workflow and limits', () => {
    const guide = localizedPageContent.ko.guide;
    const searchableText = JSON.stringify(guide);

    expect(guide.steps.map(step => step.title)).toEqual([
      '1. 사진 선택',
      '2. 사진 편집',
      '3. 장비 선택',
      '4. 염색과 카드 정보 입력',
      '5. 프리셋 관리',
      '6. PNG 이미지 저장',
    ]);
    expect(searchableText).toContain('JPEG, PNG, WebP, AVIF');
    expect(searchableText).toContain('25MB');
    expect(searchableText).toContain('브라우저의 로컬 저장소');
    expect(searchableText).toContain('서버에 업로드되지 않습니다');
    expect(guide.entries.length).toBeGreaterThanOrEqual(5);
  });

  it('states the actual paused advertising and data-processing position', () => {
    const privacyText = JSON.stringify(localizedPageContent.ko.privacy);
    const termsText = JSON.stringify(localizedPageContent.ko.terms);
    const aboutText = JSON.stringify(localizedPageContent.ko.about);

    expect(privacyText).toContain('광고 제공은 현재 중단');
    expect(privacyText).toContain('IP 주소');
    expect(privacyText).toContain('웹 비콘');
    expect(privacyText).toContain('브라우저의 로컬 저장소');
    expect(termsText).not.toContain('비영리 팬 프로젝트');
    expect(termsText).toContain('광고 제공을 중단');
    expect(aboutText).toContain('XIVAPI');
  });

  it('keeps policy revision dates aligned across supported languages', () => {
    expect(localizedPageContent.ko.privacy.effectiveDate).toContain('2026년 7월 25일');
    expect(localizedPageContent.en.privacy.effectiveDate).toContain('July 25, 2026');
    expect(localizedPageContent.ja.privacy.effectiveDate).toContain('2026年7月25日');
  });
});
