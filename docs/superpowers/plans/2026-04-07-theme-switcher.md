# Theme Switcher 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 관리자 페이지에서 5개 프리셋 테마 중 선택하여 사이트 전체 색감을 변경하는 기능

**Architecture:** 프리셋은 코드 상수로 정의, DB에는 선택된 테마 ID만 저장. `layout.tsx`에서 서버사이드로 테마를 조회하여 `<html>` 태그에 CSS 변수를 동적 주입. `globals.css`의 하드코딩된 색상값도 CSS 변수로 교체.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase

---

## 파일 구조

### 신규 생성
```
src/constants/themes.ts                    — 5개 프리셋 상수 정의
src/lib/data/settings.ts                   — getThemeId() 서버 헬퍼
src/app/api/settings/route.ts              — 고객용 GET (테마 조회)
src/app/api/admin/settings/route.ts        — 관리자용 GET/PUT
src/app/admin/settings/page.tsx            — 테마 선택 어드민 페이지
```

### 수정
```
src/types/database.ts                      — DbSiteSettings 타입 추가
src/constants/admin.ts                     — 사이트 설정 네비 항목 추가
src/styles/globals.css                     — btn-primary/badge-handmade 하드코딩 → CSS 변수
src/app/layout.tsx                         — 테마 CSS 변수 동적 주입
```

---

## Task 1: 테마 프리셋 상수 정의

**Files:**
- Create: `src/constants/themes.ts`

- [ ] **Step 1: 프리셋 상수 파일 생성**

`src/constants/themes.ts`:

```typescript
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    "--pb-jet-black": string;
    "--pb-rich-black": string;
    "--pb-charcoal": string;
    "--pb-gray": string;
    "--pb-silver": string;
    "--pb-light-gray": string;
    "--pb-off-white": string;
    "--pb-snow": string;
    "--pb-accent-terracotta": string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "terracotta",
    name: "Terracotta",
    description: "베이지 배경 + 브라운 텍스트 + 테라코타 강조",
    colors: {
      "--pb-jet-black": "#3B2820",
      "--pb-rich-black": "#6B4A3A",
      "--pb-charcoal": "#6B4A3A",
      "--pb-gray": "#8B7355",
      "--pb-silver": "#B5A48C",
      "--pb-light-gray": "#D9C9AE",
      "--pb-off-white": "#F2ECE2",
      "--pb-snow": "#FAF7F2",
      "--pb-accent-terracotta": "#B5704F",
    },
  },
  {
    id: "monochrome",
    name: "Monochrome",
    description: "화이트 배경 + 블랙 텍스트 + 그레이 강조",
    colors: {
      "--pb-jet-black": "#0A0A0A",
      "--pb-rich-black": "#1A1A1A",
      "--pb-charcoal": "#333333",
      "--pb-gray": "#666666",
      "--pb-silver": "#999999",
      "--pb-light-gray": "#D4D4D4",
      "--pb-off-white": "#F0F0F0",
      "--pb-snow": "#FAFAFA",
      "--pb-accent-terracotta": "#666666",
    },
  },
  {
    id: "forest-light",
    name: "Forest Light",
    description: "베이지 배경 + 초록 텍스트 + 앰버 강조",
    colors: {
      "--pb-jet-black": "#2D4A2D",
      "--pb-rich-black": "#3D5C3D",
      "--pb-charcoal": "#4A6B4A",
      "--pb-gray": "#6B8B6B",
      "--pb-silver": "#9BAF8B",
      "--pb-light-gray": "#C8D5B9",
      "--pb-off-white": "#F2ECE2",
      "--pb-snow": "#FAF7F2",
      "--pb-accent-terracotta": "#C8873E",
    },
  },
  {
    id: "forest-deep",
    name: "Forest Deep",
    description: "초록 배경 + 베이지 텍스트 + 골드 강조",
    colors: {
      "--pb-jet-black": "#F2ECE2",
      "--pb-rich-black": "#D9C9AE",
      "--pb-charcoal": "#D9C9AE",
      "--pb-gray": "#B5A48C",
      "--pb-silver": "#8B9B7B",
      "--pb-light-gray": "#3D5C3D",
      "--pb-off-white": "#2D4A2D",
      "--pb-snow": "#1E3A1E",
      "--pb-accent-terracotta": "#C9A84C",
    },
  },
  {
    id: "lemon",
    name: "Lemon",
    description: "연노랑 배경 + 베이지 텍스트 + 코랄 강조",
    colors: {
      "--pb-jet-black": "#8B7355",
      "--pb-rich-black": "#6B4A3A",
      "--pb-charcoal": "#8B7355",
      "--pb-gray": "#A89070",
      "--pb-silver": "#C4B38A",
      "--pb-light-gray": "#E5D9A8",
      "--pb-off-white": "#FEF9C3",
      "--pb-snow": "#FEFCE8",
      "--pb-accent-terracotta": "#E07B5A",
    },
  },
];

export const DEFAULT_THEME_ID = "terracotta";

export function getThemePreset(themeId: string): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === themeId) ?? THEME_PRESETS[0];
}

export function themeToStyleString(theme: ThemePreset): string {
  return Object.entries(theme.colors)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/constants/themes.ts
git commit -m "feat(theme): add 5 theme presets with color definitions"
```

