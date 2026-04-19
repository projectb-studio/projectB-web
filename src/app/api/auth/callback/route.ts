import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/mypage";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
  }

  // 차단된 회원 차단 (pb_users_profile.is_blocked)
  const { data: profile } = await (supabase
    .from("pb_users_profile") as ReturnType<typeof supabase.from>)
    .select("is_blocked")
    .eq("user_id", data.session.user.id)
    .single();

  if (profile && (profile as { is_blocked?: boolean }).is_blocked === true) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/auth?error=blocked`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
