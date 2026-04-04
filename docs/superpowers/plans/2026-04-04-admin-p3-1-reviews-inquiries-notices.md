# P3-1: Admin 리뷰/문의/공지 관리 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin Dashboard에 리뷰 관리, 문의 관리, 공지사항 관리 3개 페이지 추가

**Architecture:** 기존 주문 관리(`/admin/orders`) 패턴을 그대로 따름 — 목록 페이지(필터 탭 + 테이블) → 상세/편집 페이지. 각 페이지는 "use client" 클라이언트 컴포넌트로, `/api/admin/*` API 라우트를 통해 Supabase와 통신. 공지사항 작성에는 Tiptap 리치 텍스트 에디터 사용.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase, Tiptap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`)

---

## 파일 구조

### 신규 생성 파일
```
src/app/api/admin/reviews/route.ts           — 리뷰 목록 GET
src/app/api/admin/reviews/[id]/route.ts      — 리뷰 상세 GET, 수정 PUT, 삭제 DELETE
src/app/api/admin/inquiries/route.ts         — 문의 목록 GET
src/app/api/admin/inquiries/[id]/route.ts    — 문의 상세 GET, 수정 PUT
src/app/api/admin/notices/route.ts           — 공지 목록 GET, 생성 POST
src/app/api/admin/notices/[id]/route.ts      — 공지 상세 GET, 수정 PUT, 삭제 DELETE
src/app/admin/reviews/page.tsx               — 리뷰 목록 페이지
src/app/admin/reviews/[id]/page.tsx          — 리뷰 상세/답변 페이지
src/app/admin/inquiries/page.tsx             — 문의 목록 페이지
src/app/admin/inquiries/[id]/page.tsx        — 문의 상세/답변 페이지
src/app/admin/notices/page.tsx               — 공지 목록 페이지
src/app/admin/notices/new/page.tsx           — 공지 작성 페이지
src/app/admin/notices/[id]/page.tsx          — 공지 수정 페이지
src/components/admin/ui/TiptapEditor.tsx     — Tiptap 에디터 컴포넌트
```

### 수정 파일
```
src/types/database.ts                        — DbReview에 is_hidden 추가, DbCsInquiry status 확장
```

---

## Task 1: DB 타입 업데이트

**Files:**
- Modify: `src/types/database.ts:114-141`

- [ ] **Step 1: DbReview 타입에 is_hidden 추가**

`src/types/database.ts`의 `DbReview` 타입을 수정:

```typescript
export type DbReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  content: string | null;
  image_urls: string[] | null;
  is_published: boolean;
  is_hidden: boolean;
  admin_reply: string | null;
  created_at: string;
};
```

- [ ] **Step 2: DbCsInquiry 상태 타입 확장**

같은 파일에서 `DbCsInquiry` 타입의 status를 수정:

```typescript
export type DbCsInquiry = {
  id: string;
  type: "product" | "order" | "shipping" | "wholesale" | "etc";
  title: string;
  content: string;
  user_id: string | null;
  author_name: string | null;
  author_email: string | null;
  author_phone: string | null;
  company_name: string | null;
  status: "received" | "in_progress" | "answered" | "closed";
  answer: string | null;
  created_at: string;
  updated_at: string;
};
```

- [ ] **Step 3: 커밋**

```bash
git add src/types/database.ts
git commit -m "feat(admin): update DB types - add is_hidden to reviews, extend inquiry status"
```

---

## Task 2: 리뷰 관리 API 라우트

**Files:**
- Create: `src/app/api/admin/reviews/route.ts`
- Create: `src/app/api/admin/reviews/[id]/route.ts`

- [ ] **Step 1: 리뷰 목록 API 생성**

`src/app/api/admin/reviews/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pb_reviews")
    .select("*, pb_products(name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const reviews = (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    product_name: (r.pb_products as Record<string, unknown> | null)?.name ?? "삭제된 상품",
    pb_products: undefined,
  }));

  return NextResponse.json(reviews);
}
```

- [ ] **Step 2: 리뷰 상세/수정/삭제 API 생성**

`src/app/api/admin/reviews/[id]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("pb_reviews")
    .select("*, pb_products(name, slug)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  return NextResponse.json({
    ...data,
    product_name: (data.pb_products as Record<string, unknown> | null)?.name ?? "삭제된 상품",
    product_slug: (data.pb_products as Record<string, unknown> | null)?.slug ?? null,
    pb_products: undefined,
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  // Only allow updating admin_reply and is_hidden
  const updateData: Record<string, unknown> = {};
  if ("admin_reply" in body) updateData.admin_reply = body.admin_reply;
  if ("is_hidden" in body) updateData.is_hidden = body.is_hidden;

  const { error } = await supabase
    .from("pb_reviews")
    .update(updateData)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase.from("pb_reviews").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/admin/reviews/
git commit -m "feat(admin): add review management API routes"
```

---

## Task 3: 리뷰 관리 목록 페이지

**Files:**
- Create: `src/app/admin/reviews/page.tsx`

- [ ] **Step 1: 리뷰 목록 페이지 생성**

`src/app/admin/reviews/page.tsx`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Star, ImageIcon } from "lucide-react";

interface Review {
  id: string;
  product_id: string;
  product_name: string;
  author_name: string;
  rating: number;
  content: string | null;
  image_urls: string[] | null;
  is_hidden: boolean;
  admin_reply: string | null;
  created_at: string;
}

type FilterType = "all" | "unreplied" | "replied";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    if (res.ok) setReviews(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const filtered = filter === "all"
    ? reviews
    : filter === "unreplied"
      ? reviews.filter((r) => !r.admin_reply)
      : reviews.filter((r) => !!r.admin_reply);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: `전체 (${reviews.length})` },
    { key: "unreplied", label: `미답변 (${reviews.filter((r) => !r.admin_reply).length})` },
    { key: "replied", label: `답변완료 (${reviews.filter((r) => !!r.admin_reply).length})` },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 text-xs border transition-colors whitespace-nowrap",
              filter === f.key
                ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
                : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)]">리뷰가 없습니다.</p>
        </div>
      ) : (
        <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">상품</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">작성자</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">별점</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">내용</th>
                <th className="text-center px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">이미지</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">답변</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">날짜</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review.id} className={cn(
                  "border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)] transition-colors",
                  review.is_hidden && "opacity-50"
                )}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/reviews/${review.id}`} className="hover:underline text-xs font-medium">
                      {review.product_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs">{review.author_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? "fill-[var(--pb-jet-black)] text-[var(--pb-jet-black)]" : "text-[var(--pb-light-gray)]"} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs max-w-[200px] truncate">{review.content ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    {review.image_urls && review.image_urls.length > 0 && (
                      <ImageIcon size={14} className="inline text-[var(--pb-gray)]" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium", review.admin_reply ? "text-[#2D8F4E]" : "text-[var(--pb-silver)]")}>
                      {review.admin_reply ? "답변완료" : "미답변"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--pb-silver)]">
                    {new Date(review.created_at).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/admin/reviews/page.tsx
git commit -m "feat(admin): add review list page with filter tabs"
```

---

## Task 4: 리뷰 관리 상세 페이지

**Files:**
- Create: `src/app/admin/reviews/[id]/page.tsx`

- [ ] **Step 1: 리뷰 상세/답변 페이지 생성**

`src/app/admin/reviews/[id]/page.tsx`:

```typescript
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Star, Eye, EyeOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ReviewDetail {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string | null;
  author_name: string;
  rating: number;
  content: string | null;
  image_urls: string[] | null;
  is_hidden: boolean;
  admin_reply: string | null;
  created_at: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminReviewDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminReply, setAdminReply] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchReview() {
      const res = await fetch(`/api/admin/reviews/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReview(data);
        setAdminReply(data.admin_reply ?? "");
        setIsHidden(data.is_hidden ?? false);
      }
      setLoading(false);
    }
    fetchReview();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_reply: adminReply || null, is_hidden: isHidden }),
    });
    alert("저장되었습니다.");
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("정말 이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    router.push("/admin/reviews");
  }

  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";
  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  if (!review) return <div className="text-center py-20"><p className="text-sm text-[var(--pb-gray)]">리뷰를 찾을 수 없습니다.</p></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/reviews" className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
        <ArrowLeft size={12} /> 리뷰 목록
      </Link>

      {/* Review info */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">리뷰 정보</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-[var(--pb-gray)]">상품: </span>
            {review.product_slug ? (
              <Link href={`/product/${review.product_slug}`} className="hover:underline">{review.product_name}</Link>
            ) : (
              <span>{review.product_name}</span>
            )}
          </div>
          <div><span className="text-[var(--pb-gray)]">작성자:</span> {review.author_name}</div>
          <div><span className="text-[var(--pb-gray)]">작성일:</span> {new Date(review.created_at).toLocaleString("ko-KR")}</div>
          <div className="flex items-center gap-1">
            <span className="text-[var(--pb-gray)]">별점:</span>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className={i < review.rating ? "fill-[var(--pb-jet-black)] text-[var(--pb-jet-black)]" : "text-[var(--pb-light-gray)]"} />
            ))}
          </div>
        </div>

        {/* Review content */}
        {review.content && (
          <div className="pt-3 border-t border-[var(--pb-light-gray)]">
            <p className="text-sm leading-relaxed">{review.content}</p>
          </div>
        )}

        {/* Review images */}
        {review.image_urls && review.image_urls.length > 0 && (
          <div className="pt-3 border-t border-[var(--pb-light-gray)]">
            <div className="flex gap-2 flex-wrap">
              {review.image_urls.map((url, i) => (
                <div key={i} className="relative w-24 h-24 border border-[var(--pb-light-gray)]">
                  <Image src={url} alt={`리뷰 이미지 ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin reply + actions */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">관리자 답변</h2>
        <div>
          <label className={labelClass}>답변 내용</label>
          <textarea
            value={adminReply}
            onChange={(e) => setAdminReply(e.target.value)}
            className={cn(inputClass, "h-32 resize-y")}
            placeholder="리뷰에 대한 답변을 작성하세요"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHidden(!isHidden)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors",
              isHidden
                ? "border-[var(--accent-sale)] text-[var(--accent-sale)]"
                : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
            )}
          >
            {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
            {isHidden ? "숨김 상태" : "공개 상태"}
          </button>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50">
            <Save size={14} />
            {saving ? "저장 중..." : "저장"}
          </button>
          <button onClick={handleDelete} className="px-6 py-2.5 text-sm flex items-center gap-2 border border-[var(--accent-sale)] text-[var(--accent-sale)] hover:bg-[var(--accent-sale)] hover:text-white transition-colors">
            <Trash2 size={14} />
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/admin/reviews/[id]/page.tsx
git commit -m "feat(admin): add review detail page with reply, hide, delete"
```

---

## Task 5: 문의 관리 API 라우트

**Files:**
- Create: `src/app/api/admin/inquiries/route.ts`
- Create: `src/app/api/admin/inquiries/[id]/route.ts`

- [ ] **Step 1: 문의 목록 API 생성**

`src/app/api/admin/inquiries/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pb_cs_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

- [ ] **Step 2: 문의 상세/수정 API 생성**

`src/app/api/admin/inquiries/[id]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("pb_cs_inquiries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {};
  if ("answer" in body) updateData.answer = body.answer;
  if ("status" in body) updateData.status = body.status;

  // Auto-set status to answered when answer is provided
  if (body.answer && !body.status) {
    updateData.status = "answered";
  }

  const { error } = await supabase
    .from("pb_cs_inquiries")
    .update(updateData)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/admin/inquiries/
git commit -m "feat(admin): add inquiry management API routes"
```

---

## Task 6: 문의 관리 목록 페이지

**Files:**
- Create: `src/app/admin/inquiries/page.tsx`

- [ ] **Step 1: 문의 목록 페이지 생성**

`src/app/admin/inquiries/page.tsx`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Inquiry {
  id: string;
  type: string;
  title: string;
  author_name: string | null;
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  received: "접수",
  in_progress: "처리중",
  answered: "답변완료",
  closed: "종료",
  waiting: "대기",
};

const STATUS_COLORS: Record<string, string> = {
  received: "text-[var(--pb-silver)]",
  waiting: "text-[var(--pb-silver)]",
  in_progress: "text-blue-600",
  answered: "text-[#2D8F4E]",
  closed: "text-[var(--pb-gray)]",
};

const TYPE_LABELS: Record<string, string> = {
  product: "상품문의",
  order: "주문문의",
  shipping: "배송문의",
  wholesale: "도매문의",
  etc: "기타",
};

type FilterType = "all" | "received" | "waiting" | "in_progress" | "answered" | "closed";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/inquiries");
    if (res.ok) setInquiries(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const filtered = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all", label: `전체 (${inquiries.length})` },
    { key: "received", label: `접수 (${inquiries.filter((i) => i.status === "received" || i.status === "waiting").length})` },
    { key: "in_progress", label: `처리중 (${inquiries.filter((i) => i.status === "in_progress").length})` },
    { key: "answered", label: `답변완료 (${inquiries.filter((i) => i.status === "answered").length})` },
    { key: "closed", label: `종료 (${inquiries.filter((i) => i.status === "closed").length})` },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {filterTabs.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 text-xs border transition-colors whitespace-nowrap",
              filter === f.key
                ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
                : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)]">문의가 없습니다.</p>
        </div>
      ) : (
        <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">유형</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">제목</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">작성자</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">상태</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">날짜</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inquiry) => (
                <tr key={inquiry.id} className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)] transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 border border-[var(--pb-light-gray)]">
                      {TYPE_LABELS[inquiry.type] ?? inquiry.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/inquiries/${inquiry.id}`} className="hover:underline text-xs font-medium">
                      {inquiry.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs">{inquiry.author_name ?? "비회원"}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium", STATUS_COLORS[inquiry.status] ?? "")}>
                      {STATUS_LABELS[inquiry.status] ?? inquiry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--pb-silver)]">
                    {new Date(inquiry.created_at).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/admin/inquiries/page.tsx
git commit -m "feat(admin): add inquiry list page with status filters"
```

---

## Task 7: 문의 관리 상세 페이지

**Files:**
- Create: `src/app/admin/inquiries/[id]/page.tsx`

- [ ] **Step 1: 문의 상세/답변 페이지 생성**

`src/app/admin/inquiries/[id]/page.tsx`:

```typescript
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface InquiryDetail {
  id: string;
  type: string;
  title: string;
  content: string;
  author_name: string | null;
  author_email: string | null;
  author_phone: string | null;
  company_name: string | null;
  status: string;
  answer: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  received: "접수",
  waiting: "대기",
  in_progress: "처리중",
  answered: "답변완료",
  closed: "종료",
};

const TYPE_LABELS: Record<string, string> = {
  product: "상품문의",
  order: "주문문의",
  shipping: "배송문의",
  wholesale: "도매문의",
  etc: "기타",
};

const STATUSES = ["received", "in_progress", "answered", "closed"];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminInquiryDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchInquiry() {
      const res = await fetch(`/api/admin/inquiries/${id}`);
      if (res.ok) {
        const data = await res.json();
        setInquiry(data);
        setStatus(data.status);
        setAnswer(data.answer ?? "");
      }
      setLoading(false);
    }
    fetchInquiry();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/inquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, answer: answer || null }),
    });
    alert("저장되었습니다.");
    setSaving(false);
  }

  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";
  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  if (!inquiry) return <div className="text-center py-20"><p className="text-sm text-[var(--pb-gray)]">문의를 찾을 수 없습니다.</p></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/inquiries" className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
        <ArrowLeft size={12} /> 문의 목록
      </Link>

      {/* Inquiry info */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">문의 정보</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-[var(--pb-gray)]">유형:</span> {TYPE_LABELS[inquiry.type] ?? inquiry.type}</div>
          <div><span className="text-[var(--pb-gray)]">작성일:</span> {new Date(inquiry.created_at).toLocaleString("ko-KR")}</div>
          <div><span className="text-[var(--pb-gray)]">작성자:</span> {inquiry.author_name ?? "비회원"}</div>
          <div><span className="text-[var(--pb-gray)]">이메일:</span> {inquiry.author_email ?? "—"}</div>
          <div><span className="text-[var(--pb-gray)]">연락처:</span> {inquiry.author_phone ?? "—"}</div>
          {inquiry.company_name && (
            <div><span className="text-[var(--pb-gray)]">업체명:</span> {inquiry.company_name}</div>
          )}
        </div>

        {/* Inquiry content */}
        <div className="pt-3 border-t border-[var(--pb-light-gray)]">
          <h3 className="text-sm font-medium mb-2">{inquiry.title}</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{inquiry.content}</p>
        </div>
      </div>

      {/* Status + answer */}
      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">답변 및 상태</h2>
        <div>
          <label className={labelClass}>상태</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>답변 내용</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className={cn(inputClass, "h-40 resize-y")}
            placeholder="문의에 대한 답변을 작성하세요"
          />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50">
          <Save size={14} />
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/admin/inquiries/[id]/page.tsx
git commit -m "feat(admin): add inquiry detail page with status change and reply"
```

---

## Task 8: Tiptap 에디터 컴포넌트

**Files:**
- Create: `src/components/admin/ui/TiptapEditor.tsx`

- [ ] **Step 1: Tiptap 패키지 설치**

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/pm
```

- [ ] **Step 2: TiptapEditor 컴포넌트 생성**

`src/components/admin/ui/TiptapEditor.tsx`:

```typescript
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  ImageIcon,
  Heading2,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none px-4 py-3 min-h-[300px] focus:outline-none",
      },
    },
  });

  const addImage = useCallback(() => {
    const url = prompt("이미지 URL을 입력하세요:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const url = prompt("링크 URL을 입력하세요:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const btnClass = "p-1.5 hover:bg-[var(--pb-off-white)] transition-colors";
  const activeClass = "bg-[var(--pb-off-white)] text-[var(--pb-jet-black)]";

  return (
    <div className="border border-[var(--pb-light-gray)] bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--pb-light-gray)] flex-wrap">
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn(btnClass, editor.isActive("heading", { level: 2 }) && activeClass)}>
          <Heading2 size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={cn(btnClass, editor.isActive("bold") && activeClass)}>
          <Bold size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={cn(btnClass, editor.isActive("italic") && activeClass)}>
          <Italic size={16} />
        </button>
        <div className="w-px h-5 bg-[var(--pb-light-gray)] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn(btnClass, editor.isActive("bulletList") && activeClass)}>
          <List size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn(btnClass, editor.isActive("orderedList") && activeClass)}>
          <ListOrdered size={16} />
        </button>
        <div className="w-px h-5 bg-[var(--pb-light-gray)] mx-1" />
        <button type="button" onClick={addLink} className={cn(btnClass, editor.isActive("link") && activeClass)}>
          <LinkIcon size={16} />
        </button>
        <button type="button" onClick={addImage} className={btnClass}>
          <ImageIcon size={16} />
        </button>
        <div className="w-px h-5 bg-[var(--pb-light-gray)] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={cn(btnClass, "disabled:opacity-30")}>
          <Undo size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={cn(btnClass, "disabled:opacity-30")}>
          <Redo size={16} />
        </button>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* Placeholder fallback */}
      {editor.isEmpty && placeholder && (
        <p className="absolute top-[52px] left-4 text-sm text-[var(--pb-silver)] pointer-events-none">{placeholder}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/components/admin/ui/TiptapEditor.tsx
git commit -m "feat(admin): add Tiptap rich text editor component"
```

---

## Task 9: 공지사항 관리 API 라우트

**Files:**
- Create: `src/app/api/admin/notices/route.ts`
- Create: `src/app/api/admin/notices/[id]/route.ts`

- [ ] **Step 1: 공지 목록/생성 API**

`src/app/api/admin/notices/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pb_notices")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("pb_notices")
    .insert({
      title: body.title,
      content: body.content,
      is_pinned: body.is_pinned ?? false,
      is_published: body.is_published ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 2: 공지 상세/수정/삭제 API**

`src/app/api/admin/notices/[id]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("pb_notices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: "Notice not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {};
  if ("title" in body) updateData.title = body.title;
  if ("content" in body) updateData.content = body.content;
  if ("is_pinned" in body) updateData.is_pinned = body.is_pinned;
  if ("is_published" in body) updateData.is_published = body.is_published;

  const { error } = await supabase
    .from("pb_notices")
    .update(updateData)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase.from("pb_notices").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/admin/notices/
git commit -m "feat(admin): add notice management API routes (CRUD)"
```

---

## Task 10: 공지사항 목록 페이지

**Files:**
- Create: `src/app/admin/notices/page.tsx`

- [ ] **Step 1: 공지 목록 페이지 생성**

`src/app/admin/notices/page.tsx`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Pin, Plus } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  is_pinned: boolean;
  is_published: boolean;
  created_at: string;
}

type FilterType = "all" | "published" | "draft";

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/notices");
    if (res.ok) setNotices(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const filtered = filter === "all"
    ? notices
    : filter === "published"
      ? notices.filter((n) => n.is_published)
      : notices.filter((n) => !n.is_published);

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all", label: `전체 (${notices.length})` },
    { key: "published", label: `공개 (${notices.filter((n) => n.is_published).length})` },
    { key: "draft", label: `비공개 (${notices.filter((n) => !n.is_published).length})` },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  }

  return (
    <div>
      {/* Header with create button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {filterTabs.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 text-xs border transition-colors whitespace-nowrap",
                filter === f.key
                  ? "border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white"
                  : "border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-charcoal)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Link
          href="/admin/notices/new"
          className="btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5"
        >
          <Plus size={14} />
          새 공지
        </Link>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)]">공지사항이 없습니다.</p>
        </div>
      ) : (
        <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold w-8"></th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">제목</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">상태</th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">날짜</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((notice) => (
                <tr key={notice.id} className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)] transition-colors">
                  <td className="px-4 py-3 text-center">
                    {notice.is_pinned && <Pin size={12} className="text-[var(--pb-jet-black)]" />}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/notices/${notice.id}`} className="hover:underline text-xs font-medium">
                      {notice.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium", notice.is_published ? "text-[#2D8F4E]" : "text-[var(--pb-silver)]")}>
                      {notice.is_published ? "공개" : "비공개"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--pb-silver)]">
                    {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/admin/notices/page.tsx
git commit -m "feat(admin): add notice list page with publish filter"
```

---

## Task 11: 공지사항 작성 페이지

**Files:**
- Create: `src/app/admin/notices/new/page.tsx`

- [ ] **Step 1: 새 공지 작성 페이지 생성**

`src/app/admin/notices/new/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/components/admin/ui/TiptapEditor";

export default function AdminNoticeNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) { alert("제목을 입력하세요."); return; }
    setSaving(true);

    const res = await fetch("/api/admin/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        is_pinned: isPinned,
        is_published: isPublished,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/notices/${data.id}`);
    } else {
      alert("저장에 실패했습니다.");
      setSaving(false);
    }
  }

  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";
  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/notices" className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
        <ArrowLeft size={12} /> 공지 목록
      </Link>

      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">새 공지 작성</h2>

        <div>
          <label className={labelClass}>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="공지사항 제목"
          />
        </div>

        <div>
          <label className={labelClass}>내용</label>
          <TiptapEditor content={content} onChange={setContent} placeholder="공지사항 내용을 작성하세요" />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="accent-[var(--pb-jet-black)]"
            />
            상단 고정
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-[var(--pb-jet-black)]"
            />
            즉시 공개
          </label>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50">
          <Save size={14} />
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/admin/notices/new/page.tsx
git commit -m "feat(admin): add new notice page with Tiptap editor"
```

---

## Task 12: 공지사항 수정 페이지

**Files:**
- Create: `src/app/admin/notices/[id]/page.tsx`

- [ ] **Step 1: 공지 수정 페이지 생성**

`src/app/admin/notices/[id]/page.tsx`:

```typescript
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/components/admin/ui/TiptapEditor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminNoticeEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchNotice() {
      const res = await fetch(`/api/admin/notices/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
        setIsPinned(data.is_pinned);
        setIsPublished(data.is_published);
      }
      setLoading(false);
    }
    fetchNotice();
  }, [id]);

  async function handleSave() {
    if (!title.trim()) { alert("제목을 입력하세요."); return; }
    setSaving(true);
    await fetch(`/api/admin/notices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        is_pinned: isPinned,
        is_published: isPublished,
      }),
    });
    alert("저장되었습니다.");
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("정말 이 공지사항을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
    router.push("/admin/notices");
  }

  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";
  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/notices" className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
        <ArrowLeft size={12} /> 공지 목록
      </Link>

      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">공지 수정</h2>

        <div>
          <label className={labelClass}>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="공지사항 제목"
          />
        </div>

        <div>
          <label className={labelClass}>내용</label>
          <TiptapEditor content={content} onChange={setContent} placeholder="공지사항 내용을 작성하세요" />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="accent-[var(--pb-jet-black)]"
            />
            상단 고정
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-[var(--pb-jet-black)]"
            />
            공개
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50">
            <Save size={14} />
            {saving ? "저장 중..." : "저장"}
          </button>
          <button onClick={handleDelete} className="px-6 py-2.5 text-sm flex items-center gap-2 border border-[var(--accent-sale)] text-[var(--accent-sale)] hover:bg-[var(--accent-sale)] hover:text-white transition-colors">
            <Trash2 size={14} />
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/admin/notices/[id]/page.tsx
git commit -m "feat(admin): add notice edit page with Tiptap editor and delete"
```

---

## Task Summary

| Task | 내용 | 파일 수 |
|------|------|---------|
| 1 | DB 타입 업데이트 | 1 수정 |
| 2 | 리뷰 API | 2 생성 |
| 3 | 리뷰 목록 페이지 | 1 생성 |
| 4 | 리뷰 상세 페이지 | 1 생성 |
| 5 | 문의 API | 2 생성 |
| 6 | 문의 목록 페이지 | 1 생성 |
| 7 | 문의 상세 페이지 | 1 생성 |
| 8 | Tiptap 에디터 컴포넌트 | 1 생성 |
| 9 | 공지 API | 2 생성 |
| 10 | 공지 목록 페이지 | 1 생성 |
| 11 | 공지 작성 페이지 | 1 생성 |
| 12 | 공지 수정 페이지 | 1 생성 |
| **합계** | | **1 수정 + 14 생성** |
