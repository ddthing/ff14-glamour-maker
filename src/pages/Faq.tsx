import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export function Faq() {
    return (
        <div className="min-h-[100dvh] flex flex-col bg-[var(--bg-app)]">
            <Header />
            <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-black mb-8">Frequently Asked Questions</h1>
                <div className="space-y-6">
                    <div className="bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)]">
                        <h2 className="text-lg font-bold mb-2">Q. How do I change the language of the items?</h2>
                        <p className="text-[var(--text-secondary)]">A. The item language follows your browser settings or you can manually change it using the language selector in the top right corner.</p>
                    </div>
                    <div className="bg-[var(--bg-panel)] p-6 rounded-2xl border border-[var(--border)]">
                        <h2 className="text-lg font-bold mb-2">Q. My downloaded image looks blurry on mobile.</h2>
                        <p className="text-[var(--text-secondary)]">A. We render the image at 3x resolution. If you share it through some messenger apps, they compress the image. Try saving it to your device first.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
