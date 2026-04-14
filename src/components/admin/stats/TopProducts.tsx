export default function TopProducts({
  data,
}: {
  data: { product_id: string; name: string; qty: number; revenue: number }[];
}) {
  return (
    <div className="border border-[var(--pb-light-gray)] p-4">
      <h3 className="text-xs uppercase tracking-wider text-[var(--pb-gray)] mb-3">
        베스트 상품 TOP 10
      </h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--pb-gray)]">
          판매 기록이 없습니다.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-[var(--pb-gray)]">
            <tr className="border-b border-[var(--pb-light-gray)]">
              <th className="text-left py-2 w-8">#</th>
              <th className="text-left py-2">상품</th>
              <th className="text-right py-2">수량</th>
              <th className="text-right py-2">매출</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr
                key={r.product_id}
                className="border-b border-[var(--pb-off-white)]"
              >
                <td className="py-2 text-[var(--pb-gray)]">{i + 1}</td>
                <td className="py-2 truncate max-w-[200px]">{r.name}</td>
                <td className="text-right py-2 tabular-nums">{r.qty}</td>
                <td className="text-right py-2 tabular-nums">
                  ₩{Number(r.revenue).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
