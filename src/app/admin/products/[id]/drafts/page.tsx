import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { listDraftsByProduct } from "@/lib/data/drafts";
import GenerateDraftButton from "@/components/admin/ai-draft/GenerateDraftButton";
import type { DraftStatus } from "@/types/database";

export const revalidate = 0;

const STATUS_LABEL: Record<DraftStatus, string> = {
  pending: "검수 대기",
  published: "발행됨",
  rejected: "반려됨",
};

export default async function ProductDraftsPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = await getAdminUser();
  if (!admin) redirect("/auth");

  const supabase = createAdminClient();
  const { data } = await (
    supabase.from("pb_products") as ReturnType<typeof supabase.from>
  )
    .select("id, name")
    .eq("id", params.id)
    .single();

  const product = data as { id: string; name: string } | null;
  if (!product) notFound();

  const drafts = await listDraftsByProduct(params.id);

  return (
    <div className="space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[var(--pb-light-gray)] pb-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/products/${params.id}`}
            className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> 상품 수정
          </Link>
          <h1 className="heading-display text-base tracking-wide truncate">
            AI 상세페이지 초안 — {product.name}
          </h1>
        </div>
        <GenerateDraftButton productId={params.id} />
      </header>

      <p className="text-xs text-[var(--pb-gray)]">
        AI 초안은 검수 대기 상태로 생성됩니다. 승인 후 발행해야만 고객 상세페이지에
        반영됩니다.
      </p>

      {drafts.length === 0 ? (
        <p className="text-sm text-[var(--pb-gray)] py-16 text-center border border-dashed border-[var(--pb-light-gray)]">
          아직 생성된 초안이 없습니다. 우측 상단에서 AI 초안을 생성하세요.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--pb-light-gray)] border border-[var(--pb-light-gray)]">
          {drafts.map((d) => {
            const status = d.status as DraftStatus;
            return (
              <li
                key={d.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm">
                    v{d.revision}{" "}
                    <span className="text-[var(--pb-silver)]">
                      · {d.generator ?? "manual"}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--pb-silver)]">
                    {new Date(d.created_at).toLocaleString("ko-KR")}
                    {d.review_note ? ` · 사유: ${d.review_note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                      status === "pending"
                        ? "border-[var(--pb-jet-black)]"
                        : status === "published"
                          ? "border-[var(--accent-success)] text-[var(--accent-success)]"
                          : "border-[var(--accent-sale)] text-[var(--accent-sale)]"
                    }`}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                  {status === "pending" && (
                    <Link
                      href={`/admin/drafts/${d.id}/review`}
                      className="text-xs underline"
                    >
                      검수
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
