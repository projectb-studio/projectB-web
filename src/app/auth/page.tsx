"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// Supabase Provider type for OAuth — Naver requires custom OIDC setup
type SocialProviderId = "kakao" | "google" | "custom:naver";

const SOCIAL_PROVIDERS: ReadonlyArray<{
  id: SocialProviderId;
  label: string;
  bg: string;
  text: string;
}> = [
  { id: "kakao", label: "카카오로 시작하기", bg: "#FEE500", text: "#191919" },
  { id: "custom:naver", label: "네이버로 시작하기", bg: "#03C75A", text: "#FFFFFF" },
  { id: "google", label: "Google로 시작하기", bg: "#FFFFFF", text: "#191919" },
];

type Tab = "login" | "signup";

function InputField({
  label,
  id,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  id: string;
  name: string;
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
        name={name}
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/mypage";
  const supabase = createClient();

  async function handleSocialLogin(provider: SocialProviderId) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${nextPath}`,
      },
    });

    if (error) {
      setError("소셜 로그인에 실패했습니다. 다시 시도해주세요.");
    }
  }

  async function handleEmailAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (tab === "signup") {
      const name = formData.get("name") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if (password !== confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        setLoading(false);
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      setError("인증 이메일을 발송했습니다. 이메일을 확인해주세요.");
      setLoading(false);
      return;
    }

    // Login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

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
            onClick={() => handleSocialLogin(provider.id)}
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

      {/* Error / success message */}
      {error && (
        <p className={cn(
          "text-xs text-center py-2",
          error.includes("이메일을 발송") ? "text-accent-success" : "text-accent-sale"
        )}>
          {error}
        </p>
      )}

      {/* Email form */}
      <form
        onSubmit={handleEmailAuth}
        className="space-y-4"
      >
        {tab === "signup" && (
          <InputField label="Name" id="auth-name" name="name" placeholder="이름" />
        )}
        <InputField label="Email" id="auth-email" name="email" type="email" placeholder="email@example.com" />
        <InputField label="Password" id="auth-password" name="password" type="password" placeholder="비밀번호" />
        {tab === "signup" && (
          <InputField label="Confirm Password" id="auth-confirm" name="confirmPassword" type="password" placeholder="비밀번호 확인" />
        )}

        <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
          {loading ? "처리 중..." : (tab === "login" ? "로그인" : "회원가입")}
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
