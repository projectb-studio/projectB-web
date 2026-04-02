import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/database";

const MAX_ITEMS = 10;

interface RecentlyViewedState {
  items: Product[];
  addProduct: (product: Product) => void;
  getProducts: () => Product[];
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addProduct: (product) => {
        set((state) => {
          // Remove duplicate if exists
          const filtered = state.items.filter(
            (item) => item.id !== product.id,
          );
          // Add to front, cap at MAX_ITEMS
          return { items: [product, ...filtered].slice(0, MAX_ITEMS) };
        });
      },

      getProducts: () => get().items,
    }),
    { name: "pb-recently-viewed" },
  ),
);
