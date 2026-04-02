"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/stores/recentlyViewed";
import type { Product } from "@/types/database";

interface TrackViewProps {
  product: Product;
}

export function TrackView({ product }: TrackViewProps) {
  const addProduct = useRecentlyViewedStore((state) => state.addProduct);

  useEffect(() => {
    addProduct(product);
  }, [product, addProduct]);

  return null;
}
