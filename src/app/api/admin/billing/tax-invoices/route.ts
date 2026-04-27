import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TaxInvoiceStatus } from "@/types/database";

const ALLOWED_STATUSES: readonly TaxInvoiceStatus[] = ["requested", "issued", "cancelled"];

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const supabase = createAdminClient();
  let query = (supabase.from("pb_tax_invoices") as ReturnType<typeof supabase.from>)
    .select("*")
    .order("created_at", { ascending: false });

  if (status && ALLOWED_STATUSES.includes(status as TaxInvoiceStatus)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    order_id,
    company_name,
    business_number,
    representative,
    address,
    email,
    supply_amount,
    vat_amount,
  } = body as {
    order_id?: string | null;
    company_name?: string;
    business_number?: string;
    representative?: string | null;
    address?: string | null;
    email?: string | null;
    supply_amount?: number;
    vat_amount?: number;
  };

  if (!company_name || !business_number || supply_amount === undefined || vat_amount === undefined) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  const total_amount = supply_amount + vat_amount;

  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("pb_tax_invoices") as ReturnType<typeof supabase.from>)
    .insert({
      order_id: order_id ?? null,
      company_name,
      business_number,
      representative: representative ?? null,
      address: address ?? null,
      email: email ?? null,
      supply_amount,
      vat_amount,
      total_amount,
      status: "requested",
      invoice_number: null,
      issued_at: null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
