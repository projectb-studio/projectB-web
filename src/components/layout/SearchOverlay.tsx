"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/types/database";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the overlay is rendered before focusing
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
    // Reset state when closing
    setQuery("");
    setResults([]);
    setHasSearched(false);
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Debounced search
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
      const json = (await res.json()) as { products: Product[] };
      setResults(json.products);
      setHasSearched(true);
    }, 300);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[var(--pb-snow)] overflow-y-auto">
      {/* Search input area */}
      <div className="sticky top-0 bg-[var(--pb-snow)] border-b border-[var(--pb-light-gray)] z-10">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 lg:h-20 gap-4">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="상품명을 입력해주세요"
              className={cn(
                "flex-1 text-lg lg:text-xl bg-transparent",
                "border-b-[1.5px] border-[var(--pb-light-gray)]",
                "focus:border-[var(--pb-jet-black)] focus:outline-none",
                "py-2 font-body text-[var(--pb-jet-black)]",
                "placeholder:text-[var(--pb-silver)]",
                "transition-colors"
              )}
            />
            <button
              onClick={onClose}
              aria-label="Close search"
              className="p-2 text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] transition-colors"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Results area */}
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Empty query hint */}
        {!query.trim() && (
          <p className="text-center text-[var(--pb-silver)] text-sm tracking-[0.1em] uppercase font-heading mt-16">
            상품명을 입력해주세요
          </p>
        )}

        {/* No results */}
        {hasSearched && query.trim() && results.length === 0 && (
          <p className="text-center text-[var(--pb-gray)] text-sm tracking-[0.1em] mt-16">
            검색 결과가 없습니다.
          </p>
        )}

        {/* Results grid */}
        {results.length > 0 && (
          <>
            <p className="text-xs text-[var(--pb-silver)] uppercase tracking-[0.15em] font-heading mb-6">
              {results.length}개의 검색 결과
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-10">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
