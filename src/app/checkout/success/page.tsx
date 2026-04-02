"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/stores/cart";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) return;

    async function confirmPayment() {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.message ?? "결제 승인에 실패했습니다.");
          return;
        }

        clearCart();
        setConfirmed(true);
      } catch {
        setError("결제 처리 중 오류가 발생했습니다.");
      }
    }

    confirmPayment();
  }, [paymentKey, orderId, amount, clearCart]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="heading-section text-2xl mb-4">결제 오류</h1>
        <p className="text-pb-gray text-sm mb-8">{error}</p>
        <Link href="/cart" className="btn-primary">
          장바구니로 돌아가기
        </Link>
      </main>
    );
  }

  if (!confirmed) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-pb-gray text-sm">결제 승인 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-12 h-px bg-pb-light-gray mb-8" />
      <h1 className="heading-section text-2xl lg:text-3xl mb-4">주문 완료</h1>
      <p className="text-pb-gray text-sm mb-2">주문번호: {orderId}</p>
      <p className="text-pb-gray text-sm mb-10">
        주문이 성공적으로 완료되었습니다.
      </p>
      <div className="flex gap-4">
        <Link href="/mypage" className="btn-secondary">
          주문내역 보기
        </Link>
        <Link href="/shop" className="btn-primary">
          쇼핑 계속하기
        </Link>
      </div>
    </main>
  );
}
