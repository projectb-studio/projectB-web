# P2: Auth + Payment + Orders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supabase Auth (카카오/네이버/Google + 이메일), 토스페이먼츠 결제, 주문 저장, 마이페이지 인증 보호를 구현한다.

**Architecture:** Supabase Auth로 소셜/이메일 인증 처리. Next.js Route Handler(`app/api/`)로 서버사이드 로직(결제 승인, 주문 생성). 토스페이먼츠 SDK로 클라이언트 결제 UI, 서버에서 secretKey로 결제 승인. 인증 필수 라우트는 미들웨어에서 리다이렉트.

**Tech Stack:** Supabase Auth, @tosspayments/tosspayments-sdk, Next.js Route Handlers, Zustand

---

## File Structure

### New Files
```
src/app/api/auth/callback/route.ts      — OAuth callback handler (소셜 로그인 완료 후)
src/app/api/checkout/route.ts            — 토스페이먼츠 결제 승인 API
src/app/api/orders/route.ts              — 주문 생성/조회 API
src/app/checkout/success/page.tsx        — 결제 성공 리다이렉트 페이지
src/app/checkout/fail/page.tsx           — 결제 실패 리다이렉트 페이지
src/hooks/useUser.ts                     — 현재 로그인 유저 훅
src/lib/supabase/admin.ts               — Supabase service role client (서버 전용)
```

### Modified Files
```
src/app/auth/page.tsx                    — 소셜 로그인 + 이메일 로그인 로직 연결
src/app/checkout/page.tsx                — 토스페이먼츠 SDK 연동
src/app/mypage/page.tsx                  — 인증 체크 + 주문내역 조회
src/app/order-complete/page.tsx          — 실제 주문 데이터 표시
src/lib/supabase/middleware.ts           — 보호 라우트 리다이렉트 추가
src/types/database.ts                    — pb_order_items 타입 추가
src/stores/cart.ts                       — 주문 완료 시 서버 동기화 고려
package.json                             — @tosspayments/tosspayments-sdk 추가
.env.example                             — 추가 환경변수 문서화
```

---

## Task 1: Supabase Auth — 이메일 로그인/회원가입

**Files:**
- Modify: `src/app/auth/page.tsx`
- Create: `src/hooks/useUser.ts`

- [ ] **Step 1: useUser 훅 생성**

```typescript
// src/hooks/useUser.ts
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, loading };
}
```

- [ ] **Step 2: auth 페이지에 이메일 로그인/회원가입 로직 연결**

`src/app/auth/page.tsx`의 form onSubmit 핸들러를 구현한다. 기존 UI 구조를 유지하면서 로직만 추가.

```typescript
// auth/page.tsx 상단에 추가
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// AuthPage 컴포넌트 내부에 추가
const router = useRouter();
const supabase = createClient();
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

async function handleEmailAuth(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setError(null);
  setLoading(true);

  const formData = new FormData(e.currentTarget);
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (tab === "signup") {
    const name = formData.get("name") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setError("인증 이메일을 발송했습니다. 이메일을 확인해주세요.");
    setLoading(false);
    return;
  }

  // Login
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    setLoading(false);
    return;
  }

  router.push("/mypage");
  router.refresh();
}
```

기존 `<form>` 태그에 `onSubmit={handleEmailAuth}` 연결. 각 input에 `name` 속성 추가 (`name="email"`, `name="password"`, `name="name"`, `name="confirmPassword"`). error 상태를 폼 위에 표시:

```tsx
{error && (
  <p className={cn(
    "text-xs text-center py-2",
    error.includes("이메일을 발송") ? "text-accent-success" : "text-accent-sale"
  )}>
    {error}
  </p>
)}
```

submit 버튼에 `disabled={loading}` 추가, 텍스트를 `loading ? "처리 중..." : (tab === "login" ? "로그인" : "회원가입")`.

