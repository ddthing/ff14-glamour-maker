/**
 * Divider — Thin horizontal rule used between control panel sections.
 *
 * Why extracted:
 *   - Repeated pattern across current and potential future panels.
 *   - `flexShrink: 0` is critical — without it, the divider collapses
 *     inside flex containers. Centralising this prevents accidental omission.
 */
export function Divider() {
    return (
        <div
            role="separator"
            aria-hidden="true"
            style={{ height: '1px', background: 'var(--border)', flexShrink: 0 }}
        />
    );
}
