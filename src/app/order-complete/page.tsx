import Link from "next/link";
import { CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "주문 완료" };

export default function OrderCompletePage() {
  return (
    <section className="max-w-narrow mx-auto px-6 lg:px-12 py-20 text-center">
      <CheckCircle
        size={48}
        strokeWidth={1}
        className="mx-auto text-accent-success mb-6"
      />

      <h1 className="heading-display text-2xl tracking-wide mb-4">
        Thank You
      </h1>
      <p className="text-sm text-pb-gray mb-2">
        주문이 성공적으로 완료되었습니다.
      </p>
      <p className="text-xs text-pb-silver mb-10">
        주문 확인 이메일이 발송됩니다. 마이페이지에서 주문 상태를 확인할 수 있습니다.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/mypage" className="btn-primary">
          View Orders
        </Link>
        <Link href="/shop" className="btn-secondary">
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}
