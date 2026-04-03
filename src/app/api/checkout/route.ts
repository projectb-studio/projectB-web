import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET!;
const PORTONE_API_URL = "https://api.portone.io";

export async function POST(request: Request) {
  const { paymentId } = await request.json();

  if (!paymentId) {
    return NextResponse.json(
      { message: "paymentId가 누락되었습니다." },
      { status: 400 }
    );
  }

  // 1. Verify payment with PortOne V2 API
  const verifyRes = await fetch(`${PORTONE_API_URL}/payments/${encodeURIComponent(paymentId)}`, {
    method: "GET",
    headers: {
      Authorization: `PortOne ${PORTONE_API_SECRET}`,
      "Content-Type": "application/json",
    },
  });

  if (!verifyRes.ok) {
    const errorData = await verifyRes.json();
    return NextResponse.json(
      { message: errorData.message ?? "결제 조회 실패" },
      { status: verifyRes.status }
    );
  }

  const paymentData = await verifyRes.json();

  // 2. Check payment status
  if (paymentData.status !== "PAID") {
    return NextResponse.json(
      { message: `결제가 완료되지 않았습니다. (상태: ${paymentData.status})` },
      { status: 400 }
    );
  }

  // 3. Save order to Supabase
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const totalAmount = paymentData.amount?.total ?? 0;

  // TODO: Replace type assertion after running `supabase gen types typescript`
  const { error: orderError } = await (supabase.from("pb_orders") as ReturnType<typeof supabase.from>).insert({
    id: paymentId,
    user_id: user?.id ?? null,
    status: "paid",
    total_amount: totalAmount,
    shipping_fee: 0,
    shipping_address: {},
    payment_id: paymentId,
    payment_method: paymentData.method?.type ?? null,
    order_name: paymentData.orderName ?? "",
  } as Record<string, unknown>);

  if (orderError) {
    console.error("Order save failed:", orderError);
    return NextResponse.json(
      {
        message:
          "결제는 완료되었으나 주문 저장에 실패했습니다. 고객센터에 문의해주세요.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, paymentId, amount: totalAmount });
}
