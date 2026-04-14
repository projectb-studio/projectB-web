import { redirect, notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Block } from "@/lib/detail-blocks/schema";

const EditorShell = dynamic(
  () => import("@/components/admin/detail-editor/EditorShell"),
  { ssr: false }
);

export const dynamicParams = true;
export const revalidate = 0;

export default async function Page({ params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/auth");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pb_products")
    .select("id, name, detail_blocks")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();

  const product = data as { id: string; name: string; detail_blocks: unknown };
  const initialBlocks = (Array.isArray(product.detail_blocks)
    ? (product.detail_blocks as Block[])
    : []);

  return (
    <EditorShell
      productId={product.id}
      productName={product.name}
      initialBlocks={initialBlocks}
    />
  );
}
