import type { CSSProperties, ReactNode } from 'react';

/**
 * SectionLabel — Reusable section heading for the control panel.
 *
 * Why extracted:
 *   - Was defined as a module-level function inside ControlPanel.tsx,
 *     making it impossible to reuse in other panels without duplication.
 *   - Centralising it here lets future panels (e.g. a mobile drawer) share
 *     the exact same visual language without copy-paste drift.
 */
interface SectionLabelProps {
    icon: ReactNode;
    children: ReactNode;
    style?: CSSProperties;
}

export function SectionLabel({ icon, children, style }: SectionLabelProps) {
    return (
        <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '10px',
            ...style,
        }}>
            <span style={{ opacity: 0.6 }} aria-hidden="true">{icon}</span>
            {children}
        </h3>
    );
}
