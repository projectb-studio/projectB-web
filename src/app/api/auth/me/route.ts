import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ isLoggedIn: false, isAdmin: false });
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("pb_users_profile")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = (profile as { role?: string } | null)?.role;

  return NextResponse.json({
    isLoggedIn: true,
    isAdmin: role === "admin",
  });
}
