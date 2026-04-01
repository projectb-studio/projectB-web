"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SOCIAL_PROVIDERS = [
  { id: "kakao", label: "카카오로 시작하기", bg: "#FEE500", text: "#191919" },
  { id: "naver", label: "네이버로 시작하기", bg: "#03C75A", text: "#FFFFFF" },
  { id: "google", label: "Google로 시작하기", bg: "#FFFFFF", text: "#191919" },
  { id: "apple", label: "Apple로 시작하기", bg: "#000000", text: "#FFFFFF" },
] as const;

type Tab = "login" | "signup";

function InputField({
  label,
  id,
  type = "text",
  placeholder,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        required
        className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors"
      />
    </div>
  );
}

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>("login");

  return (
    <section className="max-w-sm mx-auto px-6 py-16 lg:py-24">
      <h1 className="heading-display text-xl text-center tracking-wide mb-10">
        {tab === "login" ? "Login" : "Sign Up"}
      </h1>

      {/* Social login */}
      <div className="space-y-2.5 mb-8">
        {SOCIAL_PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => {
              // TODO: Supabase Auth social login
            }}
            className="w-full py-3 px-4 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: provider.bg,
              color: provider.text,
              border: provider.id === "google" ? "1px solid #D4D4D4" : "none",
            }}
          >
            {provider.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-pb-light-gray/40" />
        <span className="text-[10px] text-pb-silver uppercase tracking-industrial">or</span>
        <div className="flex-1 h-px bg-pb-light-gray/40" />
      </div>

      {/* Tab toggle */}
      <div className="flex mb-6 border border-pb-light-gray">
        {(["login", "signup"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2.5 text-xs font-heading font-semibold uppercase tracking-industrial transition-colors",
              tab === t
                ? "bg-pb-jet-black text-pb-snow"
                : "text-pb-gray hover:text-pb-jet-black",
            )}
          >
            {t === "login" ? "Login" : "Sign Up"}
          </button>
        ))}
      </div>

      {/* Email form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // TODO: Supabase Auth email login/signup
        }}
        className="space-y-4"
      >
        {tab === "signup" && (
          <InputField label="Name" id="auth-name" placeholder="이름" />
        )}
        <InputField label="Email" id="auth-email" type="email" placeholder="email@example.com" />
        <InputField label="Password" id="auth-password" type="password" placeholder="비밀번호" />
        {tab === "signup" && (
          <InputField label="Confirm Password" id="auth-confirm" type="password" placeholder="비밀번호 확인" />
        )}

        <button type="submit" className="btn-primary w-full mt-2">
          {tab === "login" ? "Login" : "Create Account"}
        </button>
      </form>

      {/* Guest order */}
      <div className="mt-8 text-center">
        <Link
          href="/checkout"
          className="text-xs text-pb-gray uppercase tracking-industrial hover:text-pb-jet-black transition-colors"
        >
          비회원 주문하기
        </Link>
      </div>
    </section>
  );
}
