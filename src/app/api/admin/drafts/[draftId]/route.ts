import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getDraft, updateDraftBlocks } from "@/lib/data/drafts";
import { sanitizeBlocks } from "@/lib/detail-blocks/sanitize-blocks";

export const revalidate = 0;

export async function GET(
  _req: Request,
  { params }: { params: { draftId: string } }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const draft = await getDraft(params.draftId);
  if (!draft) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ draft });
}

// 운영자가 발행 전 초안 블록을 직접 편집
export async function PUT(
  req: Request,
  { params }: { params: { draftId: string } }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const draft = await getDraft(params.draftId);
  if (!draft) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (draft.status !== "pending") {
    return NextResponse.json(
      { error: "검수 대기(pending) 초안만 편집할 수 있습니다" },
      { status: 409 }
    );
  }

  try {
    const body = await req.json();
    const blocks = sanitizeBlocks(body.blocks);
    await updateDraftBlocks(params.draftId, blocks);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 });
  }
}
