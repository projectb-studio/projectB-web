import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!;
const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

export async function POST(request: Request) {
  const { paymentKey, orderId, amount } = await request.json();

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json(
      { message: "필수 파라미터가 누락되었습니다." },
      { status: 400 }
    );
  }

  // 1. Confirm payment with Tosspayments
  const confirmRes = await fetch(TOSS_CONFIRM_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (!confirmRes.ok) {
    const errorData = await confirmRes.json();
    return NextResponse.json(
      { message: errorData.message ?? "결제 승인 실패" },
      { status: confirmRes.status }
    );
  }

  const paymentData = await confirmRes.json();

  // 2. Save order to Supabase
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TODO: Replace type assertion after running `supabase gen types typescript`
  const { error: orderError } = await (supabase.from("pb_orders") as ReturnType<typeof supabase.from>).insert({
    id: orderId,
    user_id: user?.id ?? null,
    status: "paid",
    total_amount: amount,
    shipping_fee: 0,
    shipping_address: {},
    payment_key: paymentKey,
    payment_method: paymentData.method ?? null,
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

  return NextResponse.json({ success: true, orderId });
}
