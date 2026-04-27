import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TaxInvoiceStatus } from "@/types/database";

const ALLOWED_STATUSES: readonly TaxInvoiceStatus[] = ["requested", "issued", "cancelled"];

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, invoice_number } = body as {
    status?: TaxInvoiceStatus;
    invoice_number?: string | null;
  };

  if (status && !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (status) {
    update.status = status;
    if (status === "issued") update.issued_at = new Date().toISOString();
  }
  if (invoice_number !== undefined) update.invoice_number = invoice_number;

  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("pb_tax_invoices") as ReturnType<typeof supabase.from>)
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
  const { error } = await (supabase.from("pb_tax_invoices") as ReturnType<typeof supabase.from>)
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
