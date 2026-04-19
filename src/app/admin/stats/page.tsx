import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAdminUser } from "@/lib/admin-auth";
import PeriodPicker from "@/components/admin/stats/PeriodPicker";
import SummaryCards from "@/components/admin/stats/SummaryCards";
import RevenueChart from "@/components/admin/stats/RevenueChart";
import OrderStatusDonut from "@/components/admin/stats/OrderStatusDonut";
import TopProducts from "@/components/admin/stats/TopProducts";
import NewUsersChart from "@/components/admin/stats/NewUsersChart";
import RepurchaseRate from "@/components/admin/stats/RepurchaseRate";

export const dynamic = "force-dynamic";

async function fetchJSON(path: string, cookie: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const url = base ? `${base}${path}` : path;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { cookie },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: { preset?: string; from?: string; to?: string };
}) {
  const admin = await getAdminUser();
  if (!admin) redirect("/auth");

  const cookie = (await headers()).get("cookie") ?? "";

  const q = new URLSearchParams();
  if (searchParams.preset) q.set("preset", searchParams.preset);
  else if (searchParams.from && searchParams.to) {
    q.set("from", searchParams.from);
    q.set("to", searchParams.to);
  } else q.set("preset", "30d");
  const qs = q.toString();

  const [summary, revenue, byStatus, top, newUsers, repurchase] = await Promise.all([
    fetchJSON(`/api/admin/stats/summary?${qs}`, cookie),
    fetchJSON(`/api/admin/stats/revenue?${qs}`, cookie),
    fetchJSON(`/api/admin/stats/orders-by-status?${qs}`, cookie),
    fetchJSON(`/api/admin/stats/top-products?${qs}`, cookie),
    fetchJSON(`/api/admin/stats/new-users?${qs}`, cookie),
    fetchJSON(`/api/admin/stats/repurchase-rate?${qs}`, cookie),
  ]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="heading-display text-xl tracking-wide">통계 대시보드</h1>
        <PeriodPicker defaults={searchParams} />
      </header>

      <SummaryCards current={summary?.current} previous={summary?.previous} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart data={revenue?.items ?? []} />
        <OrderStatusDonut data={byStatus?.items ?? []} />
        <TopProducts data={top?.items ?? []} />
        <NewUsersChart data={newUsers?.items ?? []} />
      </div>

      <RepurchaseRate data={repurchase?.items?.[0] ?? null} />
    </section>
  );
}
