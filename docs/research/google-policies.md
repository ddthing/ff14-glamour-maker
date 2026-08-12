# FF14 Glamour Maker: Google Search·AdSense 정책 조사

**조사일:** 2026-08-13
**범위:** Google Search Central, Google AdSense 공식 정책·도움말만 조사
**목적:** /guide, /faq, /about, /terms, /privacy의 콘텐츠·구조·광고·SEO 개선 우선순위 정리

이 문서는 정책을 충족한다고 선언하는 인증서가 아니다. Google 정책과 검색 시스템은 바뀔 수 있으므로 배포 전 Search Console의 URL 검사·리치 결과 테스트·AdSense 정책 센터에서 다시 확인해야 한다. 법률 자문이 아니며, 개인정보처리방침과 동의 문구는 실제 데이터 흐름과 방문자 지역을 기준으로 검토해야 한다.

### 관찰 기준

이 조사는 커밋된 HEAD와 조사 시점의 working tree를 함께 읽어 작성했다. working tree에는 콘텐츠·metadata·페이지 레이아웃을 확장하는 미커밋 변경이 이미 있었으므로 이를 보존했으며, 이 문서가 해당 변경을 구현하거나 검증했다는 뜻은 아니다. 특히 새 ContentPageLayout은 현재 페이지에서 사용되고 있지 않고, Header의 page 인자도 정보 페이지에서 전달되지 않는 상태로 확인되어, 아래의 SPA metadata 위험은 실제 배포 전까지 남아 있는 것으로 판단한다.

## 요약

현재 저장소는 Footer에서 다섯 개의 정보 페이지로 연결하고, index.html에 AdSense 스크립트와 WebApplication JSON-LD를 넣어 둔 상태다. 그러나 다음 항목은 콘텐츠를 늘리기 전에 우선 확인해야 한다.

| 우선순위 | 확인 결과 | 권장 조치 |
| --- | --- | --- |
| P0 | public/robots.txt가 /assets/를 차단한다. Vite 빌드의 JS/CSS가 이 경로에 놓인다면 Google이 SPA를 정상 렌더링하지 못할 수 있다. | 렌더링에 필요한 JS/CSS를 차단하지 않도록 robots 정책을 재검토하고, 배포 URL을 URL 검사로 확인한다. |
| P0 | /privacy도 SPA fallback으로 같은 index.html을 받으며, 그 HTML에 AdSense 스크립트가 있다. AdSense의 privacy policy URL 안내는 정책 페이지에 동의가 필요한 스크립트·광고 태그를 두지 않도록 안내한다. | 개인정보처리방침 페이지를 광고 태그 없는 경로/템플릿으로 제공하거나, CMP 설정에 맞춰 광고 태그가 로드되지 않게 분리한다. |
| P0 | HEAD의 개인정보처리방침은 AdSense의 쿠키·웹 비콘·IP/식별자·제3자 공급자·개인 맞춤 광고 선택권을 충분히 구체적으로 설명하지 않는다. working tree에는 확장 문구가 있지만 아직 미커밋·미검증이다. | 실제 광고·분석·저장 흐름을 목록화하고, Google이 요구하는 공개 항목과 EEA/영국/스위스 동의 흐름을 반영한다. |
| P1 | sitemap에는 /, /privacy, /terms만 있고 Footer의 /guide, /faq, /about가 빠져 있다. | 검색 결과에 노출할 고유 페이지를 sitemap에 추가하고 각 URL의 canonical·언어 전략을 일관되게 만든다. |
| P1 | SPA 초기 HTML의 canonical/OG URL은 루트다. working tree에는 page-aware metadata 구현이 있지만 정보 페이지에 page 키를 전달하는 연결이 아직 확인되지 않았다. | 페이지별 title, description, canonical, OG 정보가 실제 경로와 일치하는지 보장하고 렌더링된 HTML을 검사한다. |
| P1 | HEAD 기준 콘텐츠는 짧았고, 현재 working tree에는 가이드·FAQ·소개·법적 문서를 확장하는 미커밋 변경이 있다. 그러나 새 레이아웃과 페이지별 metadata 연결은 아직 런타임에서 확인되지 않았다. | 확장된 문구를 실제 렌더링 페이지에 연결하고, 번역 품질·데이터 처리 설명·정책 문구의 사실성을 검토한다. 가이드는 시각적 단계별 안내를 유지한다. |
| P1 | 실제 페이지 런타임에서는 index.html의 WebApplication 한 블록이 기본이며, working tree에는 미연결된 WebPage/BreadcrumbList 생성 코드가 있다. FAQPage 리치 결과는 현재 일반 사이트에 정기적으로 제공되지 않는다. | 홈에는 WebSite/앱 정보를 정확히 유지하고, 하위 페이지에는 보이는 breadcrumb가 있을 때만 BreadcrumbList를 추가한다. 가짜 평점·FAQ 리치 결과용 마크업은 추가하지 않는다. |
| P1 | 현재 사진은 브라우저에서 처리하는 구조라 공개 UGC 저장소와는 범위가 다르다. 향후 공개 갤러리·공유 업로드를 추가하면 광고가 있는 모든 화면의 UGC도 게시자 책임 범위에 들어간다. | 공개 업로드 전 콘텐츠 정책·신고·저작권 대응·검토/필터링·광고 보류 정책을 설계한다. |

