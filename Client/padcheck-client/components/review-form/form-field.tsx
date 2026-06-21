export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-700 block">{label}</label>
      {children}
    </div>
  );
}
