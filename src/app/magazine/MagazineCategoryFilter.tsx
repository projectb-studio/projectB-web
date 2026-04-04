"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface MagazineCategoryFilterProps {
  categories: Category[];
  activeId?: string;
}

export function MagazineCategoryFilter({ categories, activeId }: MagazineCategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleFilter(categoryId?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    router.push(`/magazine?${params.toString()}`);
  }

  if (categories.length === 0) return null;

  return (
    <div className="flex gap-2 mb-10 overflow-x-auto justify-center">
      <button
        onClick={() => handleFilter()}
        className={cn(
          "px-3 py-1.5 text-xs border transition-colors whitespace-nowrap",
          !activeId
            ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
            : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
        )}
      >
        전체
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleFilter(cat.id)}
          className={cn(
            "px-3 py-1.5 text-xs border transition-colors whitespace-nowrap",
            activeId === cat.id
              ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
              : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
