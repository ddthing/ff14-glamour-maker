import { useTranslation } from 'react-i18next';

export function SeoArticle() {
    const { t } = useTranslation();
    
    return (
        <article className="max-w-4xl mx-auto w-full px-6 py-12 mt-8 text-[var(--text-secondary)] space-y-12">
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    {t('seo.intro.title', 'FF14 Glamour Maker - Create Beautiful Fashion Cards')}
                </h2>
                <p className="leading-relaxed">
                    {t('seo.intro.desc1', 'Welcome to the ultimate tool for Final Fantasy XIV fashion enthusiasts. FF14 Glamour Maker allows you to create stunning, high-quality glamour cards to showcase your favorite in-game outfits. Whether you are sharing your latest look on social media, updating your character profile, or simply organizing your fashion ideas, our tool provides a seamless and visually appealing way to do so.')}
                </p>
                <p className="leading-relaxed">
                    {t('seo.intro.desc2', 'With a user-friendly interface inspired by modern, premium design aesthetics, you can easily upload your character screenshots, add detailed equipment and dye information, and generate a perfectly formatted image ready for sharing. No need for complicated image editing software – everything you need is right here in your browser.')}
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {t('seo.how_to_use.title', 'How to Use FF14 Glamour Maker')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="bg-[var(--bg-panel)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                        <div className="text-2xl font-black text-[var(--text-muted)] mb-3">01</div>
                        <h3 className="font-bold text-[var(--text-primary)] mb-2">{t('seo.how_to_use.step1.title', 'Upload Screenshot')}</h3>
                        <p className="text-sm">{t('seo.how_to_use.step1.desc', 'Drag and drop or click to upload your best FFXIV character screenshot. The image will be beautifully integrated into the glamour card layout.')}</p>
                    </div>
                    <div className="bg-[var(--bg-panel)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                        <div className="text-2xl font-black text-[var(--text-muted)] mb-3">02</div>
                        <h3 className="font-bold text-[var(--text-primary)] mb-2">{t('seo.how_to_use.step2.title', 'Enter Equipment Info')}</h3>
                        <p className="text-sm">{t('seo.how_to_use.step2.desc', 'Use the intuitive search feature to find your gear. Specify the dyes used for each piece to give viewers the exact details of your glamour.')}</p>
                    </div>
                    <div className="bg-[var(--bg-panel)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                        <div className="text-2xl font-black text-[var(--text-muted)] mb-3">03</div>
                        <h3 className="font-bold text-[var(--text-primary)] mb-2">{t('seo.how_to_use.step3.title', 'Save & Share')}</h3>
                        <p className="text-sm">{t('seo.how_to_use.step3.desc', 'Click the save button to download a high-resolution image of your glamour card. It\'s now ready to be shared with the Eorzean community!')}</p>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {t('seo.tips.title', 'Tips for the Perfect Glamour Card')}
                </h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>{t('seo.tips.tip1.title', 'Lighting is Key:')}</strong> {t('seo.tips.tip1.desc', 'Take screenshots in well-lit areas, such as during daytime in Eorzea or by using the Gpose lighting features, to make your character pop.')}</li>
                    <li><strong>{t('seo.tips.tip2.title', 'Use Gpose Filters:')}</strong> {t('seo.tips.tip2.desc', 'Experiment with in-game Gpose filters to find the perfect mood for your outfit.')}</li>
                    <li><strong>{t('seo.tips.tip3.title', 'Clear Backgrounds:')}</strong> {t('seo.tips.tip3.desc', 'A clean, uncluttered background often works best, allowing the focus to remain firmly on your character\'s glamour.')}</li>
                    <li><strong>{t('seo.tips.tip4.title', 'Accurate Dyes:')}</strong> {t('seo.tips.tip4.desc', 'Always double-check your dye names so others can perfectly replicate your look.')}</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {t('seo.faq.title', 'Frequently Asked Questions (FAQ)')}
                </h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-[var(--text-primary)]">{t('seo.faq.q1', 'Is this tool free to use?')}</h3>
                        <p className="mt-1">{t('seo.faq.a1', 'Yes, FF14 Glamour Maker is completely free for all Warriors of Light to use.')}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--text-primary)]">{t('seo.faq.q2', 'Does it support all FFXIV items?')}</h3>
                        <p className="mt-1">{t('seo.faq.a2', 'We strive to keep our database updated with the latest items. You can search for almost any equippable item in the game.')}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--text-primary)]">{t('seo.faq.q3', 'Are my images uploaded to a server?')}</h3>
                        <p className="mt-1">{t('seo.faq.a3', 'No, all image processing happens locally in your browser. Your screenshots remain private and are never uploaded to our servers.')}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--text-primary)]">{t('seo.faq.q4', 'Can I save my glamour sets for later?')}</h3>
                        <p className="mt-1">{t('seo.faq.a4', 'Yes, you can use the Preset feature to save your favorite glamour setups locally within your browser, or copy the link to share the exact configuration.')}</p>
                    </div>
                </div>
            </section>
        </article>
    );
}
