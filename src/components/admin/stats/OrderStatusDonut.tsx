"use client";

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#999999", "#2D8F4E", "#333333", "#666666", "#0A0A0A", "#C75050", "#CC3333"];
const STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  paid: "결제완료",
  preparing: "준비중",
  shipped: "배송중",
  delivered: "배송완료",
  cancelled: "취소",
  refunded: "환불",
};

export default function OrderStatusDonut({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  const mapped = data.map((d) => ({ name: STATUS_LABELS[d.status] ?? d.status, value: d.count }));
  return (
    <div className="border border-[var(--pb-light-gray)] p-4">
      <h3 className="text-xs uppercase tracking-wider text-[var(--pb-gray)] mb-3">
        주문 상태 분포
      </h3>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-[var(--pb-gray)]">
          주문이 없습니다.
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={mapped}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {mapped.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