## 1. Google Search: 유용하고 독창적인 콘텐츠

[Google의 people-first 콘텐츠 안내](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)는 검색 순위 조작보다 사람에게 도움이 되는 정보를 우선하도록 권한다. 자기 점검 기준으로는 독창적인 정보·분석, 주제를 충분히 설명하는 완결성, 다른 결과보다 더하는 가치, 실제 사용에서 나온 전문성, 사이트의 명확한 주제, 읽은 뒤 사용자가 목표를 달성할 수 있는 만족도를 제시한다.

따라서 “가이드 페이지를 시각적으로 순서대로 보여주자”는 방향은 적절하다. 단, 숫자 카드만 나열하는 SEO용 페이지가 아니라 실제 사용자가 그대로 따라 할 수 있는 작업 안내여야 한다. HEAD의 src/components/layout/SeoArticle.tsx는 세 개의 단계 카드와 짧은 팁·질문을 렌더링했고, 현재 working tree에는 다섯 단계로 확장된 콘텐츠 변경이 있으므로, 그 변경을 실제 UI에서 검증하면서 다음 구조를 기준으로 삼는 것이 좋다.

### 권장 가이드 구조

1. **완성 결과와 대상 사용자** — 캐릭터 사진과 장비 정보를 한 장의 PNG 카드로 만드는 도구라는 점, 브라우저에서 처리되는 범위를 설명한다.
2. **사진 업로드·자르기** — 업로드 가능한 파일 조건, 사진을 이동·확대하는 방법, 적용 전 확인 지점을 실제 화면 캡처와 짧은 설명으로 보여준다.
3. **장비 입력** — 주 무기·보조무기, 방어구, 염색, 얼굴 소품, 선택형 패션 소품, 선택형 투영 세트명을 실제 UI 순서대로 설명한다.
4. **미리보기와 색상 배경** — 사진의 주요 색을 카드 정보 패널에 반영하는 방식, 밝은 사진에서 가독성을 유지하는 처리, 어두운 사진에서 텍스트를 확인하는 방법을 설명한다.
5. **저장·공유** — 고정된 출력 크기, 모바일에서 원본 파일을 저장해야 하는 이유, 메신저의 이미지 압축 주의점을 설명한다.
6. **문제 해결** — 사진이 흐릴 때, 아이템 검색이 없을 때, 저장이 실패할 때, 모바일 화면이 좁을 때의 조치를 제공한다.

