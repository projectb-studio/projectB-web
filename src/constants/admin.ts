import {
  LayoutDashboard,
  Package,
  PanelTop,
  ShoppingCart,
  Star,
  MessageSquare,
  Megaphone,
  Newspaper,
  Settings,
  Users,
  BarChart3,
  Tag,
  Receipt,
  FileText,
  Ticket,
  Coins,
  Crown,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  label: string;
  items: readonly AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: readonly AdminNavGroup[] = [
  {
    label: "운영",
    items: [
      { label: "대시보드", href: "/admin", icon: LayoutDashboard },
      { label: "통계", href: "/admin/stats", icon: BarChart3 },
    ],
  },
  {
    label: "상품 · 콘텐츠",
    items: [
      { label: "상품 관리", href: "/admin/products", icon: Package },
      { label: "카테고리", href: "/admin/products/categories", icon: Tag },
      { label: "콘텐츠 편집", href: "/admin/content/hero", icon: PanelTop },
      { label: "매거진", href: "/admin/magazine", icon: Newspaper },
    ],
  },
  {
    label: "주문 · 정산",
    items: [
      { label: "주문 관리", href: "/admin/orders", icon: ShoppingCart },
      { label: "정산 내역", href: "/admin/billing/settlements", icon: Receipt },
      { label: "세금계산서", href: "/admin/billing/tax-invoices", icon: FileText },
    ],
  },
  {
    label: "마케팅",
    items: [
      { label: "쿠폰 관리", href: "/admin/marketing/coupons", icon: Ticket },
      { label: "적립금", href: "/admin/marketing/points", icon: Coins },
      { label: "회원등급", href: "/admin/marketing/grades", icon: Crown },
    ],
  },
  {
    label: "고객",
    items: [
      { label: "회원 관리", href: "/admin/members", icon: Users },
      { label: "리뷰 관리", href: "/admin/reviews", icon: Star },
      { label: "문의 관리", href: "/admin/inquiries", icon: MessageSquare },
      { label: "공지사항", href: "/admin/notices", icon: Megaphone },
    ],
  },
  {
    label: "설정",
    items: [
      { label: "사이트 설정", href: "/admin/settings", icon: Settings },
    ],
  },
] as const;

// Flat list for back-compat / title resolution
export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap(
  (g) => g.items
);
