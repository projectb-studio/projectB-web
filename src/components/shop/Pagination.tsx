import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseHref: string;
}

export function Pagination({ currentPage, totalPages, baseHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const separator = baseHref.includes("?") ? "&" : "?";

  function pageHref(page: number) {
    return page === 1 ? baseHref : `${baseHref}${separator}page=${page}`;
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-16">
      {currentPage > 1 && (
        <Link
          href={pageHref(currentPage - 1)}
          className="p-2 text-pb-gray hover:text-pb-jet-black transition-colors"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={pageHref(page)}
          className={cn(
            "w-9 h-9 flex items-center justify-center text-xs font-heading font-semibold tracking-industrial transition-colors",
            page === currentPage
              ? "bg-pb-jet-black text-pb-snow"
              : "text-pb-gray hover:text-pb-jet-black",
          )}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={pageHref(currentPage + 1)}
          className="p-2 text-pb-gray hover:text-pb-jet-black transition-colors"
        >
          <ChevronRight size={16} strokeWidth={1.5} />
        </Link>
      )}
    </nav>
  );
}
