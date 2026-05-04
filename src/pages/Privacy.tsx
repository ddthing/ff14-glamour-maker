import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export function Privacy() {
    return (
        <div className="flex flex-col min-h-[100dvh] bg-[var(--bg-app)] text-[var(--text-primary)]">
            <Header />
            <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-8">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)] border-b border-[var(--border)] pb-6">
                    개인정보처리방침 (Privacy Policy)
                </h1>
                
                <div className="prose prose-sm md:prose-base prose-neutral max-w-none text-[var(--text-secondary)] flex flex-col gap-6">
                    <p className="font-semibold text-[var(--text-primary)]">시행일: 2026년 5월 5일</p>

                    <section className="flex flex-col gap-3">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">1. 개인정보 수집 최소화의 원칙</h2>
                        <p>투영 메이커(이하 "서비스")는 사용자 개인의 프라이버시를 가장 중요하게 생각합니다. 따라서 본 서비스는 <strong>회원가입 절차가 없으며, 사용자를 특정할 수 있는 이름, 이메일, 전화번호 등의 개인정보를 일절 수집하지 않습니다.</strong></p>
                    </section>

                    <section className="flex flex-col gap-3">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">2. 처리하는 정보 및 목적</h2>
                        <ul className="list-disc pl-5 flex flex-col gap-2">
                            <li><strong>로컬 저장소 (Local Storage):</strong> 사용자가 선택한 장비, 다크모드 설정, 언어 설정 등은 오직 사용자 본인의 브라우저 로컬 저장소에만 보관됩니다. 이 데이터는 개발자의 서버로 전송되지 않습니다.</li>
                            <li><strong>이미지 업로드 데이터:</strong> 사용자가 투영 카드 배경으로 사용할 이미지를 로컬에서 업로드할 경우, 이는 이미지 생성을 위해 임시로 브라우저 메모리에서만 처리되며 영구적으로 서버에 저장되지 않습니다.</li>
                        </ul>
                    </section>

                    <section className="flex flex-col gap-3">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">3. 서드파티 (제3자) 서비스</h2>
                        <p>서비스의 안정성과 수익 유지를 위해 아래와 같은 제3자 도구가 제한적으로 사용될 수 있으며, 이 과정에서 익명화된 쿠키(Cookie)나 트래픽 데이터가 수집될 수 있습니다.</p>
                        <ul className="list-disc pl-5 flex flex-col gap-2">
                            <li><strong>Google AdSense:</strong> 맞춤형 광고 제공을 위해 쿠키를 사용하여 사용자의 이전 방문 기록을 바탕으로 광고를 게재할 수 있습니다. (사용자는 브라우저 설정이나 구글 광고 설정을 통해 맞춤 광고를 거부할 수 있습니다)</li>
                        </ul>
                    </section>

                    <section className="flex flex-col gap-3">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">4. 권리 및 행사방법</h2>
                        <p>수집하는 식별 가능한 개인정보가 없으므로 별도의 탈퇴나 정보 파기 절차가 필요하지 않습니다. 서비스 이용 기록을 지우고 싶으시다면, 브라우저의 '인터넷 사용 기록 지우기' 기능을 통해 캐시와 로컬 스토리지 데이터를 삭제하시면 됩니다.</p>
                    </section>

                    <section className="flex flex-col gap-3">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">5. 문의처</h2>
                        <p>본 방침과 관련한 문의사항이나 기타 건의사항이 있으신 경우, 공식 GitHub 레포지토리의 Issue 탭이나 하단의 문의하기 이메일을 통해 연락해 주시기 바랍니다.</p>
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
