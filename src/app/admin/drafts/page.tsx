import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, ChevronRight } from "lucide-react";
import { getAdminUser } from "@/lib/admin-auth";
import { listPendingDrafts } from "@/lib/data/drafts";

export const revalidate = 0;

export default async function DraftQueuePage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/auth");

  const drafts = await listPendingDrafts();

  return (
    <div className="space-y-4">
      <header className="border-b border-[var(--pb-light-gray)] pb-3">
        <h1 className="heading-display text-lg tracking-wide flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> AI 초안 검수
        </h1>
        <p className="text-xs text-[var(--pb-gray)] mt-1">
          AI 가 생성한 상세페이지 초안입니다. 검토·승인해야만 고객에게 발행됩니다.
        </p>
      </header>

      {drafts.length === 0 ? (
        <p className="text-sm text-[var(--pb-gray)] py-16 text-center border border-dashed border-[var(--pb-light-gray)]">
          검수 대기 중인 초안이 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--pb-light-gray)] border border-[var(--pb-light-gray)]">
          {drafts.map((d) => (
            <li key={d.id}>
              <Link
                href={`/admin/drafts/${d.id}/review`}
                className="flex items-center justify-between px-4 py-3 hover:bg-[var(--pb-snow)] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm truncate">{d.product_name ?? "(상품 미상)"}</p>
                  <p className="text-xs text-[var(--pb-silver)]">
                    v{d.revision} · {d.generator ?? "manual"} ·{" "}
                    {new Date(d.created_at).toLocaleString("ko-KR")}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--pb-silver)] shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
