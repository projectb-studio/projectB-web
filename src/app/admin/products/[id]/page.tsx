"use client";

import { useState, useEffect, use } from "react";
import { ProductForm } from "@/components/admin/forms/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

interface ProductData {
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
  pb_product_images: { url: string; sort_order: number }[];
  pb_product_options: { type: "color" | "size"; name: string; value: string | null; sort_order: number }[];
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`/api/admin/products/${id}`);
      if (res.ok) {
        setProduct(await res.json());
      } else {
        setError(true);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[var(--pb-silver)]">로딩 중...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-[var(--pb-gray)]">상품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    sale_price: product.sale_price,
    tag: product.tag,
    badge: product.badge,
    description: product.description ?? "",
    details: product.details ?? "",
    shipping: product.shipping ?? "",
    care: product.care ?? "",
    is_published: product.is_published,
    images: (product.pb_product_images || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({ url: img.url, sort_order: img.sort_order })),
    options: (product.pb_product_options || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((opt) => ({
        type: opt.type,
        name: opt.name,
        value: opt.value ?? "",
        sort_order: opt.sort_order,
      })),
  };

  return (
    <div>
      <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-6">
        상품 수정
      </h2>
      <ProductForm initialData={initialData} />
    </div>
  );
}
