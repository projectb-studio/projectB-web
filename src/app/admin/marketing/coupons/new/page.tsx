import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarketingNav } from "@/components/admin/marketing/MarketingNav";
import { CouponForm } from "@/components/admin/marketing/CouponForm";

export default function NewCouponPage() {
  return (
    <div>
      <MarketingNav />
      <Link
        href="/admin/marketing/coupons"
        className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1 mb-4"
      >
        <ArrowLeft size={12} /> 쿠폰 목록
      </Link>
      <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-6">쿠폰 생성</h2>
      <CouponForm mode="create" />
    </div>
  );
}
