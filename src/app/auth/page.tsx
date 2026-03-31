import type { Metadata } from "next";

export const metadata: Metadata = { title: "로그인" };

export default function AuthPage() {
  return (
    <section className="max-w-md mx-auto px-4 py-20">
      <h1 className="heading-display text-xl text-center mb-12 tracking-[0.2em]">LOGIN</h1>
      {/* TODO: Social login buttons (Kakao, Naver, Google, Apple) */}
      {/* TODO: Email login form */}
      <p className="text-center text-[var(--pb-gray)] text-sm">로그인 준비 중입니다.</p>
    </section>
  );
}
