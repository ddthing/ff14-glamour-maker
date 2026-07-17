interface CanvasHeadingProps {
  title: string;
  creator: string;
  label: string;
}

export function CanvasHeading({ title, creator, label }: CanvasHeadingProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ marginBottom: '10px' }}>
        <span style={{
          fontSize: '0.575rem', fontWeight: 700, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', display: 'block',
        }}>
          {label}
        </span>
      </div>

      <h1 style={{
        fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.4px',
        color: '#ffffff', textShadow: '0 2px 20px rgba(0,0,0,0.4)', wordBreak: 'break-word',
      }}>
        {title || <span style={{ color: 'rgba(255,255,255,0.18)' }}>—</span>}
      </h1>

      {creator && (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px', height: '1px', background: 'rgba(255,255,255,0.2)', flexShrink: 0,
          }} />
          <span style={{
            fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {creator}
          </span>
        </div>
      )}
    </div>
  );
}
