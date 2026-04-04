import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("pb_cs_inquiries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {};
  if ("answer" in body) updateData.answer = body.answer;
  if ("status" in body) updateData.status = body.status;

  // Auto-set status to answered when answer is provided
  if (body.answer && !body.status) {
    updateData.status = "answered";
  }

  const { error } = await supabase
    .from("pb_cs_inquiries")
    .update(updateData)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
