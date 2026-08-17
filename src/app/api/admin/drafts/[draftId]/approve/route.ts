import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import {
  getDraft,
  markDraftPublished,
  publishToProduct,
} from "@/lib/data/drafts";
import { sanitizeBlocks } from "@/lib/detail-blocks/sanitize-blocks";
import { assertPublishable, PlaceholderError } from "@/lib/detail-blocks/publish-gate";

export const revalidate = 0;

/**
 * 승인 후 발행.
 *
 * pending → published 전이는 오직 이 운영자 액션으로만 발생한다(명시적 게이트).
 * 발행 직전 sanitizeBlocks 로 재검증(Zod + DOMPurify + 이미지 출처 allowlist)하므로
 * AI 가 만든 HTML/URL 도 라이브 진입 전 한 번 더 필터링된다.
 */
export async function POST(
  _req: Request,
  { params }: { params: { draftId: string } }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const draft = await getDraft(params.draftId);
  if (!draft) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (draft.status !== "pending") {
    return NextResponse.json(
      { error: "이미 처리된 초안입니다" },
      { status: 409 }
    );
  }

  let safeBlocks;
  try {
    // 발행 경계 재검증 — AI 산출물도 동일 신뢰 경계를 통과해야 한다.
    safeBlocks = sanitizeBlocks(draft.blocks);
    // 채우지 않은 법정 항목이 남아 있으면 발행하지 않는다 (고시 일반원칙 3).
    assertPublishable(safeBlocks);
  } catch (e) {
    if (e instanceof PlaceholderError) {
      return NextResponse.json(
        { error: e.message, placeholders: e.placeholders },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: `발행 검증 실패: ${(e as Error).message}` },
      { status: 422 }
    );
  }

  try {
    await publishToProduct(draft.product_id, safeBlocks);
    await markDraftPublished(params.draftId, admin.user_id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
