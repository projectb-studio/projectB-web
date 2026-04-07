import { createClient } from "@/lib/supabase/server";

export interface HeroData {
  heading: string;
  subheading: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  slides: { id: number; src: string; alt: string }[];
}

export async function getHeroData(): Promise<HeroData> {
  const supabase = await createClient();

  const [settingsRes, slidesRes] = await Promise.all([
    supabase.from("pb_hero_settings").select("*").limit(1).single(),
    supabase.from("pb_hero_slides").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
  ]);

  const s = settingsRes.data as Record<string, unknown> | null;
  const slideRows = (slidesRes.data ?? []) as Record<string, unknown>[];

  // Fall back to constants if DB has no data yet
  const fallbackSlides =
    slideRows.length > 0
      ? slideRows.map((row, i) => ({
          id: i,
          src: row.media_url as string,
          alt: (row.alt as string) || "",
        }))
      : [
          { id: 0, src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80", alt: "Handcrafted interior accessories" },
          { id: 1, src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80", alt: "Artisan ceramics collection" },
          { id: 2, src: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1920&q=80", alt: "Minimal lifestyle objects" },
          { id: 3, src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80", alt: "Handmade craft workspace" },
        ];

  return {
    heading: (s?.heading as string) ?? "PROJECT B",
    subheading: (s?.subheading as string) ?? "Curated accessories for mindful living",
    primaryCta: {
      label: (s?.cta_primary_text as string) ?? "SHOP ONLINE",
      href: (s?.cta_primary_link as string) ?? "/category",
    },
    secondaryCta: {
      label: (s?.cta_secondary_text as string) ?? "VISIT STORE",
      href: (s?.cta_secondary_link as string) ?? "/store-location",
    },
    slides: fallbackSlides,
  };
}
