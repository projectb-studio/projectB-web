import { OrderRequestList } from "@/components/admin/orders/OrderRequestList";

export default function AdminCancellationsPage() {
  return <OrderRequestList type="cancel" title="취소 관리" />;
}
