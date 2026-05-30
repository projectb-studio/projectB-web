import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { listDraftsByProduct } from "@/lib/data/drafts";
import { generateDraftForProduct } from "@/lib/ai-draft/generate-service";

export const revalidate = 0;

// 상품별 초안 이력
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const drafts = await listDraftsByProduct(params.id);
  return NextResponse.json({ drafts });
}

// AI 초안 생성 (pending 으로 적재, 라이브 미반영)
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const draft = await generateDraftForProduct(params.id);
    return NextResponse.json({ draft }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
