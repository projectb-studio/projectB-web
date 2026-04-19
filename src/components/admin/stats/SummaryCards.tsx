type Row = { revenue: number; order_count: number; new_users: number } | null;

function pct(cur: number, prev: number): string {
  if (!prev) return cur ? "+∞" : "0%";
  const d = ((cur - prev) / prev) * 100;
  return `${d >= 0 ? "+" : ""}${d.toFixed(1)}%`;
}

export default function SummaryCards({
  current,
  previous,
}: {
  current: Row;
  previous: Row;
}) {
  if (!current) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["매출", "주문수", "평균 객단가", "신규가입"].map((l) => (
          <Card key={l} label={l} value="-" delta={null} />
        ))}
      </div>
    );
  }
  const aov = current.order_count ? Math.round(current.revenue / current.order_count) : 0;
  const prevAov = previous?.order_count ? Math.round(previous.revenue / previous.order_count) : 0;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="매출"
        value={`₩${Number(current.revenue).toLocaleString()}`}
        delta={previous ? pct(current.revenue, previous.revenue) : null}
      />
      <Card
        label="주문수"
        value={current.order_count}
        delta={previous ? pct(current.order_count, previous.order_count) : null}
      />
      <Card
        label="평균 객단가"
        value={`₩${aov.toLocaleString()}`}
        delta={previous ? pct(aov, prevAov) : null}
      />
      <Card
        label="신규가입"
        value={current.new_users}
        delta={previous ? pct(current.new_users, previous.new_users) : null}
      />
    </div>
  );
}

function Card({
  label,
  value,
  delta,
}: {
  label: string;
  value: string | number;
  delta: string | null;
}) {
  const negative = delta?.startsWith("-");
  return (
    <div className="border border-[var(--pb-light-gray)] p-4">
      <div className="text-xs tracking-wider text-[var(--pb-gray)]">{label}</div>
      <div className="text-2xl mt-1 tabular-nums">{value}</div>
      {delta && (
        <div
          className={`text-xs mt-1 ${negative ? "text-[var(--accent-sale)]" : "text-[#2D8F4E]"}`}
        >
          {delta} vs 직전
        </div>
      )}
    </div>
  );
}
