import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const PAGE_SIZE = 20;
const VALID_SORT = new Set(["joined_at", "last_order_at", "total_spent"]);

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? "";
  const grade = url.searchParams.get("grade");
  const blocked = url.searchParams.get("blocked");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const sort = url.searchParams.get("sort") ?? "joined_at";
  if (!VALID_SORT.has(sort)) {
    return NextResponse.json({ error: "bad sort" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("pb_admin_member_list", {
    p_search: search || null,
    p_grade: grade || null,
    p_blocked: blocked === "true" ? true : blocked === "false" ? false : null,
    p_sort: sort,
    p_limit: PAGE_SIZE,
    p_offset: (page - 1) * PAGE_SIZE,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    items: data ?? [],
    page,
    pageSize: PAGE_SIZE,
  });
}
