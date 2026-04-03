"use client";

import { Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

interface AdminHeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export function AdminHeader({ title, onMenuToggle }: AdminHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-[var(--pb-snow)] border-b border-[var(--pb-light-gray)] flex items-center justify-between px-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] transition-colors"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <h1 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">
          {title}
        </h1>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] transition-colors"
      >
        <LogOut size={14} strokeWidth={1.5} />
        로그아웃
      </button>
    </header>
  );
}
