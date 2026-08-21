interface CanvasHeadingProps {
  title: string;
  creator: string;
  label: string;
}

export function CanvasHeading({ title, creator, label }: CanvasHeadingProps) {
  if (!title && !creator) return null;

  return (
    <div className="mb-4">
      <span className="mb-2.5 block text-[0.575rem] font-bold uppercase tracking-[0.22em] text-[var(--card-text-muted)]">
        {label}
      </span>
      {title ? (
        <h2 className="break-words text-[1.9rem] font-extrabold leading-[1.08] tracking-[-0.4px] text-[var(--card-text-primary)]">
          {title}
        </h2>
      ) : null}
      {creator ? (
        <div className="mt-2.5 flex items-center gap-2">
          <div className="h-px w-5 shrink-0 bg-[var(--card-divider)]" />
          <span className="truncate text-[0.8rem] font-medium tracking-[0.02em] text-[var(--card-text-secondary)]">
            {creator}
          </span>
        </div>
      ) : null}
    </div>
  );
}
