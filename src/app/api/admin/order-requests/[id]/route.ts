import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderRequestStatus } from "@/types/database";

const ALLOWED_STATUSES: readonly OrderRequestStatus[] = [
  "pending",
  "approved",
  "rejected",
  "completed",
];

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, admin_note, refund_amount } = body as {
    status?: OrderRequestStatus;
    admin_note?: string | null;
    refund_amount?: number | null;
  };

  if (status && !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const update: Record<string, unknown> = {};
  if (status) {
    update.status = status;
    if (status === "approved" || status === "rejected" || status === "completed") {
      update.processed_at = new Date().toISOString();
    }
  }
  if (admin_note !== undefined) update.admin_note = admin_note;
  if (refund_amount !== undefined) update.refund_amount = refund_amount;

  const { data, error } = await (supabase.from("pb_order_requests") as ReturnType<typeof supabase.from>)
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await (supabase.from("pb_order_requests") as ReturnType<typeof supabase.from>)
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
