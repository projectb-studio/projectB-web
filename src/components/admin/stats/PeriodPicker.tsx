"use client";

import { useRouter } from "next/navigation";

const PRESETS: { key: "today" | "7d" | "30d" | "90d"; label: string }[] = [
  { key: "today", label: "오늘" },
  { key: "7d", label: "7일" },
  { key: "30d", label: "30일" },
  { key: "90d", label: "90일" },
];

export default function PeriodPicker({
  defaults,
}: {
  defaults: { preset?: string; from?: string; to?: string };
}) {
  const router = useRouter();
  const go = (qs: string) => router.push(`/admin/stats?${qs}`);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {PRESETS.map((p) => (
        <button
          key={p.key}
          onClick={() => go(`preset=${p.key}`)}
          className={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors ${
            defaults.preset === p.key
              ? "bg-[var(--pb-jet-black)] text-white border-[var(--pb-jet-black)]"
              : "border-[var(--pb-light-gray)] hover:border-[var(--pb-jet-black)]"
          }`}
        >
          {p.label}
        </button>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          go(`from=${f.get("from")}&to=${f.get("to")}`);
        }}
        className="flex gap-1 items-center ml-2"
      >
        <input
          name="from"
          type="date"
          defaultValue={defaults.from}
          className="border border-[var(--pb-light-gray)] px-2 py-1 text-sm"
        />
        <span className="text-[var(--pb-gray)]">~</span>
        <input
          name="to"
          type="date"
          defaultValue={defaults.to}
          className="border border-[var(--pb-light-gray)] px-2 py-1 text-sm"
        />
        <button
          type="submit"
          className="border border-[var(--pb-light-gray)] px-3 py-1 text-xs uppercase tracking-wider hover:border-[var(--pb-jet-black)]"
        >
          적용
        </button>
      </form>
    </div>
  );
}
