const reportedItems = new Set<string>();

export async function reportMissingItem(itemName: string) {
    if (!itemName || !itemName.trim()) return;

    // 1. 중복 알림 방지 (메모리 상주 Set 및 sessionStorage 활용)
    const sessionKey = `reported_missing_${itemName}`;
    if (reportedItems.has(itemName) || sessionStorage.getItem(sessionKey)) {
        return;
    }

    // 2. 환경변수 확인
    const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        // 환경변수가 없으면 개발 환경이거나 설정 누락이므로 조용히 무시 (또는 콘솔 로그만)
        console.warn(`[Missing Item] 누락 알림 보류 (Webhook URL 미설정): ${itemName}`);
        return;
    }

    try {
        // 중복 방지 플래그 설정
        reportedItems.add(itemName);
        sessionStorage.setItem(sessionKey, '1');

        // 3. 디스코드 Webhook 전송
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `🚨 **이미지 누락 발생!**\n- 아이템명: \`${itemName}\`\n- 이 아이템의 이미지를 \`ff14-items/\`에 업로드해 주세요:`
            })
        });

        console.log(`[Missing Item] 디스코드 Webhook 전송 완료: ${itemName}`);
    } catch (err) {
        console.error(`[Missing Item] 디스코드 알림 전송 실패:`, err);
        // 실패 시 재시도를 위해 플래그 롤백 여부는 선택 (여기서는 스팸 방지를 위해 그대로 유지)
    }
}
