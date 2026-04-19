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

type Row = { day: string; count: number };

export default function NewUsersChart({ data }: { data: Row[] }) {
  return (
    <div className="border border-[var(--pb-light-gray)] p-4">
      <h3 className="text-xs tracking-wider text-[var(--pb-gray)] mb-3">
        신규 가입 추이
      </h3>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-[var(--pb-gray)]">
          가입 기록이 없습니다.
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0A0A0A"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