각 단계는 h2와 실제 작업 결과를 갖고, 캡처 이미지에는 설명적인 alt와 인접한 텍스트를 둔다. 핵심 설명을 이미지 안에만 넣거나 클릭·탭 뒤에만 숨기지 않는다. Google은 이미지 주변의 관련 텍스트와 설명적인 대체 텍스트가 이미지의 의미와 맥락을 이해하는 데 도움이 된다고 설명한다. 근거: [SEO Starter Guide — 이미지와 대체 텍스트](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

FAQ는 가이드의 축약본이 아니라 사용자가 실제로 막히는 질문에 답해야 한다. 예를 들어 사진이 서버에 저장되는지, 프리셋이 어디에 저장되는지, 모바일에서 흐려지는 이유, 주/보조 무기 차이, 패션 소품의 선택성, 염색 언어 변경, 저장 실패 시 재시도 방법을 각각 정확히 답한다. About은 단순한 홍보문보다 도구의 목적, 데이터 처리 범위, 업데이트 방식, 연락 방법, SQUARE ENIX와의 비공식 관계를 설명하는 신뢰 페이지로 만든다.

### 길이와 “thin content” 해석

Google은 특정 단어 수를 선호한다고 안내하지 않는다. 짧다는 이유만으로 자동으로 위반이 되는 것이 아니라, 독창성·완결성·사용자 가치가 부족한지가 핵심이다. [people-first 콘텐츠 안내](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)는 단어 수를 맞추기 위한 작성과 검색어만 끌어오기 위한 대량 작성을 경고한다.

현재 Google Search의 [스팸 정책](https://developers.google.com/search/docs/essentials/spam-policies)은 다음 위험을 구분한다.

- **Scaled content abuse:** 생성 방법과 관계없이 검색 순위 조작을 목적으로 가치가 거의 없는 페이지를 대량 생성하는 행위다. 자동 번역·자동 생성 페이지를 언어별로 늘리는 것 자체가 문제가 되는 것은 아니지만, 실질적인 현지화·추가 가치 없이 복제하면 위험하다.
- **Doorway abuse:** 유사한 페이지를 검색어별로 만들어 실제 유용한 도구나 콘텐츠로만 보내는 행위다. 언어·장비명·지역 조합별 얇은 랜딩 페이지를 무분별하게 만들지 않는다.
- **User-generated spam:** 공개 업로드 영역에 스팸 파일·콘텐츠가 쌓이는 경우를 포함한다.
- **Thin affiliation:** 특히 제휴 링크와 원문 복사 설명만 있는 페이지에 대한 정책 용어다. 이 사이트의 일반 가이드에 그대로 적용한다고 과장해서는 안 되지만, 복사한 아이템 설명을 대량으로 붙여 넣는 전략은 피해야 한다.

> **실무 결론:** /guide, /faq, /about 세 페이지를 독립적인 사용자 목적이 있는 정보 페이지로 유지하고, 아이템 검색 결과·필터 조합·언어 조합마다 별도 색인 페이지를 만들지 않는다. 새 페이지는 “검색어를 하나 더 넣기 위해”서가 아니라 실제 사용자가 북마크하거나 다시 찾을 이유가 있을 때만 만든다.

## 2. AdSense: 콘텐츠·광고 구현

[Google Publisher Policies](https://support.google.com/adsense/answer/10502938?hl=en)와 [AdSense Program policies](https://support.google.com/adsense/answer/48182?hl=en)는 광고가 표시되는 화면의 콘텐츠와 구현을 함께 본다. 게시자는 자신의 콘텐츠뿐 아니라 사용자 생성 콘텐츠가 있는 화면도 책임진다. 광고를 콘텐츠보다 많이 배치하거나, 광고를 콘텐츠와 구분하기 어렵게 만들거나, 사용자의 탐색·작업 버튼과 혼동될 배치를 해서는 안 된다.

### 현재 저장소와 관련된 점검 사항

- index.html에는 adsbygoogle.js가 이미 포함되어 있다. 소스 검색상 AdBanner는 현재 실제 화면에서 사용되지 않는 것으로 보이지만, 광고 슬롯을 활성화하기 전에 모든 경로의 정책 상태를 다시 점검한다.
- src/components/ads/AdBanner.tsx의 광고 실패 대체 화면은 “Support the Developer”, “후원하기”를 크게 보여준다. 이는 Google 정책 위반이라고 단정할 수는 없지만, 광고 영역과 후원 CTA를 혼합하면 광고와 콘텐츠의 구분이 약해지고 사용자의 오해를 만들 수 있다. 광고 실패 시에는 중립적인 “광고를 불러오지 못했습니다” 상태를 사용하고 후원 링크는 광고와 분리된 일반 사이트 링크로 둔다.
- 후원 링크를 광고 클릭 유도 문구처럼 사용하지 않는다. Google은 “광고를 클릭해 달라”, “support us”와 같은 문구로 Google 광고 클릭을 유도하는 것을 금지한다. 근거: [AdSense Program policies — 광고 클릭 유도 및 배치](https://support.google.com/adsense/answer/48182?hl=en).
- 광고는 사진 업로드·크롭·아이템 선택·저장 버튼과 겹치거나 바로 붙어 의도하지 않은 클릭을 유도하지 않게 한다. 근거: [Ad placement policies](https://support.google.com/adsense/answer/1346295?hl=en).

## 3. 개인정보처리방침·쿠키·동의

[Google Publisher Policies의 개인정보 공개 정책](https://support.google.com/adsense/answer/10502938?hl=en)은 Google 제품 사용으로 발생하는 데이터 수집·공유·사용을 명확하게 공개하는 개인정보처리방침을 요구한다. 사용 기술의 예로 쿠키, 웹 비콘, IP 주소, 기타 식별자를 들며, 광고 제공 결과 제3자가 쿠키를 저장·읽을 수 있다는 사실도 공개해야 한다.

[Required content](https://support.google.com/adsense/answer/1348695?hl=en)은 개인정보처리방침에 다음을 포함하도록 안내한다.

- Google을 포함한 제3자 공급자가 이 사이트 또는 다른 사이트 방문 기록을 바탕으로 광고를 제공하기 위해 쿠키를 사용할 수 있다는 점
- Google 광고 쿠키와 파트너의 개인 맞춤 광고 사용 가능성
- 사용자가 [Google 광고 설정](https://adssettings.google.com/) 등을 통해 개인 맞춤 광고를 거부할 수 있다는 점

HEAD의 src/content/localizedPages.ts privacy 내용은 로컬 저장·브라우저 메모리 처리·AdSense 가능성을 언급하지만, 위 공개 항목과 실제 공급자 목록·동의 선택·철회 방법을 충분히 연결하지 않았다. 현재 working tree에는 이 내용을 확장하는 미커밋 변경이 있으므로, 아래 항목이 실제 배포 코드·네트워크 흐름·CMP 설정과 일치하는지 검토한 뒤 확정한다.

1. 계정·이름·이메일을 직접 받는지 여부
2. 업로드 사진이 서버로 전송되는지, 브라우저 메모리에서만 처리되는지
3. 프리셋·테마·언어가 localStorage에 저장되는지와 삭제 방법
4. AdSense, CDN, 아이템 데이터/이미지 제공자 등 제3자 요청과 각 목적
5. 광고 쿠키·웹 비콘·IP/기기 식별자 처리 가능성
6. 개인 맞춤 광고와 비개인 맞춤 광고의 차이, 사용자의 선택·철회 방법
7. 문의 채널로 사용되는 외부 서비스에 전달될 수 있는 정보
8. 정책 시행일, 변경 고지, 문의 방법

### EEA·영국·스위스 방문자

[Google AdSense CMP 안내](https://support.google.com/adsense/answer/7670013?hl=en)는 EEA·영국·스위스 사용자에게 법적으로 필요한 경우 쿠키/로컬 저장소 사용과 개인 맞춤 광고를 위한 개인정보 수집·공유·사용에 대한 공개와 동의를 요구한다. Google CMP, 제3자 CMP, 또는 자체 동의 대화상자를 사용할 수 있지만, 선택한 광고 기술 공급자를 사용자에게 식별하고 동의 흐름에서 관련 정보를 제공해야 한다.

[AdSense privacy policy URL 안내](https://support.google.com/adsense/answer/10961370?hl=en)는 AdSense Privacy & messaging에 등록하는 개인정보처리방침 URL이 동의를 요구하는 스크립트, 광고 태그, Funding Choices 메시지 태그를 호스팅하지 않도록 안내한다. 현재 Cloudflare SPA fallback은 /privacy에도 index.html을 제공하고, index.html의 54행에 AdSense 스크립트가 있으므로 이 조건을 배포 환경에서 직접 확인해야 한다. 가장 안전한 구현 방향은 광고·CMP 의존성이 없는 별도 법적 페이지 템플릿/정적 결과를 제공하는 것이다.

## 4. 사용자 생성 이미지 서비스의 정책상 주의점

현재 구현은 useImageUpload, crop, palette 분석, PNG export를 브라우저 안에서 수행하고 공개 갤러리나 사용자 이미지 피드를 만들지 않는다. 따라서 “사용자가 업로드한 사진을 공개 게시하고 광고를 붙이는 서비스”와는 위험 범위가 다르다. 이 로컬 처리 범위는 개인정보 안내에서 명확히 설명할 가치가 있다.

다만 이후 공유 링크, 공개 갤러리, 댓글, 서버 저장을 추가하면 다음 정책이 적용된다.

- [Google Publisher Policies 설명](https://support.google.com/adsense/answer/10008391?hl=en)은 페이지의 사용자 생성 콘텐츠도 광고가 붙는 콘텐츠 범위에 포함한다고 설명한다.
- [사용자 생성 콘텐츠 관리 전략](https://support.google.com/adsense/answer/3011869?hl=en)은 콘텐츠 정책 공개, 신고 링크, 공개 전 위험 평가, 정기 검토, 자동 필터링, 검토 전 광고 중지 등을 제안한다.
- [AdSense 계정 폐쇄 위험 안내](https://support.google.com/adsense/answer/1217847?hl=en)은 다른 사람이 만든 UGC라도 광고가 표시되는 페이지의 정책 준수 책임이 게시자에게 있다고 설명한다.
- [Publisher Policies](https://support.google.com/adsense/answer/10502938?hl=en)은 저작권 침해와 성적으로 노골적인 콘텐츠 등 광고를 허용하지 않는 범주를 둔다. FF14 스크린샷·캐릭터 이미지의 업로드 권리, 제3자 이미지, 성인성·폭력성 콘텐츠, 신고·삭제 절차를 약관과 콘텐츠 정책에 분리해 적는다.
- Google Search에서도 [user-generated spam](https://developers.google.com/search/docs/essentials/spam-policies)을 관리해야 하므로, 공개 게시물·파일 URL이 생기면 신고·삭제·스팸 방지와 색인 제외 정책을 함께 설계한다.

> **권장 경계:** 공개 이미지 URL·갤러리를 만들기 전까지는 업로드 이미지를 검색 색인이나 sitemap에 넣지 않는다. 공개 UGC를 도입할 때는 검토되지 않은 콘텐츠에 광고를 붙이지 않는 보수적인 기본값을 사용한다.

## 5. 사이트 구조·내부 링크·SPA SEO

### 기술 최소 요건

[Google Search technical requirements](https://developers.google.com/search/docs/essentials/technical)은 Googlebot이 접근할 수 있고, 페이지가 HTTP 200으로 작동하며, 색인 가능한 콘텐츠를 가져야 한다고 설명한다. 이것만 만족해도 색인이나 노출이 보장되는 것은 아니다.

[robots.txt 안내](https://developers.google.com/search/docs/crawling-indexing/robots/intro)는 robots.txt가 페이지를 완전히 검색 결과에서 제거하는 방법이 아니며, 렌더링에 중요한 JS·CSS를 차단하면 Google이 페이지를 제대로 분석하지 못할 수 있다고 명시한다. 따라서 현재 public/robots.txt의 Disallow: /assets/는 빌드 결과의 CSS/JS 위치와 실제 배포 응답을 확인한 뒤 수정 여부를 결정해야 한다. 검색에서 제외할 페이지가 있다면 robots.txt 차단과 noindex를 같은 목적으로 혼용하지 않는다.

### 내부 링크와 sitemap

[Link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)는 Google이 일반적으로 href가 있는 a 링크를 크롤링하며, 설명적이고 간결한 anchor text와 각 중요 페이지로 이어지는 내부 링크를 권장한다고 설명한다. 현재 Footer의 /guide, /faq, /about, /terms, /privacy 링크는 좋은 기본 구조다. 본문에서도 다음처럼 맥락 있는 연결을 추가한다.

- Guide의 저장 단계에서 FAQ의 모바일 저장 문제로 연결
- FAQ의 사진 저장 답변에서 Privacy로 연결
- About의 데이터 출처·비공식 프로젝트 설명에서 Terms로 연결
- 각 법적 페이지에서 홈/가이드로 돌아가는 명확한 링크 제공

[Sitemap 안내](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)는 sitemap에 검색 결과에 노출하려는 canonical URL만, 완전한 절대 URL로 넣으라고 안내한다. 현재 public/sitemap.xml에는 홈·privacy·terms만 있으므로, 실제로 색인할 /guide, /faq, /about를 추가할 후보로 검토한다. 페이지를 언어별 URL로 분리할 경우 각 언어 URL과 자기 자신을 포함하는 hreflang 세트를 일관되게 제공해야 한다. 근거: [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions).

### SPA·언어·canonical

[JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)는 Google이 JavaScript 앱을 크롤링·렌더링·색인하지만, 렌더링된 HTML에 실제 콘텐츠와 crawlable link가 있어야 하며 서버 측/사전 렌더링이 사용자와 크롤러 모두에게 유리하다고 설명한다. 현재 src/main.tsx는 pathname에 따라 페이지를 선택하고, public/_redirects는 /index.html 200 fallback을 사용한다. working tree에는 page-aware metadata hook과 ContentPageLayout이 추가되어 있지만, 현재 정보 페이지가 새 레이아웃을 import하지 않고 Header도 page 키 없이 호출된다. 따라서 이 구조를 유지하려면 먼저 해당 변경을 실제 페이지에 연결하고, 배포 후 각 경로를 URL 검사로 렌더링된 HTML까지 확인해야 한다.

[canonical 안내](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)는 canonical을 HTML 소스에서 명확히 하고, sitemap·내부 링크·canonical이 같은 URL을 가리키도록 권장한다. 초기 index.html의 canonical과 og:url은 루트다. HEAD의 useLocalizedMetadata는 title·description·manifest만 갱신했으며, working tree의 page-aware 구현은 정보 페이지에서 page 키를 전달하지 않으면 기본 home metadata를 계속 사용한다. /guide, /faq, /about, /terms, /privacy가 검색 대상이라면 페이지별 title/description/canonical/OG를 실제 경로와 맞추는 것이 우선이다.

언어도 같은 문제를 가진다. [다국어 사이트 안내](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)는 쿠키·브라우저 설정만으로 언어를 바꾸는 방식보다 언어별로 발견 가능한 URL을 권장하며, Googlebot이 모든 브라우저 언어 변형을 자동으로 발견한다고 가정하지 말라고 안내한다. 현재는 같은 URL에서 언어 감지로 콘텐츠를 바꾸므로, 세 언어를 검색 유입 대상으로 삼을지 먼저 결정하고, 삼는다면 /ko/guide, /en/guide, /ja/guide 같은 명시적 URL 또는 명확한 대체 전략을 설계한다. URL을 분리하지 않을 경우 잘못된 hreflang을 추가하지 않는다.

## 6. 구조화 데이터

[일반 구조화 데이터 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)은 JSON-LD를 권장 형식으로 소개하지만, 구조화 데이터는 보이는 콘텐츠와 일치해야 하고, 숨겨진·오해를 부르는 정보를 마크업하면 안 되며, 리치 결과 노출을 보장하지 않는다고 설명한다.

현재 index.html의 WebApplication은 실제 앱의 성격과 일치할 수 있지만, Google의 [SoftwareApplication 가이드](https://developers.google.com/search/docs/appearance/structured-data/software-app)는 리치 결과에 필요한 name, offers.price와 함께 실제 평점 또는 리뷰를 요구한다. 현재 평점/리뷰가 없으므로 가짜 AggregateRating을 추가하지 않는다. 앱 마크업을 유지하더라도 리치 결과가 보장된다고 홍보하지 않는다.

권장 구조는 다음과 같다.

- **홈:** 실제 이름·URL과 일치하는 WebSite를 검토한다. Google은 [site name 안내](https://developers.google.com/search/docs/appearance/site-names)에서 홈 페이지의 WebSite 마크업으로 사이트 이름 선호를 전달할 수 있다고 설명한다.
- **가이드·FAQ·소개·약관·개인정보:** 페이지에 실제로 보이는 breadcrumb UI가 있을 때만 BreadcrumbList를 추가한다. [Breadcrumb 가이드](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)는 보이는 사이트 계층과 일치하는 최소 두 개의 ListItem을 요구한다.
- **FAQ:** 질문과 답변을 HTML로 제공하는 것은 사용자에게 유용하지만, 2023년 Google 안내에 따르면 FAQPage 리치 결과는 잘 알려진 권위 있는 정부·건강 사이트에만 정기적으로 제공된다. 이 팬 프로젝트는 FAQ 마크업을 검색 노출 수단으로 삼지 않는다. 근거: [FAQ/HowTo 리치 결과 변경 안내](https://developers.google.com/search/blog/2023/08/howto-faq-changes).
- **모든 마크업:** [Rich Results Test](https://search.google.com/test/rich-results)와 Search Console URL 검사로 배포 후 렌더링 HTML, 필수 속성, 실제 표시 콘텐츠 일치를 확인한다.

## 7. SEO·콘텐츠 품질 체크리스트

### 배포 전 P0

- [ ] robots.txt가 빌드 JS/CSS와 렌더링에 필요한 이미지 요청을 막지 않는다.
- [ ] /privacy가 광고 태그·동의 의존 스크립트 없이 열리고, AdSense Privacy & messaging에 등록할 수 있다.
- [ ] 개인정보처리방침이 실제 데이터 흐름과 Google 필수 쿠키/제3자/선택권 공개를 모두 설명한다.
- [ ] EEA·영국·스위스 방문자에게 필요한 CMP·동의·철회 흐름을 AdSense 설정과 함께 검증한다.
- [ ] 광고 슬롯을 활성화하기 전 Policy Center에서 정책 위반·제한이 없는지 확인한다.

### 배포 전 P1

- [ ] /guide, /faq, /about, /terms, /privacy가 Footer와 본문에서 href 링크로 발견된다.
- [ ] sitemap에 색인할 canonical URL만 들어 있고 absolute URL·실제 수정일을 사용한다.
- [ ] 모든 정보 페이지에 고유한 title, h1, meta description, canonical, OG URL/제목/설명이 있다. Google의 [title link 가이드](https://developers.google.com/search/docs/appearance/title-link)와 [snippet 가이드](https://developers.google.com/search/docs/appearance/snippet)를 따른다.
- [ ] 언어별 콘텐츠를 실제로 검색 노출할지 결정하고, 같은 URL에 잘못된 hreflang을 넣지 않는다.
- [ ] 가이드의 단계별 설명이 이미지에만 의존하지 않고 HTML 텍스트로도 제공된다.
- [ ] 원문 복사·대량 자동 번역·키워드 나열 대신 FF14 Glamour Maker의 실제 기능과 사용 경험을 설명한다.
- [ ] JSON-LD가 보이는 콘텐츠와 일치하고, 가짜 리뷰·평점을 넣지 않는다.

### 공개 UGC를 추가할 때

- [ ] 허용/금지 콘텐츠 정책과 저작권 신고·삭제 절차를 공개한다.
- [ ] 신고 링크, 자동 필터, 검토 대기 상태, 삭제 로그/운영 책임을 설계한다.
- [ ] 검토되지 않은 공개 UGC에는 광고를 붙이지 않는 기본값을 둔다.
- [ ] 공개 이미지의 소유권·사용 허가·삭제 요청과 개인정보 노출 위험을 안내한다.
- [ ] 스팸성 업로드·검색 결과·공유 URL은 색인 및 sitemap 포함 여부를 별도로 결정한다.

## 8. 권장 작업 순서

1. **정책 기반 인프라:** robots/assets 차단, /privacy 광고 태그 분리, 개인정보처리방침·CMP 요구사항 확정.
2. **검색 기본기:** 페이지별 metadata/canonical/OG, sitemap 보완, SPA 렌더링과 언어 URL 전략 확정.
3. **콘텐츠 재작성:** Guide를 시각적 1→5단계 사용 안내로 리디자인하고, FAQ·About·Legal 내용을 실제 기능·데이터 흐름에 맞게 보강한다.
4. **구조화 데이터:** 홈 WebSite와 정확한 앱 정보, 보이는 breadcrumb가 있을 때의 BreadcrumbList만 추가한다.
5. **광고 활성화 검증:** 광고와 작업 UI의 거리·명확한 라벨·콘텐츠 대비 비율·정책 센터·동의 흐름을 확인한다.
6. **측정:** Search Console에서 sitemap 제출, URL 검사, 페이지 색인·Core Web Vitals·리치 결과 상태를 확인하고, AdSense Policy Center와 Privacy & messaging을 함께 점검한다.

## 공식 출처

### Google Search Central

- [Google Search technical requirements](https://developers.google.com/search/docs/essentials/technical)
- [Spam policies for Google Web Search](https://developers.google.com/search/docs/essentials/spam-policies)
- [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Link best practices for Google](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Robots.txt introduction and guide](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Localized versions and multilingual sites](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Influencing title links](https://developers.google.com/search/docs/appearance/title-link)
- [Control snippets](https://developers.google.com/search/docs/appearance/snippet)
- [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [SoftwareApplication structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- [BreadcrumbList structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Site names and WebSite structured data](https://developers.google.com/search/docs/appearance/site-names)
- [FAQ/HowTo rich result changes](https://developers.google.com/search/blog/2023/08/howto-faq-changes)
- [Google does not use the keywords meta tag in web ranking](https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag)

### Google AdSense

- [Google Publisher Policies](https://support.google.com/adsense/answer/10502938?hl=en)
- [Understand Publisher Policies and Restrictions](https://support.google.com/adsense/answer/10008391?hl=en)
- [AdSense Program policies](https://support.google.com/adsense/answer/48182?hl=en)
- [Ad placement policies](https://support.google.com/adsense/answer/1346295?hl=en)
- [Required content: Google advertising cookies and privacy policy](https://support.google.com/adsense/answer/1348695?hl=en)
- [Set up and manage a Consent Management Platform](https://support.google.com/adsense/answer/7670013?hl=en)
- [Add privacy policy URLs](https://support.google.com/adsense/answer/10961370?hl=en)
- [Good strategies for managing user-generated content](https://support.google.com/adsense/answer/3011869?hl=en)
- [AdSense account at risk: publisher responsibility for UGC](https://support.google.com/adsense/answer/1217847?hl=en)
