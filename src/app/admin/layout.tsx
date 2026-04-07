import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { AdminLayoutClient } from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/auth?next=/admin");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
