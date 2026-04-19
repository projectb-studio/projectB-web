import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { toCsv } from "@/lib/csv";

type MemberRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  grade: string;
  is_blocked: boolean;
  joined_at: string;
  order_count: number;
  total_spent: number;
  last_order_at: string | null;
};

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("pb_admin_member_list", {
    p_search: url.searchParams.get("search") || null,
    p_grade: url.searchParams.get("grade") || null,
    p_blocked:
      url.searchParams.get("blocked") === "true"
        ? true
        : url.searchParams.get("blocked") === "false"
          ? false
          : null,
    p_sort: "joined_at",
    p_limit: 5000,
    p_offset: 0,
  });

  if (error) return new Response(error.message, { status: 500 });

  const header = [
    "user_id",
    "full_name",
    "email",
    "phone",
    "grade",
    "is_blocked",
    "joined_at",
    "order_count",
    "total_spent",
    "last_order_at",
  ];
  const rows = ((data as MemberRow[] | null) ?? []).map((r) =>
    header.map((k) => r[k as keyof MemberRow])
  );
  const csv = toCsv(header, rows);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="members-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
