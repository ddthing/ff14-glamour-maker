/**
 * createMissingItemReporter — Discord webhook 알림 전송기 팩토리
 *
 * Why factory instead of module-level state:
 *   The original implementation used a module-level `Set<string>`, which:
 *   1. Cannot be reset between tests (global mutable state = test pollution)
 *   2. Creates implicit coupling between modules that import this file
 *   3. Cannot be mocked/replaced without module-level hacks
 *
 *   A factory function returns a closure with its own private Set, making it:
 *   - Testable: each test creates a fresh instance via createMissingItemReporter()
 *   - Encapsulated: state never leaks outside the returned function
 *   - Injectable: could be replaced with a mock in tests
 */
function createMissingItemReporter() {
    // Private to this closure — invisible to all external callers
    const reportedInMemory = new Set<string>();

    return async function reportMissingItem(itemName: string): Promise<void> {
        if (!itemName?.trim()) return;

        // 1. 중복 알림 방지 (메모리 내 Set + sessionStorage 이중 검사)
        const sessionKey = `reported_missing_${itemName}`;
        if (reportedInMemory.has(itemName) || sessionStorage.getItem(sessionKey)) {
            return;
        }

        // 2. 환경변수 확인 — 없으면 설정 누락이므로 조용히 중단
        const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
        if (!webhookUrl) {
            console.warn(`[MissingItem] Webhook URL 미설정 — 알림 보류: ${itemName}`);
            return;
        }

        try {
            // 3. 선행 플래그 설정 (전송 중 중복 요청 방지)
            reportedInMemory.add(itemName);
            sessionStorage.setItem(sessionKey, '1');

            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `🚨 **이미지 누락 발생!**\n- 아이템명: \`${itemName}\`\n- 이 아이템의 이미지를 \`ff14-items/\`에 업로드해 주세요:`
                }),
            });

            console.log(`[MissingItem] Discord 전송 완료: ${itemName}`);
        } catch (err) {
            console.error('[MissingItem] Discord 알림 전송 실패:', err);
            // 전송 실패 시 플래그 유지 → 스팸 방지 (재시도 원하면 플래그 롤백)
        }
    };
}

// 앱 전체에서 사용할 싱글톤 인스턴스
// 테스트에서는 createMissingItemReporter()로 새 인스턴스를 생성한다.
export const reportMissingItem = createMissingItemReporter();
export { createMissingItemReporter };

