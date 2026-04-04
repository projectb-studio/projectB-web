/**
 * Database type definitions.
 * Matches supabase/schema.sql tables.
 */

// ---- DB Row Types ----

export type DbProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  tag: string;
  badge: string | null;
  description: string | null;
  details: string | null;
  shipping: string | null;
  care: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DbProductImage = {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
  created_at: string;
};

export type DbProductOption = {
  id: string;
  product_id: string;
  type: "color" | "size";
  name: string;
  value: string | null;
  sort_order: number;
  created_at: string;
};

export type DbHeroSettings = {
  id: string;
  heading: string;
  subheading: string;
  cta_primary_text: string | null;
  cta_primary_link: string | null;
  cta_secondary_text: string | null;
  cta_secondary_link: string | null;
  updated_at: string;
};

export type DbHeroSlide = {
  id: string;
  type: "image" | "video";
  media_url: string;
  alt: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type DbBrandContent = {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  sort_order: number;
  updated_at: string;
};

export type DbOrder = {
  id: string;
  user_id: string | null;
  status: "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled" | "refunded";
  total_amount: number;
  shipping_fee: number;
  shipping_address: Record<string, unknown> | null;
  payment_id: string | null;
  payment_method: string | null;
  order_name: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
};

export type DbOrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  options: Record<string, unknown> | null;
  created_at: string;
};

export type DbUserProfile = {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
  updated_at: string;
};

export type DbReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  content: string | null;
  image_urls: string[] | null;
  is_published: boolean;
  is_hidden: boolean;
  admin_reply: string | null;
  created_at: string;
};

export type DbCsInquiry = {
  id: string;
  type: "product" | "order" | "shipping" | "wholesale" | "etc";
  title: string;
  content: string;
  user_id: string | null;
  author_name: string | null;
  author_email: string | null;
  author_phone: string | null;
  company_name: string | null;
  status: "received" | "in_progress" | "answered" | "closed";
  answer: string | null;
  created_at: string;
  updated_at: string;
};

export type DbNotice = {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type DbBanner = {
  id: string;
  title: string;
  image_url: string;
  link: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type DbMagazineCategory = {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type DbMagazinePost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  category_id: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

// ---- Supabase Database type (for createBrowserClient/createServerClient generics) ----

export type Database = {
  public: {
    Tables: {
      pb_products: {
        Row: DbProduct;
        Insert: Omit<DbProduct, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbProduct, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      pb_product_images: {
        Row: DbProductImage;
        Insert: Omit<DbProductImage, "id" | "created_at">;
        Update: Partial<Omit<DbProductImage, "id" | "created_at">>;
        Relationships: [];
      };
      pb_product_options: {
        Row: DbProductOption;
        Insert: Omit<DbProductOption, "id" | "created_at">;
        Update: Partial<Omit<DbProductOption, "id" | "created_at">>;
        Relationships: [];
      };
      pb_hero_settings: {
        Row: DbHeroSettings;
        Insert: Omit<DbHeroSettings, "id" | "updated_at">;
        Update: Partial<Omit<DbHeroSettings, "id" | "updated_at">>;
        Relationships: [];
      };
      pb_hero_slides: {
        Row: DbHeroSlide;
        Insert: Omit<DbHeroSlide, "id" | "created_at">;
        Update: Partial<Omit<DbHeroSlide, "id" | "created_at">>;
        Relationships: [];
      };
      pb_brand_content: {
        Row: DbBrandContent;
        Insert: Omit<DbBrandContent, "id" | "updated_at">;
        Update: Partial<Omit<DbBrandContent, "id" | "updated_at">>;
        Relationships: [];
      };
      pb_orders: {
        Row: DbOrder;
        Insert: Omit<DbOrder, "created_at" | "updated_at">;
        Update: Partial<Omit<DbOrder, "created_at" | "updated_at">>;
        Relationships: [];
      };
      pb_order_items: {
        Row: DbOrderItem;
        Insert: Omit<DbOrderItem, "id" | "created_at">;
        Update: Partial<Omit<DbOrderItem, "id" | "created_at">>;
        Relationships: [];
      };
      pb_users_profile: {
        Row: DbUserProfile;
        Insert: Omit<DbUserProfile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbUserProfile, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      pb_reviews: {
        Row: DbReview;
        Insert: Omit<DbReview, "id" | "created_at">;
        Update: Partial<Omit<DbReview, "id" | "created_at">>;
        Relationships: [];
      };
      pb_cs_inquiries: {
        Row: DbCsInquiry;
        Insert: Omit<DbCsInquiry, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbCsInquiry, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      pb_notices: {
        Row: DbNotice;
        Insert: Omit<DbNotice, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbNotice, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      pb_banners: {
        Row: DbBanner;
        Insert: Omit<DbBanner, "id" | "created_at">;
        Update: Partial<Omit<DbBanner, "id" | "created_at">>;
        Relationships: [];
      };
      pb_magazine_categories: {
        Row: DbMagazineCategory;
        Insert: Omit<DbMagazineCategory, "id" | "created_at">;
        Update: Partial<Omit<DbMagazineCategory, "id" | "created_at">>;
        Relationships: [];
      };
      pb_magazine: {
        Row: DbMagazinePost;
        Insert: Omit<DbMagazinePost, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbMagazinePost, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
    };
    /* eslint-disable @typescript-eslint/no-empty-object-type */
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
    /* eslint-enable @typescript-eslint/no-empty-object-type */
  };
};

// ---- Frontend Types (used by components) ----

export type ProductTag = "handmade" | "fabric" | "metal" | "wood" | "stone" | "glass";
export type ProductBadge = "NEW" | "BEST" | "SALE" | "HANDMADE" | null;

export interface ProductColorOption {
  name: string;
  value: string;
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