- [ ] **Step 3: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useUser.ts src/app/auth/page.tsx
git commit -m "feat: implement email login/signup with Supabase Auth"
```

---

## Task 2: Supabase Auth — 소셜 로그인 (카카오/네이버/Google)

**Files:**
- Modify: `src/app/auth/page.tsx`
- Create: `src/app/api/auth/callback/route.ts`

- [ ] **Step 1: OAuth callback route handler 생성**

```typescript
// src/app/api/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/mypage";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to auth page with error
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
}
```

- [ ] **Step 2: 소셜 로그인 핸들러 추가**

`src/app/auth/page.tsx`에 소셜 로그인 함수 추가:

```typescript
// AuthPage 컴포넌트 내부
async function handleSocialLogin(provider: "kakao" | "naver" | "google") {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });

  if (error) {
    setError("소셜 로그인에 실패했습니다. 다시 시도해주세요.");
  }
}
```

기존 소셜 로그인 버튼의 `onClick`에 연결:

```tsx
onClick={() => handleSocialLogin(provider.id as "kakao" | "naver" | "google")}
```

- [ ] **Step 3: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 4: Commit**

```bash
git add src/app/api/auth/callback/route.ts src/app/auth/page.tsx
git commit -m "feat: implement social login (Kakao, Naver, Google) with OAuth callback"
```

---

## Task 3: 미들웨어 — 인증 필수 라우트 보호

**Files:**
- Modify: `src/lib/supabase/middleware.ts`

- [ ] **Step 1: 보호 라우트 리다이렉트 로직 추가**

```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/mypage", "/checkout"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Prototype mode: skip Supabase if not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users from protected routes
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
```

- [ ] **Step 2: auth 페이지에서 next 파라미터 처리**

`src/app/auth/page.tsx`에서 로그인 성공 후 `next` 파라미터가 있으면 해당 경로로 리다이렉트:

```typescript
import { useSearchParams } from "next/navigation";

// AuthPage 컴포넌트 내부
const searchParams = useSearchParams();
const nextPath = searchParams.get("next") ?? "/mypage";

// handleEmailAuth의 로그인 성공 부분 변경:
router.push(nextPath);
router.refresh();

// handleSocialLogin의 redirectTo 변경:
redirectTo: `${window.location.origin}/api/auth/callback?next=${nextPath}`,
```

- [ ] **Step 3: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/middleware.ts src/app/auth/page.tsx
git commit -m "feat: protect routes with auth middleware, redirect to /auth"
```

---

## Task 4: 마이페이지 — 인증 유저 정보 표시 + 로그아웃

**Files:**
- Modify: `src/app/mypage/page.tsx`

- [ ] **Step 1: 마이페이지에 유저 정보 연동**

```typescript
// src/app/mypage/page.tsx 상단 변경
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
// ... existing imports

// MyPage 컴포넌트 내부 변경
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

  // ... 기존 렌더링 코드
```

마이페이지 헤더 영역에 유저 이메일 + 로그아웃 버튼 추가:

```tsx
{/* Page header - 기존 MY PAGE 타이틀 아래에 추가 */}
<p className="text-sm text-pb-gray mt-2">{user?.email}</p>
<button
  onClick={handleLogout}
  className="text-xs text-pb-silver hover:text-pb-gray tracking-wider uppercase mt-3 transition-colors"
>
  로그아웃
</button>
```

ProfileTab에서 이메일을 `user?.email`로 동적 표시, 이름을 `user?.user_metadata?.full_name`으로 표시.

- [ ] **Step 2: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add src/app/mypage/page.tsx
git commit -m "feat: display user info on mypage, add logout"
```

---

## Task 5: 토스페이먼츠 SDK 설치 + 결제 페이지 연동

**Files:**
- Modify: `package.json`
- Modify: `src/app/checkout/page.tsx`
- Create: `src/app/checkout/success/page.tsx`
- Create: `src/app/checkout/fail/page.tsx`

- [ ] **Step 1: 토스페이먼츠 SDK 설치**

Run: `npm install @tosspayments/tosspayments-sdk`

- [ ] **Step 2: checkout 페이지에 토스페이먼츠 결제 위젯 연동**

`src/app/checkout/page.tsx`의 결제 처리 로직을 교체. 기존 UI 구조(배송 정보 폼, 주문 요약)는 유지하고 결제 버튼 동작만 변경:

```typescript
// checkout/page.tsx 상단에 추가
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

