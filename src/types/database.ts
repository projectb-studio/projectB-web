/**
 * Database type definitions.
 * TODO: Auto-generate with `supabase gen types typescript` after DB schema setup.
 */
export type Database = {
  public: {
    Tables: {
      // Project B tables will be prefixed with `pb_`
      pb_products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          sale_price: number | null;
          category: string;
          tags: string[];
          images: string[];
          is_handmade: boolean;
          material: string | null;
          stock: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["pb_products"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["pb_products"]["Insert"]
        >;
      };
      pb_orders: {
        Row: {
          id: string;
          user_id: string | null;
          status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
          total_amount: number;
          shipping_address: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["pb_orders"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["pb_orders"]["Insert"]
        >;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

export type ProductTag = "handmade" | "fabric" | "metal" | "wood" | "stone" | "glass";
export type ProductBadge = "NEW" | "BEST" | "SALE" | "HANDMADE" | null;

export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  tag: ProductTag;
  badge?: ProductBadge;
  slug: string;
  imageUrl: string;
}
