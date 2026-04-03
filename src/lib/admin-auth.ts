import { createClient } from "@/lib/supabase/server";
import type { DbUserProfile } from "@/types/database";

/**
 * Check if current authenticated user has admin role.
 * Returns the user profile if admin, null otherwise.
 */
export async function getAdminUser(): Promise<DbUserProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await (supabase
    .from("pb_users_profile") as ReturnType<typeof supabase.from>)
    .select("*")
    .eq("user_id", user.id)
    .single();

  const row = profile as unknown as DbUserProfile | null;
  if (!row || row.role !== "admin") return null;

  return row;
}
