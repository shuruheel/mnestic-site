/* The mnestic mark: a minimal three-node graph (an "engram") — a primary
   synapse-lime node wired to two cooler slate nodes. Reads as a graph even at
   16px, and echoes the hero constellation. */
export function Mark({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <g stroke="var(--color-slate)" strokeOpacity={0.55} strokeWidth={1.6}>
        <line x1="7" y1="23" x2="24" y2="8" />
        <line x1="24" y1="8" x2="25" y2="24" />
        <line x1="7" y1="23" x2="25" y2="24" />
      </g>
      <circle cx="24" cy="8" r="3" fill="var(--color-slate)" />
      <circle cx="25" cy="24" r="2.6" fill="var(--color-slate)" />
      <circle cx="7" cy="23" r="4.4" fill="var(--color-synapse)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <Mark size={24} />
      <span className="font-serif text-xl font-medium tracking-tight">
        mnestic
      </span>
    </span>
  );
}
