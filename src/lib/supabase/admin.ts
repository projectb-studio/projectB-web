import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client using service_role key.
 * Use ONLY in API Route Handlers after verifying admin role.
 * This client bypasses RLS.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createSupabaseClient(url, key, {
    auth: { persistSession: false },
  });
}
