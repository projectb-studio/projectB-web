import { createClient } from "@/lib/supabase/server";
import { DEFAULT_THEME_ID } from "@/constants/themes";

export async function getThemeId(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data } = await (supabase
      .from("pb_site_settings") as ReturnType<typeof supabase.from>)
      .select("theme_id")
      .limit(1)
      .single();

    if (data && typeof data === "object" && "theme_id" in data) {
      return (data as { theme_id: string }).theme_id;
    }
  } catch {
    // Table may not exist yet or no row — use default
  }
  return DEFAULT_THEME_ID;
}
