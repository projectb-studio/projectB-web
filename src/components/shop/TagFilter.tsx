"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { PRODUCT_TAGS } from "@/constants/site";

interface TagFilterProps {
  activeTag: string;
}

export function TagFilter({ activeTag }: TagFilterProps) {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
      {PRODUCT_TAGS.map((tag) => {
        const isActive = tag === activeTag;
        const href = tag === "all" ? "/shop" : `/shop?tag=${tag}`;

        return (
          <Link
            key={tag}
            href={href}
            className={cn(
              "shrink-0 px-4 py-2 text-xs font-heading font-semibold uppercase tracking-industrial transition-colors",
              isActive
                ? "bg-pb-jet-black text-pb-snow"
                : "text-pb-gray hover:text-pb-jet-black",
            )}
          >
            {tag}
          </Link>
        );
      })}
    </nav>
  );
}
