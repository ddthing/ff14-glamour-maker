import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export function Terms() {
    return (
        <div className="flex flex-col min-h-[100dvh] bg-[var(--bg-app)] text-[var(--text-primary)]">
            <Header />
            <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-8">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)] border-b border-[var(--border)] pb-6">
                    이용약관 (Terms of Service)
                </h1>
                
                <div className="prose prose-sm md:prose-base prose-neutral max-w-none text-[var(--text-secondary)] flex flex-col gap-6">
                    <p className="font-semibold text-[var(--text-primary)]">시행일: 2026년 5월 5일</p>

                    <section className="flex flex-col gap-3">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">1. 환영합니다!</h2>
                        <p>파이널판타지14 투영 메이커(이하 "서비스")를 이용해 주셔서 감사합니다. 본 약관은 여러분이 본 서비스를 이용함에 있어 필요한 권리, 의무 및 책임사항 등을 규정합니다. 서비스를 이용하시는 것은 본 약관에 동의하는 것으로 간주됩니다.</p>
                    </section>

                    <section className="flex flex-col gap-3">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">2. 서비스의 목적 및 성격</h2>
                        <p>본 서비스는 파이널판타지14 유저들이 자신의 캐릭터 코디(투영)를 보다 쉽고 예쁘게 이미지로 생성하여 공유할 수 있도록 돕는 비영리 목적의 팬 프로젝트입니다. 본 서비스는 SQUARE ENIX CO., LTD.와 어떠한 공식적인 제휴나 관련이 없습니다.</p>
                    </section>

                    <section className="flex flex-col gap-3">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">3. 지적재산권 및 저작권</h2>
                        <ul className="list-disc pl-5 flex flex-col gap-2">
                            <li>서비스 내에서 사용된 게임 관련 이미지, 아이템 명칭, 데이터 등 모든 원본 콘텐츠의 저작권은 <strong>FINAL FANTASY XIV © SQUARE ENIX CO., LTD.</strong>에 귀속됩니다.</li>
                            <li>이용자가 본 서비스를 통해 생성한 "글래머 카드(이미지)"는 게임의 팬 창작물로 간주되며, 상업적 목적으로 판매하거나 이용할 수 없습니다.</li>
                            <li>생성된 이미지의 공유 및 활용은 원저작자인 SQUARE ENIX의 저작물 이용 가이드라인(Materials Usage License)을 준수해야 합니다.</li>
                        </ul>
                    </section>

                    <section className="flex flex-col gap-3">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">4. 서비스 제공 및 변경</h2>
                        <p>개발자는 더 나은 UX와 기능을 위해 서비스의 UI/UX, 기능, 디자인을 사전 통지 없이 수시로 업데이트하거나 변경할 수 있습니다. 비영리 개인 프로젝트의 특성상 트래픽이나 서버 유지비용 등의 문제로 서비스가 예고 없이 중단될 수 있습니다.</p>
                    </section>

                    <section className="flex flex-col gap-3">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">5. 면책 조항</h2>
                        <p>본 서비스는 "있는 그대로(As Is)" 제공되며, 특정 목적에의 적합성이나 무결성을 보증하지 않습니다. 서비스를 이용하며 발생하는 데이터 유실이나 손해에 대해 개발자는 법적인 책임을 지지 않습니다.</p>
                    </section>
                </div>

                <div className="mt-10">
                    <a href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--surface-300)] text-[var(--text-primary)] font-bold text-sm hover:bg-[var(--accent)] hover:text-white transition-colors">
                        메인으로 돌아가기
                    </a>
                </div>
            </main>
            <Footer />
        </div>
    );
}
