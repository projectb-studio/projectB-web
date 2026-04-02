"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Heart, UserIcon, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist";
import { ProductCard } from "@/components/shop/ProductCard";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

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
  const [orders, setOrders] = useState<Array<{
    id: string;
    status: string;
    total_amount: number;
    order_name: string;
    created_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return <p className="text-sm text-pb-gray py-12 text-center">불러오는 중...</p>;
  }

  if (orders.length === 0) {
    return <EmptyState message="주문 내역이 없습니다." cta={{ label: "쇼핑하러 가기", href: "/shop" }} />;
  }

  const statusLabels: Record<string, string> = {
    pending: "결제 대기",
    paid: "결제 완료",
    shipped: "배송 중",
    delivered: "배송 완료",
    cancelled: "주문 취소",
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-pb-gray mb-4">{orders.length}건의 주문</p>
      {orders.map((order) => (
        <div key={order.id} className="border border-pb-light-gray p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-pb-silver tracking-wider">{order.id}</p>
              <p className="text-sm font-medium mt-1">{order.order_name}</p>
            </div>
            <span className="text-xs text-pb-gray tracking-wider uppercase">
              {statusLabels[order.status] ?? order.status}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-pb-silver">
            <span>{new Date(order.created_at).toLocaleDateString("ko-KR")}</span>
            <span className="font-medium text-pb-jet-black">
              {new Intl.NumberFormat("ko-KR").format(order.total_amount)}원
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function WishlistTab() {
  const items = useWishlistStore((s) => s.items);

  if (items.length === 0) {
    return <EmptyState message="위시리스트가 비어있습니다." cta={{ label: "Browse Products", href: "/shop" }} />;
  }

  return (
    <div className="py-4">
      <p className="text-xs text-pb-gray mb-6">{items.length}개의 상품</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ user }: { user: User | null }) {
  return (
    <div className="max-w-md space-y-4 py-4">
      <div>
        <label className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">Name</label>
        <input
          type="text"
          placeholder="이름"
          defaultValue={user?.user_metadata?.full_name ?? ""}
          className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">Email</label>
        <input
          type="email"
          placeholder="email@example.com"
          value={user?.email ?? ""}
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
  const { user, loading } = useUser();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-pb-gray text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <section className="max-w-content mx-auto px-6 lg:px-12 py-12 lg:py-20">
      <h1 className="heading-display text-sm text-center tracking-wide mb-2">
        My Page
      </h1>
      <p className="text-sm text-pb-gray text-center">{user?.email}</p>
      <div className="flex justify-center">
        <button
          onClick={handleLogout}
          className="text-xs text-pb-silver hover:text-pb-gray tracking-wider uppercase mt-3 transition-colors"
        >
          로그아웃
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-pb-light-gray mb-8 mt-10 overflow-x-auto no-scrollbar">
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
      {activeTab === "profile" && <ProfileTab user={user} />}
      {activeTab === "points" && <PointsTab />}
    </section>
  );
}
