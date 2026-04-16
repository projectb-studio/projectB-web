import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DbUserProfile } from "@/types/database";

/**
 * Check if current authenticated user has admin role.
 * 1. Server client (anon key) 로 auth session 확인
 * 2. Admin client (service_role, RLS bypass) 로 profile 조회
 */
export async function getAdminUser(): Promise<DbUserProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("pb_users_profile")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const row = profile as unknown as DbUserProfile | null;
  if (!row || row.role !== "admin") return null;

  return row;
}
