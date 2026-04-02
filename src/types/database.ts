/**
 * Database type definitions.
 * TODO: Auto-generate with `supabase gen types typescript` after DB schema setup.
 */

// Row types defined separately to avoid self-referential type issues
type PbProductsRow = {
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

type PbOrdersRow = {
  id: string;
  user_id: string | null;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  shipping_fee: number;
  shipping_address: Record<string, unknown>;
  payment_key: string | null;
  payment_method: string | null;
  order_name: string;
  created_at: string;
  updated_at: string;
};

type PbOrderItemsRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      // Project B tables will be prefixed with `pb_`
      pb_products: {
        Row: PbProductsRow;
        Insert: Omit<PbProductsRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<PbProductsRow, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      pb_orders: {
        Row: PbOrdersRow;
        Insert: Omit<PbOrdersRow, "created_at" | "updated_at">;
        Update: Partial<Omit<PbOrdersRow, "created_at" | "updated_at">>;
        Relationships: [
          {
            foreignKeyName: "pb_orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      pb_order_items: {
        Row: PbOrderItemsRow;
        Insert: Omit<PbOrderItemsRow, "id" | "created_at">;
        Update: Partial<Omit<PbOrderItemsRow, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "pb_order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "pb_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pb_order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "pb_products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ProductTag = "handmade" | "fabric" | "metal" | "wood" | "stone" | "glass";
export type ProductBadge = "NEW" | "BEST" | "SALE" | "HANDMADE" | null;

export interface ProductColorOption {
  name: string;
  value: string; // hex color code
}

export interface ProductOptions {
  colors?: ProductColorOption[];
  sizes?: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  tag: ProductTag;
  badge?: ProductBadge;
  slug: string;
  imageUrl: string;
  images?: string[];
  description?: string;
  details?: string;
  shipping?: string;
  care?: string;
  material?: string;
  options?: ProductOptions;
}
