interface AdminCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function AdminCard({ label, value, sub }: AdminCardProps) {
  return (
    <div className="border border-[var(--pb-light-gray)] bg-white p-5">
      <p className="text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-2">
        {label}
      </p>
      <p className="text-2xl font-heading font-semibold">{value}</p>
      {sub && (
        <p className="text-xs text-[var(--pb-silver)] mt-1">{sub}</p>
      )}
    </div>
  );
}
