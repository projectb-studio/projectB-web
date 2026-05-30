import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { listPendingDrafts } from "@/lib/data/drafts";

export const revalidate = 0;

// 전체 검수 대기 큐
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const drafts = await listPendingDrafts();
  return NextResponse.json({ drafts });
}
