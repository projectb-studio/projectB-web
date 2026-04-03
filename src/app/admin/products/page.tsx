"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  tag: string;
  badge: string | null;
  is_published: boolean;
  created_at: string;
  pb_product_images: { id: string; url: string; sort_order: number }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function togglePublish(id: string, currentState: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !currentState }),
    });
    fetchProducts();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 상품을 삭제하시겠습니까?`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchProducts();
  }

  const getFirstImage = (product: AdminProduct) => {
    const sorted = [...(product.pb_product_images || [])].sort(
      (a, b) => a.sort_order - b.sort_order
    );
    return sorted[0]?.url ?? null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[var(--pb-silver)]">로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-[var(--pb-gray)]">
          총 {products.length}개 상품
        </p>
        <Link href="/admin/products/new" className="btn-primary text-xs px-4 py-2 flex items-center gap-2">
          <Plus size={14} />
          상품 등록
        </Link>
      </div>

      {/* Table */}
      {products.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)] mb-4">등록된 상품이 없습니다.</p>
          <Link href="/admin/products/new" className="btn-primary text-xs px-4 py-2">
            첫 상품 등록하기
          </Link>
        </div>
      ) : (
        <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">이미지</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">상품명</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">가격</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">태그</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">뱃지</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">상태</th>
                <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">액션</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const imageUrl = getFirstImage(product);
                return (
                  <tr key={product.id} className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="relative w-10 h-10 bg-[var(--pb-off-white)] overflow-hidden">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--pb-silver)] text-[10px]">No img</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${product.id}`} className="hover:underline font-medium">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {product.sale_price ? (
                        <div>
                          <span className="text-[var(--accent-sale)] font-medium">{formatPrice(product.sale_price)}</span>
                          <span className="text-[var(--pb-silver)] line-through text-xs ml-1">{formatPrice(product.price)}</span>
                        </div>
                      ) : (
                        formatPrice(product.price)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[var(--pb-gray)] uppercase">{product.tag}</span>
                    </td>
                    <td className="px-4 py-3">
                      {product.badge ? (
                        <span className="text-[10px] px-1.5 py-0.5 border border-[var(--pb-light-gray)] uppercase">{product.badge}</span>
                      ) : (
                        <span className="text-[var(--pb-silver)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublish(product.id, product.is_published)}
                        className={cn(
                          "flex items-center gap-1 text-xs transition-colors",
                          product.is_published
                            ? "text-[#2D8F4E]"
                            : "text-[var(--pb-silver)]"
                        )}
                      >
                        {product.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                        {product.is_published ? "공개" : "비공개"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-1.5 text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] transition-colors"
                          title="수정"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 text-[var(--pb-gray)] hover:text-[var(--accent-sale)] transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
