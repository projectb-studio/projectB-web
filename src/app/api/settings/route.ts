import { NextResponse } from "next/server";
import { getThemeId } from "@/lib/data/settings";

export async function GET() {
  const themeId = await getThemeId();
  return NextResponse.json({ theme_id: themeId });
}
