import { ProductForm } from "@/components/admin/forms/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-6">
        새 상품 등록
      </h2>
      <ProductForm />
    </div>
  );
}
