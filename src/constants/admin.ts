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
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { label: "대시보드", href: "/admin", icon: LayoutDashboard },
  { label: "상품 관리", href: "/admin/products", icon: Package },
  { label: "콘텐츠 편집", href: "/admin/content/hero", icon: PanelTop },
  { label: "주문 관리", href: "/admin/orders", icon: ShoppingCart },
  { label: "매거진", href: "/admin/magazine", icon: Newspaper },
  { label: "리뷰 관리", href: "/admin/reviews", icon: Star },
  { label: "문의 관리", href: "/admin/inquiries", icon: MessageSquare },
  { label: "공지사항", href: "/admin/notices", icon: Megaphone },
  { label: "사이트 설정", href: "/admin/settings", icon: Settings },
] as const;
