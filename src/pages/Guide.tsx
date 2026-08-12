import { useLocalizedPageContent } from '../content/localizedPages';
import { ContentPageLayout } from '../components/layout/ContentPageLayout';
import { SeoArticle } from '../components/layout/SeoArticle';

export function Guide() {
  const { guide } = useLocalizedPageContent();

  return (
    <ContentPageLayout
      page="guide"
      eyebrow={guide.eyebrow}
      title={guide.title}
      description={guide.description}
      lastUpdated={guide.lastUpdated}
      lastUpdatedIso={guide.lastUpdatedIso}
    >
      <SeoArticle />
    </ContentPageLayout>
  );
}
