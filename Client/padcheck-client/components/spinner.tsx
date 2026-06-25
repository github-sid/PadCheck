export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-3.5 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin ${className ?? ""}`}
    />
  );
}
