-- ============================================
-- Project B — Seed: 16 Dummy Products
-- Run this AFTER schema.sql
-- ============================================

-- Shared detail values (matches DUMMY_DETAIL in src/lib/data/products.ts)
-- description: "Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan's touch."
-- details:     "Dimensions: approx. 15 × 10 × 8 cm\nWeight: approx. 250g\nOrigin: South Korea"
-- shipping:    "Free shipping on orders over ₩50,000.\nStandard delivery: 2-3 business days.\nIsland/remote areas: 3-5 business days."
-- care:        "Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care."

-- ============================================
-- pb_products
-- ============================================

-- Product 1: Ceramic vase — matte black
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000001-0000-0000-0000-000000000001',
  'Ceramic vase — matte black',
  'ceramic-vase-matte-black',
  38000,
  NULL,
  'handmade',
  NULL,
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  1
);

-- Product 2: Linen table runner — ivory
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000002-0000-0000-0000-000000000002',
  'Linen table runner — ivory',
  'linen-table-runner-ivory',
  28000,
  NULL,
  'fabric',
  'NEW',
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  2
);

-- Product 3: Brass candle holder set
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000003-0000-0000-0000-000000000003',
  'Brass candle holder set',
  'brass-candle-holder-set',
  52000,
  NULL,
  'metal',
  NULL,
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  3
);

-- Product 4: Wool felt coaster (4p)
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000004-0000-0000-0000-000000000004',
  'Wool felt coaster (4p)',
  'wool-felt-coaster-4p',
  18000,
  NULL,
  'fabric',
  'BEST',
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  4
);

-- Product 5: Oak wood tray — natural
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000005-0000-0000-0000-000000000005',
  'Oak wood tray — natural',
  'oak-wood-tray-natural',
  45000,
  NULL,
  'wood',
  NULL,
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  5
);

-- Product 6: Cotton blend napkin set (SALE: 27500 → 22000)
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000006-0000-0000-0000-000000000006',
  'Cotton blend napkin set',
  'cotton-blend-napkin-set',
  27500,
  22000,
  'fabric',
  'SALE',
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  6
);

-- Product 7: Stone incense holder
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000007-0000-0000-0000-000000000007',
  'Stone incense holder',
  'stone-incense-holder',
  32000,
  NULL,
  'stone',
  'NEW',
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  7
);

-- Product 8: Hand-blown glass cup
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000008-0000-0000-0000-000000000008',
  'Hand-blown glass cup',
  'hand-blown-glass-cup',
  28000,
  NULL,
  'glass',
  NULL,
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  8
);

-- Product 9: Handwoven rattan basket
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000009-0000-0000-0000-000000000009',
  'Handwoven rattan basket',
  'handwoven-rattan-basket',
  42000,
  NULL,
  'handmade',
  'NEW',
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  9
);

-- Product 10: Copper wire ring holder
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000010-0000-0000-0000-000000000010',
  'Copper wire ring holder',
  'copper-wire-ring-holder',
  25000,
  NULL,
  'metal',
  'BEST',
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  10
);

-- Product 11: Walnut cutting board — small
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000011-0000-0000-0000-000000000011',
  'Walnut cutting board — small',
  'walnut-cutting-board-small',
  35000,
  NULL,
  'wood',
  NULL,
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  11
);

-- Product 12: Marble soap dish
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000012-0000-0000-0000-000000000012',
  'Marble soap dish',
  'marble-soap-dish',
  29000,
  NULL,
  'stone',
  NULL,
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  12
);

-- Product 13: Linen cushion cover — charcoal (SALE: 32000 → 25600)
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000013-0000-0000-0000-000000000013',
  'Linen cushion cover — charcoal',
  'linen-cushion-cover-charcoal',
  32000,
  25600,
  'fabric',
  'SALE',
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  13
);

-- Product 14: Borosilicate glass carafe
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000014-0000-0000-0000-000000000014',
  'Borosilicate glass carafe',
  'borosilicate-glass-carafe',
  38000,
  NULL,
  'glass',
  NULL,
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  14
);

-- Product 15: Clay pinch bowl set (3p)
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000015-0000-0000-0000-000000000015',
  'Clay pinch bowl set (3p)',
  'clay-pinch-bowl-set-3p',
  24000,
  NULL,
  'handmade',
  'BEST',
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  15
);

-- Product 16: Iron candle snuffer
INSERT INTO pb_products (id, name, slug, price, sale_price, tag, badge, description, details, shipping, care, is_published, sort_order)
VALUES (
  '0b000016-0000-0000-0000-000000000016',
  'Iron candle snuffer',
  'iron-candle-snuffer',
  18000,
  NULL,
  'metal',
  NULL,
  'Carefully crafted by hand using traditional techniques. Each piece is unique with subtle variations that reflect the artisan''s touch.',
  'Dimensions: approx. 15 × 10 × 8 cm' || chr(10) || 'Weight: approx. 250g' || chr(10) || 'Origin: South Korea',
  'Free shipping on orders over ₩50,000.' || chr(10) || 'Standard delivery: 2-3 business days.' || chr(10) || 'Island/remote areas: 3-5 business days.',
  'Wipe with a soft dry cloth. Avoid direct sunlight and moisture. Handle with care.',
  true,
  16
);

-- ============================================
-- pb_product_images (sort_order 0 = primary)
-- ============================================

INSERT INTO pb_product_images (product_id, url, sort_order) VALUES
  ('0b000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000002-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000003-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000004-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000005-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000006-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000007-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1600056809880-a46e89b2e704?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000008-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1514651029227-c09ada3d8a33?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000009-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000010-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000011-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000012-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000013-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000014-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1570784061670-6fb0a7eb8869?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000015-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=600&h=600&fit=crop&crop=center', 0),
  ('0b000016-0000-0000-0000-000000000016', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&h=600&fit=crop&crop=center', 0);

-- ============================================
-- pb_product_options
-- Products with options: 1 (color), 2 (color+size), 4 (color)
-- ============================================

-- Product 1: Ceramic vase — colors
INSERT INTO pb_product_options (product_id, type, name, value, sort_order) VALUES
  ('0b000001-0000-0000-0000-000000000001', 'color', 'Matte Black', '#1A1A1A', 0),
  ('0b000001-0000-0000-0000-000000000001', 'color', 'Ivory', '#F5F0E8', 1);

-- Product 2: Linen table runner — colors + sizes
INSERT INTO pb_product_options (product_id, type, name, value, sort_order) VALUES
  ('0b000002-0000-0000-0000-000000000002', 'color', 'Ivory', '#F5F0E8', 0),
  ('0b000002-0000-0000-0000-000000000002', 'color', 'Natural', '#D4C5A9', 1),
  ('0b000002-0000-0000-0000-000000000002', 'size', 'S', NULL, 0),
  ('0b000002-0000-0000-0000-000000000002', 'size', 'L', NULL, 1);

-- Product 4: Wool felt coaster — colors
INSERT INTO pb_product_options (product_id, type, name, value, sort_order) VALUES
  ('0b000004-0000-0000-0000-000000000004', 'color', 'Gray', '#8B8B8B', 0),
  ('0b000004-0000-0000-0000-000000000004', 'color', 'Beige', '#D9C9AE', 1);
