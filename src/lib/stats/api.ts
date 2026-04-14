import { NextResponse } from "next/server";
import { parsePeriod, type Period, type Preset } from "./period";
import { getAdminUser } from "@/lib/admin-auth";

type GuardResult =
  | { error: NextResponse; period?: undefined }
  | { error?: undefined; period: Period };

export async function statsGuard(req: Request): Promise<GuardResult> {
  const admin = await getAdminUser();
  if (!admin) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const url = new URL(req.url);
  try {
    const preset = url.searchParams.get("preset") as Preset | null;
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;
    const p = parsePeriod(preset ? { preset } : { from, to });
    return { period: p };
  } catch (e) {
    return {
      error: NextResponse.json({ error: (e as Error).message }, { status: 400 }),
    };
  }
}
