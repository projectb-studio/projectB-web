import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/data/products";

// GET /api/search?q=<query>
// Returns up to 20 matching products. Used by client components (e.g. SearchOverlay).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const products = await searchProducts(query);

  return NextResponse.json({ products });
}
