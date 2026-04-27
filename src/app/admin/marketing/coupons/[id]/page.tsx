"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarketingNav } from "@/components/admin/marketing/MarketingNav";
import { CouponForm } from "@/components/admin/marketing/CouponForm";
import type { DbCoupon } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCouponPage({ params }: PageProps) {
  const { id } = use(params);
  const [coupon, setCoupon] = useState<DbCoupon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/coupons/${id}`);
      if (res.ok) setCoupon(await res.json());
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div>
        <MarketingNav />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[var(--pb-silver)]">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div>
        <MarketingNav />
        <p className="text-sm text-[var(--pb-gray)]">쿠폰을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <MarketingNav />
      <Link
        href="/admin/marketing/coupons"
        className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1 mb-4"
      >
        <ArrowLeft size={12} /> 쿠폰 목록
      </Link>
      <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-6">쿠폰 편집</h2>
      <CouponForm mode="edit" initial={coupon} />
    </div>
  );
}
