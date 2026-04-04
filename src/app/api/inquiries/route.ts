import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createClient();

  const { error } = await supabase.from("pb_cs_inquiries").insert({
    type: body.type,
    title: body.title,
    content: body.content,
    author_name: body.author_name || null,
    author_email: body.author_email || null,
    author_phone: body.author_phone || null,
    company_name: body.company_name || null,
    status: "received",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pb_cs_inquiries")
    .select("id, type, title, content, status, answer, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
