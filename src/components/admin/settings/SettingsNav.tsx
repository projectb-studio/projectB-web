"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/settings", label: "테마" },
  { href: "/admin/settings/shipping", label: "배송" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-4 mb-6 text-xs font-heading uppercase tracking-[0.15em] border-b border-[var(--pb-light-gray)]">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
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
