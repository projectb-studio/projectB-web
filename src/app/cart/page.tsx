"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { OrderSummary } from "@/components/cart/OrderSummary";

const ITEMS_PER_PAGE = 20;
const PAGE_GROUP_SIZE = 5;

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const [currentPage, setCurrentPage] = useState(1);

  if (items.length === 0) {
    return (
      <section className="max-w-content mx-auto px-6 lg:px-12 py-20 text-center">
        <ShoppingBag size={40} strokeWidth={1} className="mx-auto text-pb-silver mb-6" />
        <h1 className="heading-display text-sm tracking-wide mb-4">
          Your cart is empty
        </h1>
        <p className="text-sm text-pb-gray mb-8">
          장바구니에 담긴 상품이 없습니다.
        </p>
        <Link href="/category" className="btn-primary">
          Shop Now
        </Link>
      </section>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, endIndex);

  // Page group calculations (groups of 5)
  const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
  const groupStart = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
  const groupEnd = Math.min(groupStart + PAGE_GROUP_SIZE - 1, totalPages);
  const pageNumbers = Array.from(
    { length: groupEnd - groupStart + 1 },
    (_, i) => groupStart + i
  );
  const hasPrevGroup = currentGroup > 1;
  const hasNextGroup = groupEnd < totalPages;

  return (
    <section className="max-w-content mx-auto px-6 lg:px-12 py-12 lg:py-20">
      <h1 className="heading-display text-sm text-center tracking-wide mb-10">
        Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="border-t border-pb-light-gray/40">
            {paginatedItems.map((item) => (
              <CartItemRow key={item.product.id} item={item} />
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <nav
              aria-label="Cart pagination"
              className="flex items-center justify-center gap-1 mt-8"
            >
              {hasPrevGroup && (
                <button
                  onClick={() => setCurrentPage(groupStart - 1)}
                  className="w-9 h-9 flex items-center justify-center border border-pb-light-gray text-pb-gray hover:bg-pb-jet-black hover:text-pb-snow transition-colors"
                  aria-label="Previous page group"
                >
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>
              )}

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={
                    page === currentPage
                      ? "w-9 h-9 flex items-center justify-center text-xs font-heading font-semibold bg-pb-jet-black text-pb-snow"
                      : "w-9 h-9 flex items-center justify-center text-xs font-heading border border-pb-light-gray text-pb-gray hover:bg-pb-jet-black hover:text-pb-snow transition-colors"
                  }
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </button>
              ))}

              {hasNextGroup && (
                <button
                  onClick={() => setCurrentPage(groupEnd + 1)}
                  className="w-9 h-9 flex items-center justify-center border border-pb-light-gray text-pb-gray hover:bg-pb-jet-black hover:text-pb-snow transition-colors"
                  aria-label="Next page group"
                >
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              )}
            </nav>
          )}
        </div>

        {/* Summary sidebar — sticky */}
        <div className="lg:sticky lg:top-[146px] lg:self-start">
          <OrderSummary />
        </div>
      </div>
    </section>
  );
}
