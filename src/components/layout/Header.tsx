"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, ShoppingBag, User } from "lucide-react";
import { NAV_ITEMS, SITE_CONFIG } from "@/constants/site";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--pb-snow)] border-b border-[var(--pb-border)]">
      {/* Top bar — announcement */}
      <div className="bg-[var(--pb-jet-black)] text-[var(--pb-snow)] text-center py-2">
        <p className="text-xs tracking-[0.15em] uppercase font-heading">
          Free shipping on orders over ₩50,000
        </p>
      </div>

      {/* Main nav */}
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="heading-display text-lg lg:text-xl tracking-[0.3em]"
          >
            {SITE_CONFIG.name}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-heading text-xs tracking-[0.15em] uppercase text-[var(--pb-charcoal)] hover:text-[var(--pb-jet-black)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button aria-label="Search" className="p-2">
              <Search size={18} strokeWidth={1.5} />
            </button>
            <Link href="/auth" aria-label="Account" className="p-2">
              <User size={18} strokeWidth={1.5} />
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="p-2 relative"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {/* TODO: cart count badge */}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <nav className="lg:hidden border-t border-[var(--pb-border)] bg-[var(--pb-snow)]">
          <div className="px-4 py-6 space-y-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block font-heading text-sm tracking-[0.15em] uppercase py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
