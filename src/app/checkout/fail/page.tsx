"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutFailPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-12 h-px bg-accent-sale mb-8" />
      <h1 className="heading-section text-2xl lg:text-3xl mb-4">결제 실패</h1>
      <p className="text-pb-gray text-sm mb-2">
        {message ?? "결제 처리 중 문제가 발생했습니다."}
      </p>
      {code && (
        <p className="text-pb-silver text-xs mb-10">오류 코드: {code}</p>
      )}
      <div className="flex gap-4">
        <Link href="/checkout" className="btn-primary">
          다시 시도하기
        </Link>
        <Link href="/cart" className="btn-secondary">
          장바구니로 돌아가기
        </Link>
      </div>
    </main>
  );
}
