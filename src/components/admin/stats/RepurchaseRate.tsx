export default function RepurchaseRate({
  data,
}: {
  data: { total_customers: number; repeat_customers: number } | null;
}) {
  const total = data?.total_customers ?? 0;
  const repeat = data?.repeat_customers ?? 0;
  const pct = total ? Math.round((repeat / total) * 1000) / 10 : 0;

  return (
    <div className="border border-[var(--pb-light-gray)] p-5">
      <h3 className="text-xs tracking-wider text-[var(--pb-gray)] mb-3">
        재구매율
      </h3>
      <div className="flex items-baseline gap-4">
        <div className="text-5xl tabular-nums">{pct}%</div>
        <div className="text-sm text-[var(--pb-gray)]">
          2회 이상 주문 회원 <span className="text-[var(--pb-jet-black)]">{repeat}명</span> /
          총 구매 경험 회원 <span className="text-[var(--pb-jet-black)]">{total}명</span>
        </div>
      </div>
      {total === 0 && (
        <p className="mt-2 text-xs text-[var(--pb-gray)]">
          해당 기간에 구매 기록이 없습니다.
        </p>
      )}
    </div>
  );
}
