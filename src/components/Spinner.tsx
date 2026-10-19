export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="animate-spin"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FullScreenLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-bg">
      <Spinner size={32} />
      <p className="text-sm text-ink-muted">{label}</p>
    </div>
  );
}
