import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SeoArticle } from '../components/layout/SeoArticle';

export function Guide() {
    return (
        <div className="flex flex-col min-h-[100dvh] bg-[var(--bg-app)] text-[var(--text-primary)]">
            <Header />
            <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-16">
                <SeoArticle />
            </main>
            <Footer />
        </div>
    );
}
