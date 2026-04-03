"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/constants/admin";

function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "대시보드";
  const item = ADMIN_NAV_ITEMS.find(
    (nav) => nav.href !== "/admin" && pathname.startsWith(nav.href)
  );
  return item?.label ?? "관리자";
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[var(--pb-snow)]">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title={getPageTitle(pathname)}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
