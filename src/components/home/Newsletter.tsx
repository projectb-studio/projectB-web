"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";

/**
 * Newsletter subscription section.
 * TODO: Supabase 또는 Stibee API 연동하여 실제 구독 처리 구현
 */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }

    if (!validateEmail(email)) {
      setStatus("error");
      setErrorMessage("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    // TODO: Supabase pb_newsletter_subscribers 테이블에 저장 또는 Stibee API 호출
    setStatus("success");
    setEmail("");
  };

  return (
    <section className="py-16 lg:py-24 bg-[var(--pb-off-white)]">
      <div className="container-base mx-auto px-4">
        <div className="mx-auto max-w-[480px] text-center">
          {/* Heading */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail size={18} strokeWidth={1.5} className="text-[var(--pb-charcoal)]" />
            <h2 className="heading-section text-sm">NEWSLETTER</h2>
          </div>

          {/* Subtext */}
          <p className="text-sm text-[var(--pb-gray)] mb-8">
            새로운 상품과 이벤트 소식을 받아보세요.
          </p>

          {/* Form */}
          {status === "success" ? (
            <p className="text-sm text-[var(--accent-success)] font-medium py-4">
              구독이 완료되었습니다!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="your@email.com"
                className={cn(
                  "flex-1 px-4 py-3 text-sm",
                  "border-[1.5px] border-[var(--pb-light-gray)]",
                  "focus:border-[var(--pb-jet-black)] focus:outline-none",
                  "bg-white placeholder:text-[var(--pb-silver)]",
                  "transition-colors",
                  status === "error" && "border-[var(--accent-sale)]"
                )}
              />
              <button type="submit" className="btn-primary px-8 py-3 text-sm whitespace-nowrap">
                Subscribe
              </button>
            </form>
          )}

          {/* Error message */}
          {status === "error" && errorMessage && (
            <p className="text-xs text-[var(--accent-sale)] mt-2 text-left sm:text-left">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
