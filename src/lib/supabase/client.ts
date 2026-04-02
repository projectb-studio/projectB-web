import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Create a Supabase client for use in Client Components.
 * Uses browser cookies for auth session management.
 * Returns null-safe stub during build/prerender when env vars are missing.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a proxy that won't crash during SSR/prerender
    return createBrowserClient<Database>(
      "https://placeholder.supabase.co",
      "placeholder-key"
    );
  }

  return createBrowserClient<Database>(url, key);
}