---

## Task 2: DB 타입 + 네비게이션

**Files:**
- Modify: `src/types/database.ts`
- Modify: `src/constants/admin.ts`

- [ ] **Step 1: DbSiteSettings 타입 추가**

`src/types/database.ts`에서 `DbMagazinePost` 타입 뒤에 추가:

```typescript
export type DbSiteSettings = {
  id: string;
  theme_id: string;
  updated_at: string;
};
```

같은 파일의 `Database` 타입 `Tables` 안에 (`pb_magazine` 뒤) 추가:

```typescript
pb_site_settings: {
  Row: DbSiteSettings;
  Insert: Omit<DbSiteSettings, "id" | "updated_at">;
  Update: Partial<Omit<DbSiteSettings, "id" | "updated_at">>;
  Relationships: [];
};
```

- [ ] **Step 2: 어드민 네비게이션에 사이트 설정 추가**

`src/constants/admin.ts`에서 import에 `Settings` 추가하고 배열 마지막에 항목 추가:

```typescript
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

// 기존 배열 끝에 추가:
  { label: "사이트 설정", href: "/admin/settings", icon: Settings },
```

- [ ] **Step 3: 커밋**

```bash
git add src/types/database.ts src/constants/admin.ts
git commit -m "feat(theme): add DbSiteSettings type and admin nav item"
```

---

## Task 3: globals.css 하드코딩 → CSS 변수

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: :root에 --pb-accent-terracotta 변수 추가**

`globals.css`의 `:root` 블록에서 `--pb-accent-success` 줄 뒤에 추가:

```css
--pb-accent-terracotta: #B5704F;
```

- [ ] **Step 2: btn-primary의 하드코딩 교체**

`.btn-primary`에서:
- `background-color: #B5704F;` → `background-color: var(--pb-accent-terracotta);`
- `color: #FAF7F2;` → `color: var(--pb-snow);`

`.btn-primary:hover`에서:
- `background-color: #FAF7F2;` → `background-color: var(--pb-snow);`
- `color: #B5704F;` → `color: var(--pb-accent-terracotta);`
- `border-color: #B5704F;` → `border-color: var(--pb-accent-terracotta);`

`.btn-primary:disabled:hover`에서:
- `background-color: #B5704F;` → `background-color: var(--pb-accent-terracotta);`
- `color: #FAF7F2;` → `color: var(--pb-snow);`

- [ ] **Step 3: badge-handmade의 하드코딩 교체**

`.badge-handmade`에서:
- `color: #B5704F;` → `color: var(--pb-accent-terracotta);`
- `border: 1px solid #B5704F;` → `border: 1px solid var(--pb-accent-terracotta);`

- [ ] **Step 4: 커밋**

```bash
git add src/styles/globals.css
git commit -m "feat(theme): replace hardcoded colors with CSS variables in globals.css"
```

---

## Task 4: 서버 데이터 헬퍼 + API

**Files:**
- Create: `src/lib/data/settings.ts`
- Create: `src/app/api/settings/route.ts`
- Create: `src/app/api/admin/settings/route.ts`

- [ ] **Step 1: getThemeId 서버 헬퍼**

`src/lib/data/settings.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_THEME_ID } from "@/constants/themes";

export async function getThemeId(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data } = await (supabase
      .from("pb_site_settings") as ReturnType<typeof supabase.from>)
      .select("theme_id")
      .limit(1)
      .single();

    if (data && typeof data === "object" && "theme_id" in data) {
      return (data as { theme_id: string }).theme_id;
    }
  } catch {
    // Table may not exist yet or no row — use default
  }
  return DEFAULT_THEME_ID;
}
```

- [ ] **Step 2: 고객용 API**

`src/app/api/settings/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getThemeId } from "@/lib/data/settings";

export async function GET() {
  const themeId = await getThemeId();
  return NextResponse.json({ theme_id: themeId });
}
```

- [ ] **Step 3: 관리자 API**

