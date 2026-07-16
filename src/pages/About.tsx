import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export function About() {
    return (
        <div className="min-h-[100dvh] flex flex-col bg-[var(--bg-app)]">
            <Header />
            <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-black mb-8">About FF14 Glamour Maker</h1>
                
                <div className="space-y-8 bg-[var(--bg-panel)] p-8 rounded-3xl border border-[var(--border)]">
                    <section>
                        <h2 className="text-xl font-bold mb-4">Our Mission</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            FF14 Glamour Maker was created to help Warriors of Light beautifully showcase and share their carefully crafted outfits.
                            Our goal is to provide the most elegant and easy-to-use tool for generating high-quality glamour cards.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4">Contact & Support</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            For any inquiries, bug reports, or feature requests, you can reach out to the developer directly.
                            <br /><br />
                            <strong>Twitter/X:</strong> <a href="https://x.com/reconeur" className="text-[var(--accent)] hover:underline" target="_blank" rel="noopener noreferrer">@reconeur</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4">Disclaimer</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                            This website is a fan-made project and is not affiliated with, maintained, authorized, endorsed, or sponsored by SQUARE ENIX CO., LTD. 
                            FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.
                            All in-game item names and images are the property of Square Enix.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
