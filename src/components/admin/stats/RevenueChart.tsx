"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Row = { day: string; revenue: number };

export default function RevenueChart({ data }: { data: Row[] }) {
  return (
    <div className="border border-[var(--pb-light-gray)] p-4">
      <h3 className="text-xs uppercase tracking-wider text-[var(--pb-gray)] mb-3">
        매출 추이
      </h3>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-[var(--pb-gray)]">
          해당 기간에 주문이 없습니다.
        </div>
      ) : (
        <div className="h-64" aria-label="매출 추이 라인 차트">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v: number) =>
                  v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${Math.round(v / 1000)}k`
                }
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v) => `₩${Number(v).toLocaleString()}`} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0A0A0A"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {data.length > 0 && (
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer text-[var(--pb-gray)]">데이터 표</summary>
          <table className="mt-2 w-full">
            <thead className="text-[var(--pb-gray)]">
              <tr>
                <th className="text-left py-1">일자</th>
                <th className="text-right py-1">매출</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.day} className="border-t border-[var(--pb-off-white)]">
                  <td className="py-1">{r.day}</td>
                  <td className="text-right tabular-nums">₩{Number(r.revenue).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}
