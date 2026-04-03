-- ============================================
-- Project B — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. 상품
CREATE TABLE pb_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL,
  sale_price INTEGER,
  tag TEXT NOT NULL DEFAULT 'handmade',
  badge TEXT,
  description TEXT,
  details TEXT,
  shipping TEXT,
  care TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pb_product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES pb_products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pb_product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES pb_products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('color', 'size')),
  name TEXT NOT NULL,
  value TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 콘텐츠
CREATE TABLE pb_hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT NOT NULL DEFAULT 'PROJECT B',
  subheading TEXT NOT NULL DEFAULT 'Curated accessories for mindful living',
  cta_primary_text TEXT DEFAULT 'SHOP ONLINE',
  cta_primary_link TEXT DEFAULT '/category',
  cta_secondary_text TEXT DEFAULT 'VISIT STORE',
  cta_secondary_link TEXT DEFAULT '/store-location',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pb_hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pb_brand_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 주문
CREATE TABLE pb_orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  total_amount INTEGER NOT NULL,
  shipping_fee INTEGER NOT NULL DEFAULT 0,
  shipping_address JSONB,
  payment_id TEXT,
  payment_method TEXT,
  order_name TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pb_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES pb_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES pb_products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  options JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. 사용자
CREATE TABLE pb_users_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. 리뷰
CREATE TABLE pb_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES pb_products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL DEFAULT '익명',
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  image_urls TEXT[],
  is_published BOOLEAN NOT NULL DEFAULT true,
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. CS 문의
CREATE TABLE pb_cs_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('product', 'order', 'shipping', 'wholesale', 'etc')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  author_email TEXT,
  author_phone TEXT,
  company_name TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'answered')),
  answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. 공지사항
CREATE TABLE pb_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. 배너
CREATE TABLE pb_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE pb_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_brand_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_cs_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE pb_banners ENABLE ROW LEVEL SECURITY;

-- Public read for published products
CREATE POLICY "Public can read published products" ON pb_products
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can read product images" ON pb_product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pb_products WHERE id = product_id AND is_published = true)
  );

CREATE POLICY "Public can read product options" ON pb_product_options
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pb_products WHERE id = product_id AND is_published = true)
  );

-- Public read for content
CREATE POLICY "Public can read hero settings" ON pb_hero_settings
  FOR SELECT USING (true);

CREATE POLICY "Public can read active hero slides" ON pb_hero_slides
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read brand content" ON pb_brand_content
  FOR SELECT USING (true);

-- Public read for published notices
CREATE POLICY "Public can read published notices" ON pb_notices
  FOR SELECT USING (is_published = true);

-- Public read for active banners
CREATE POLICY "Public can read active banners" ON pb_banners
  FOR SELECT USING (is_active = true);

-- Public read for published reviews
CREATE POLICY "Public can read published reviews" ON pb_reviews
  FOR SELECT USING (is_published = true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON pb_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read own orders
CREATE POLICY "Users can read own orders" ON pb_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own order items" ON pb_order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pb_orders WHERE id = order_id AND user_id = auth.uid())
  );

-- Users can read/update own profile
CREATE POLICY "Users can read own profile" ON pb_users_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON pb_users_profile
  FOR UPDATE USING (auth.uid() = user_id);

-- Anyone can create inquiries
CREATE POLICY "Anyone can create inquiries" ON pb_cs_inquiries
  FOR INSERT WITH CHECK (true);

-- Users can read own inquiries
CREATE POLICY "Users can read own inquiries" ON pb_cs_inquiries
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Admin full access (service_role bypasses RLS, but also add explicit policies)
-- Admin reads all products (including unpublished)
CREATE POLICY "Admin can read all products" ON pb_products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage product images" ON pb_product_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage product options" ON pb_product_options
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage hero settings" ON pb_hero_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage hero slides" ON pb_hero_slides
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage brand content" ON pb_brand_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage orders" ON pb_orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage order items" ON pb_order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage reviews" ON pb_reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage inquiries" ON pb_cs_inquiries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage notices" ON pb_notices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage banners" ON pb_banners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage profiles" ON pb_users_profile
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pb_users_profile WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pb_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pb_hero_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pb_brand_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pb_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pb_users_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pb_cs_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pb_notices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Seed: default hero settings
-- ============================================

INSERT INTO pb_hero_settings (heading, subheading, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link)
VALUES ('PROJECT B', 'Curated accessories for mindful living', 'SHOP ONLINE', '/category', 'VISIT STORE', '/store-location');