`src/app/api/admin/settings/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { THEME_PRESETS, DEFAULT_THEME_ID } from "@/constants/themes";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("pb_site_settings")
    .select("*")
    .limit(1)
    .single();

  return NextResponse.json({ theme_id: data?.theme_id ?? DEFAULT_THEME_ID });
}

export async function PUT(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const themeId = body.theme_id;

  // Validate theme_id
  if (!THEME_PRESETS.some((t) => t.id === themeId)) {
    return NextResponse.json({ error: "Invalid theme_id" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Upsert: update existing row or insert if none exists
  const { data: existing } = await supabase
    .from("pb_site_settings")
    .select("id")
    .limit(1)
    .single();

  if (existing) {
    await supabase
      .from("pb_site_settings")
      .update({ theme_id: themeId })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("pb_site_settings")
      .insert({ theme_id: themeId });
  }

  return NextResponse.json({ success: true, theme_id: themeId });
}
```

- [ ] **Step 4: 커밋**

```bash
git add src/lib/data/settings.ts src/app/api/settings/route.ts src/app/api/admin/settings/route.ts
git commit -m "feat(theme): add theme settings data layer and API routes"
```

---

## Task 5: layout.tsx 테마 주입

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: layout.tsx를 async로 변경하고 테마 주입**

`src/app/layout.tsx`에서:

import 추가:
```typescript
import { getThemeId } from "@/lib/data/settings";
import { getThemePreset, themeToStyleString } from "@/constants/themes";
```

`RootLayout` 함수를 async로 변경하고 테마 스타일 주입:

```typescript
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeId = await getThemeId();
  const theme = getThemePreset(themeId);
  const themeStyle = themeToStyleString(theme);

  return (
    <html lang="ko" className={archivo.variable} style={{ cssText: themeStyle } as React.CSSProperties}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

주의: `style={{ cssText: themeStyle }}` 패턴은 React에서 지원되지 않을 수 있으므로, 대안으로 `dangerouslySetInnerHTML`을 사용한 `<style>` 태그 주입:

```typescript
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeId = await getThemeId();
  const theme = getThemePreset(themeId);
  const themeStyle = themeToStyleString(theme);

  return (
    <html lang="ko" className={archivo.variable}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root { ${themeStyle} }` }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/layout.tsx
git commit -m "feat(theme): inject theme CSS variables in root layout"
```

---

## Task 6: 어드민 테마 선택 페이지

**Files:**
- Create: `src/app/admin/settings/page.tsx`

- [ ] **Step 1: 테마 선택 페이지 생성**

`src/app/admin/settings/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { THEME_PRESETS } from "@/constants/themes";

export default function AdminSettingsPage() {
  const [currentTheme, setCurrentTheme] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setCurrentTheme(data.theme_id);
        setLoading(false);
      });
  }, []);

  async function handleSelect(themeId: string) {
    if (themeId === currentTheme) return;
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme_id: themeId }),
    });
    if (res.ok) {
      setCurrentTheme(themeId);
      alert("테마가 변경되었습니다. 새로고침하면 적용됩니다.");
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-1">사이트 테마</h2>
        <p className="text-xs text-[var(--pb-gray)]">사이트 전체 색감을 변경합니다.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {THEME_PRESETS.map((theme) => {
          const isActive = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              disabled={saving}
              className={cn(
                "border bg-white p-5 text-left transition-colors relative",
                isActive
                  ? "border-[var(--pb-jet-black)] ring-1 ring-[var(--pb-jet-black)]"
                  : "border-[var(--pb-light-gray)] hover:border-[var(--pb-charcoal)]",
                saving && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Active check */}
              {isActive && (
                <div className="absolute top-3 right-3">
                  <Check size={16} className="text-[var(--pb-jet-black)]" />
                </div>
              )}

              {/* Color preview circles */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 border border-black/10"
                  style={{ backgroundColor: theme.colors["--pb-snow"] }}
                  title="배경"
                />
                <div
                  className="w-8 h-8 border border-black/10"
                  style={{ backgroundColor: theme.colors["--pb-jet-black"] }}
                  title="전경"
                />
                <div
                  className="w-8 h-8 border border-black/10"
                  style={{ backgroundColor: theme.colors["--pb-accent-terracotta"] }}
                  title="강조"
                />
              </div>

              {/* Theme info */}
              <p className="text-sm font-medium mb-1">{theme.name}</p>
              <p className="text-xs text-[var(--pb-gray)]">{theme.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/admin/settings/page.tsx
git commit -m "feat(theme): add admin theme selection page with preview cards"
```

---

## Task Summary

| Task | 내용 | 파일 수 |
|------|------|---------|
| 1 | 테마 프리셋 상수 | 1 생성 |
| 2 | DB 타입 + 네비게이션 | 2 수정 |
| 3 | globals.css 하드코딩 → CSS 변수 | 1 수정 |
| 4 | 서버 헬퍼 + API (3개) | 3 생성 |
| 5 | layout.tsx 테마 주입 | 1 수정 |
| 6 | 어드민 테마 선택 페이지 | 1 생성 |
| **합계** | | **4 생성 + 4 수정** |
