"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Heart, UserIcon, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "points", label: "Points", icon: Gift },
] as const;

type TabId = (typeof TABS)[number]["id"];

function EmptyState({ message, cta }: { message: string; cta?: { label: string; href: string } }) {
  return (
    <div className="py-16 text-center">
      <p className="text-sm text-pb-gray mb-6">{message}</p>
      {cta && (
        <Link href={cta.href} className="btn-secondary text-xs">
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function OrdersTab() {
  return <EmptyState message="주문 내역이 없습니다." cta={{ label: "Shop Now", href: "/shop" }} />;
}

function WishlistTab() {
  return <EmptyState message="위시리스트가 비어있습니다." cta={{ label: "Browse Products", href: "/shop" }} />;
}

function ProfileTab() {
  return (
    <div className="max-w-md space-y-4 py-4">
      <div>
        <label className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">Name</label>
        <input
          type="text"
          placeholder="이름"
          className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">Email</label>
        <input
          type="email"
          placeholder="email@example.com"
          disabled
          className="w-full border border-pb-light-gray px-3 py-2.5 text-sm bg-pb-off-white text-pb-silver"
        />
      </div>
      <div>
        <label className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">Phone</label>
        <input
          type="tel"
          placeholder="010-0000-0000"
          className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors"
        />
      </div>
      <button type="button" className="btn-primary mt-2">
        Save Changes
      </button>
    </div>
  );
}

function PointsTab() {
  return (
    <div className="py-4">
      <div className="border border-pb-light-gray p-6 mb-6">
        <p className="text-xs text-pb-gray uppercase tracking-industrial mb-2">Available Points</p>
        <p className="text-2xl font-medium">0 <span className="text-sm text-pb-gray">P</span></p>
      </div>
      <EmptyState message="포인트 적립 내역이 없습니다." />
    </div>
  );
}

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<TabId>("orders");

  // TODO: Redirect to /auth if not logged in (Supabase Auth check)

  return (
    <section className="max-w-content mx-auto px-6 lg:px-12 py-12 lg:py-20">
      <h1 className="heading-display text-sm text-center tracking-wide mb-10">
        My Page
      </h1>

      {/* Tabs */}
      <div className="flex border-b border-pb-light-gray mb-8 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-xs font-heading font-semibold uppercase tracking-industrial transition-colors shrink-0 border-b-2",
                activeTab === tab.id
                  ? "border-pb-jet-black text-pb-jet-black"
                  : "border-transparent text-pb-silver hover:text-pb-gray",
              )}
            >
              <Icon size={14} strokeWidth={1.5} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "orders" && <OrdersTab />}
      {activeTab === "wishlist" && <WishlistTab />}
      {activeTab === "profile" && <ProfileTab />}
      {activeTab === "points" && <PointsTab />}
    </section>
  );
}
