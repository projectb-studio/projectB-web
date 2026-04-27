"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/marketing/coupons", label: "쿠폰" },
  { href: "/admin/marketing/points", label: "적립금" },
  { href: "/admin/marketing/grades", label: "회원등급" },
];

export function MarketingNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-4 mb-6 text-xs font-heading uppercase tracking-[0.15em] border-b border-[var(--pb-light-gray)]">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "py-3 border-b-2 -mb-[1px]",
              active
                ? "border-[var(--pb-jet-black)] text-[var(--pb-jet-black)]"
                : "border-transparent text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)]"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