// CheckoutPage 컴포넌트 내부에 추가
const [orderId] = useState(() => `PB-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);

async function handlePayment(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const customerName = formData.get("name") as string;
  const customerEmail = formData.get("email") as string;
  const customerPhone = formData.get("phone") as string;

  if (!customerName || !customerEmail || !customerPhone) {
    alert("배송 정보를 모두 입력해주세요.");
    return;
  }

  // Store shipping info in sessionStorage for order-complete page
  const shippingInfo = {
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    address: formData.get("address") as string,
    addressDetail: formData.get("addressDetail") as string,
    postalCode: formData.get("postalCode") as string,
    memo: formData.get("memo") as string,
  };
  sessionStorage.setItem("pb-shipping", JSON.stringify(shippingInfo));
  sessionStorage.setItem("pb-order-id", orderId);

  const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
  const payment = tossPayments.payment({ customerKey: crypto.randomUUID() });

  const orderName = items.length === 1
    ? items[0].product.name
    : `${items[0].product.name} 외 ${items.length - 1}건`;

  await payment.requestPayment({
    method: selectedPayment === "transfer" ? "TRANSFER" : "CARD",
    amount: { currency: "KRW", value: total },
    orderId,
    orderName,
    customerName,
    customerEmail,
    customerMobilePhone: customerPhone,
    successUrl: `${window.location.origin}/checkout/success`,
    failUrl: `${window.location.origin}/checkout/fail`,
  });
}
```

기존 form의 onSubmit을 `handlePayment`로 교체.

- [ ] **Step 3: 결제 성공 페이지 생성**

```typescript
// src/app/checkout/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/stores/cart";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) return;

    async function confirmPayment() {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.message ?? "결제 승인에 실패했습니다.");
          return;
        }

        clearCart();
        setConfirmed(true);
      } catch {
        setError("결제 처리 중 오류가 발생했습니다.");
      }
    }

    confirmPayment();
  }, [paymentKey, orderId, amount, clearCart]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="heading-section text-2xl mb-4">결제 오류</h1>
        <p className="text-pb-gray text-sm mb-8">{error}</p>
        <Link href="/cart" className="btn-primary">장바구니로 돌아가기</Link>
      </main>
    );
  }

  if (!confirmed) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-pb-gray text-sm">결제 승인 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-12 h-px bg-pb-light-gray mb-8" />
      <h1 className="heading-section text-2xl lg:text-3xl mb-4">주문 완료</h1>
      <p className="text-pb-gray text-sm mb-2">주문번호: {orderId}</p>
      <p className="text-pb-gray text-sm mb-10">
        주문이 성공적으로 완료되었습니다.
      </p>
      <div className="flex gap-4">
        <Link href="/mypage" className="btn-secondary">주문내역 보기</Link>
        <Link href="/shop" className="btn-primary">쇼핑 계속하기</Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: 결제 실패 페이지 생성**

```typescript
// src/app/checkout/fail/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutFailPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-12 h-px bg-accent-sale mb-8" />
      <h1 className="heading-section text-2xl lg:text-3xl mb-4">결제 실패</h1>
      <p className="text-pb-gray text-sm mb-2">
        {message ?? "결제 처리 중 문제가 발생했습니다."}
      </p>
      {code && (
        <p className="text-pb-silver text-xs mb-10">오류 코드: {code}</p>
      )}
      <div className="flex gap-4">
        <Link href="/checkout" className="btn-primary">다시 시도하기</Link>
        <Link href="/cart" className="btn-secondary">장바구니로 돌아가기</Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/app/checkout/
git commit -m "feat: integrate Tosspayments SDK, add success/fail pages"
```

---

## Task 6: 결제 승인 API + 주문 저장

**Files:**
- Create: `src/app/api/checkout/route.ts`
- Create: `src/app/api/orders/route.ts`
- Modify: `src/types/database.ts`

- [ ] **Step 1: database.ts에 주문 아이템 타입 추가**

```typescript
// src/types/database.ts — pb_order_items 테이블 타입 추가 (pb_orders 아래에)
// 기존 pb_orders Row에 payment_key 필드 추가:
pb_orders: {
  Row: {
    id: string;
    user_id: string | null;
    status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
    total_amount: number;
    shipping_fee: number;
    shipping_address: Record<string, unknown>;
    payment_key: string | null;
    payment_method: string | null;
    order_name: string;
    created_at: string;
    updated_at: string;
  };
  Insert: Omit<...>;
  Update: Partial<...>;
};

// 새 테이블 추가:
pb_order_items: {
  Row: {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_image: string;
    price: number;
    quantity: number;
    created_at: string;
  };
  Insert: Omit<Row, "id" | "created_at">;
  Update: Partial<Insert>;
};
```

- [ ] **Step 2: 결제 승인 API 생성**

```typescript
// src/app/api/checkout/route.ts
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
  const { data: { user } } = await supabase.auth.getUser();

  const { error: orderError } = await supabase.from("pb_orders").insert({
    id: orderId,
    user_id: user?.id ?? null,
    status: "paid",
    total_amount: amount,
    shipping_fee: 0, // calculated from cart
    shipping_address: {},  // will be sent from client in future
    payment_key: paymentKey,
    payment_method: paymentData.method ?? null,
    order_name: paymentData.orderName ?? "",
  });

  if (orderError) {
    console.error("Order save failed:", orderError);
    // Payment succeeded but order save failed — log for manual recovery
    return NextResponse.json(
      { message: "결제는 완료되었으나 주문 저장에 실패했습니다. 고객센터에 문의해주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, orderId });
}
```

- [ ] **Step 3: 주문 조회 API 생성**

```typescript
// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
  }

  const { data: orders, error } = await supabase
    .from("pb_orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: "주문 조회 실패" }, { status: 500 });
  }

  return NextResponse.json({ orders });
}
```

- [ ] **Step 4: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 5: Commit**

```bash
git add src/app/api/ src/types/database.ts
git commit -m "feat: add payment confirm API + order save/query endpoints"
```

---

## Task 7: 마이페이지 — 주문내역 조회

**Files:**
- Modify: `src/app/mypage/page.tsx`

- [ ] **Step 1: OrdersTab에서 실제 주문 데이터 조회**

기존 EmptyState를 보여주던 OrdersTab을 교체:

```typescript
// OrdersTab 컴포넌트 교체
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
    return <EmptyState message="주문 내역이 없습니다." ctaLabel="쇼핑하러 가기" ctaHref="/shop" />;
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
```

- [ ] **Step 2: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add src/app/mypage/page.tsx
git commit -m "feat: fetch and display order history on mypage"
```

---

## Task 8: 환경변수 + .env.example 업데이트

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: .env.example에 P2 관련 변수 확인 및 주석 보강**

```env
# ============================================
# Supabase
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# ============================================
# Cloudflare R2 (Image Storage)
# ============================================
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=projectb-images
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-bucket.r2.dev

# ============================================
# Tosspayments (PG)
# Test keys: https://developers.tosspayments.com/sandbox
# ============================================
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxxxxxxx
TOSS_SECRET_KEY=test_sk_xxxxxxxx

# ============================================
# Site
# ============================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: update .env.example with P2 variable comments"
```

---

## Execution Order & Dependencies

```
Task 1 (Email Auth) ─────┐
                          ├─→ Task 3 (Middleware) ─→ Task 4 (MyPage User Info)
Task 2 (Social Auth) ────┘                                    │
                                                               │
Task 5 (Tosspayments SDK) ─→ Task 6 (Payment API + Orders) ─→ Task 7 (Order History)
                                                               │
Task 8 (Env) ─── independent ─────────────────────────────────┘
```

- Task 1, 2는 병렬 가능 (둘 다 auth 페이지 수정이므로 순차 권장)
- Task 3은 1, 2 완료 후
- Task 5, 6은 Auth와 독립적이지만, 6에서 user_id 사용하므로 Auth 이후 권장
- Task 8은 언제든 가능
