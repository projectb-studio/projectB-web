import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getDraft, markDraftRejected } from "@/lib/data/drafts";
import { generateDraftForProduct } from "@/lib/ai-draft/generate-service";

export const revalidate = 0;

/**
 * 반려 (+ 선택적 피드백 반영 재생성).
 *
 * body: { note?: string, regenerate?: boolean }
 *  - regenerate=true: 부모를 rejected 로 마킹한 뒤, 운영자 의견(note)을 반영해
 *    새 pending 초안을 생성한다(리비전 체인). 새 draftId 를 반환.
 *  - regenerate=false: 단순 반려.
 */
export async function POST(
  req: Request,
  { params }: { params: { draftId: string } }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const draft = await getDraft(params.draftId);
  if (!draft) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (draft.status !== "pending") {
    return NextResponse.json({ error: "이미 처리된 초안입니다" }, { status: 409 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    note?: string;
    regenerate?: boolean;
  };
  const note = body.note?.trim() || null;

  try {
    await markDraftRejected(params.draftId, note, admin.user_id);

    if (body.regenerate) {
      const newDraft = await generateDraftForProduct(draft.product_id, {
        feedback: note,
        parent: draft,
      });
      return NextResponse.json({ ok: true, regenerated: true, draftId: newDraft.id });
    }

    return NextResponse.json({ ok: true, regenerated: false });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
