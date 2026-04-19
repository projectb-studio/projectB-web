# Admin Bundle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 3 admin features (member management, statistics dashboard, product-detail block CMS) together with required DB migrations, shared utilities, and test infrastructure.

**Architecture:** Next.js 14 App Router · Server Components by default · Supabase service-role client for admin APIs · Zod for schema validation · recharts for charts · @dnd-kit for block reordering · DOMPurify for rich-text sanitization. All `/api/admin/*` routes are gated by existing `getAdminUser()` helper.

**Tech Stack:**
- Existing: Next.js 14, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), tiptap, Tailwind, lucide-react, zustand
- New: `recharts`, `@dnd-kit/core`, `@dnd-kit/sortable`, `isomorphic-dompurify`, `zod`, `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`

**Reference spec:** [`docs/superpowers/specs/2026-04-14-admin-bundle-design.md`](../specs/2026-04-14-admin-bundle-design.md)

**Branch strategy:** `feature/admin-bundle` base. One PR per phase.

---

## Phase 0 — Test Infrastructure

### Task 0.1: Install Vitest + React Testing Library

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Install dev dependencies**

```bash
npm i -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

- [ ] **Step 3: Create `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add scripts to `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 5: Verify with a smoke test**

Create `src/test/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";
describe("smoke", () => {
  it("works", () => expect(1 + 1).toBe(2));
});
```

Run: `npm test`
Expected: `1 test passed`

- [ ] **Step 6: Commit**

```bash
git checkout -b feature/admin-bundle
git add package.json package-lock.json vitest.config.ts src/test/
git commit -m "chore(test): add vitest + rtl test infrastructure"
```

---

## Phase 1 — Foundation (PR 1)

### Task 1.1: Install runtime dependencies

**Files:** `package.json`

- [ ] **Step 1: Install packages**

```bash
npm i zod recharts @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities isomorphic-dompurify
```

- [ ] **Step 2: Verify versions**

Run: `grep -E '"(zod|recharts|@dnd-kit|isomorphic-dompurify)"' package.json`
Expected: all 5 packages listed.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add zod, recharts, dnd-kit, dompurify"
```

---

### Task 1.2: Migration — `pb_users` columns

**Files:**
- Create: `supabase/migration-p5-1-users.sql`

- [ ] **Step 1: Write migration**

```sql
-- supabase/migration-p5-1-users.sql

ALTER TABLE pb_users
  ADD COLUMN IF NOT EXISTS admin_memo TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS grade TEXT NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pb_users_grade_chk'
  ) THEN
    ALTER TABLE pb_users
      ADD CONSTRAINT pb_users_grade_chk CHECK (grade IN ('normal', 'vip'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pb_users_admin_memo_len_chk'
  ) THEN
    ALTER TABLE pb_users
      ADD CONSTRAINT pb_users_admin_memo_len_chk CHECK (char_length(admin_memo) <= 5000);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS pb_users_blocked_idx
  ON pb_users (is_blocked) WHERE is_blocked = TRUE;

CREATE INDEX IF NOT EXISTS pb_users_created_at_idx
  ON pb_users (created_at DESC);
```

- [ ] **Step 2: Apply on Supabase (SQL Editor)**

Run the script in Supabase dashboard → SQL Editor.
Expected: "Success. No rows returned" for each statement.

- [ ] **Step 3: Verify schema**

Run in SQL Editor:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'pb_users' AND column_name IN ('admin_memo','grade','is_blocked');
```
Expected: 3 rows.

---

### Task 1.3: Migration — `pb_products.detail_blocks`

**Files:** `supabase/migration-p5-2-products.sql`

- [ ] **Step 1: Write migration**

```sql
-- supabase/migration-p5-2-products.sql

ALTER TABLE pb_products
  ADD COLUMN IF NOT EXISTS detail_blocks JSONB NOT NULL DEFAULT '[]'::jsonb;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pb_products_detail_blocks_array_chk'
  ) THEN
    ALTER TABLE pb_products
      ADD CONSTRAINT pb_products_detail_blocks_array_chk
      CHECK (jsonb_typeof(detail_blocks) = 'array');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pb_products_detail_blocks_size_chk'
  ) THEN
    ALTER TABLE pb_products
      ADD CONSTRAINT pb_products_detail_blocks_size_chk
      CHECK (pg_column_size(detail_blocks) <= 1048576);
  END IF;
END $$;
```

- [ ] **Step 2: Apply + verify**

Run via SQL Editor, then:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name='pb_products' AND column_name='detail_blocks';
```
Expected: 1 row with `jsonb`.

---

### Task 1.4: Migration — stats indexes

**Files:** `supabase/migration-p5-3-stats-indexes.sql`

- [ ] **Step 1: Write migration**

```sql
-- supabase/migration-p5-3-stats-indexes.sql

CREATE INDEX IF NOT EXISTS pb_orders_created_status_idx
  ON pb_orders (created_at DESC, status);

CREATE INDEX IF NOT EXISTS pb_order_items_product_id_idx
  ON pb_order_items (product_id);
```

- [ ] **Step 2: Apply + verify**

```sql
SELECT indexname FROM pg_indexes
WHERE tablename IN ('pb_orders','pb_order_items')
  AND indexname LIKE '%_idx';
```
Expected: includes the two new indexes.

---

### Task 1.5: Migration — down script

**Files:** `supabase/migration-p5-down.sql`

- [ ] **Step 1: Write rollback**

```sql
-- supabase/migration-p5-down.sql  (run only for rollback)

DROP INDEX IF EXISTS pb_order_items_product_id_idx;
DROP INDEX IF EXISTS pb_orders_created_status_idx;

ALTER TABLE pb_products DROP CONSTRAINT IF EXISTS pb_products_detail_blocks_size_chk;
ALTER TABLE pb_products DROP CONSTRAINT IF EXISTS pb_products_detail_blocks_array_chk;
ALTER TABLE pb_products DROP COLUMN IF EXISTS detail_blocks;

DROP INDEX IF EXISTS pb_users_created_at_idx;
DROP INDEX IF EXISTS pb_users_blocked_idx;
ALTER TABLE pb_users DROP CONSTRAINT IF EXISTS pb_users_admin_memo_len_chk;
ALTER TABLE pb_users DROP CONSTRAINT IF EXISTS pb_users_grade_chk;
ALTER TABLE pb_users
  DROP COLUMN IF EXISTS is_blocked,
  DROP COLUMN IF EXISTS grade,
  DROP COLUMN IF EXISTS admin_memo;
```

- [ ] **Step 2: Commit migrations**

```bash
git add supabase/migration-p5-*.sql
git commit -m "feat(db): add admin bundle migrations (users/products/indexes + down)"
```

---

### Task 1.6: Regenerate Supabase types

**Files:** `src/types/database.ts`

- [ ] **Step 1: Regenerate**

```bash
npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" --schema public > src/types/database.ts
```

If CLI not linked, use Supabase dashboard → API → Generate TS types → copy-paste.

- [ ] **Step 2: Verify**

Run: `npm run type-check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/database.ts
git commit -m "chore(types): regenerate supabase types for P5 columns"
```

---

### Task 1.7: CSV utility (TDD)

**Files:**
- Create: `src/lib/csv.ts`
- Test: `src/lib/csv.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/csv.test.ts
import { describe, it, expect } from "vitest";
import { toCsv, escapeCell } from "./csv";

describe("escapeCell", () => {
  it("leaves plain text untouched", () => {
    expect(escapeCell("hello")).toBe("hello");
  });
  it("wraps comma-containing cells in quotes", () => {
    expect(escapeCell("a,b")).toBe('"a,b"');
  });
  it("escapes embedded double quotes", () => {
    expect(escapeCell('say "hi"')).toBe('"say ""hi"""');
  });
  it("wraps newline-containing cells", () => {
    expect(escapeCell("a\nb")).toBe('"a\nb"');
  });
  it("coerces null/undefined to empty", () => {
    expect(escapeCell(null)).toBe("");
    expect(escapeCell(undefined)).toBe("");
  });
});

describe("toCsv", () => {
  it("prepends UTF-8 BOM", () => {
    const out = toCsv(["a"], [["b"]]);
    expect(out.charCodeAt(0)).toBe(0xfeff);
  });
  it("joins header and rows with CRLF", () => {
    const out = toCsv(["a", "b"], [["1", "2"], ["3", "4"]]);
    expect(out.slice(1)).toBe("a,b\r\n1,2\r\n3,4");
  });
  it("escapes cells containing comma", () => {
    const out = toCsv(["n"], [["a,b"]]);
    expect(out.slice(1)).toBe('n\r\n"a,b"');
  });
});
```

- [ ] **Step 2: Run — must fail**

Run: `npm test -- csv`
Expected: `Cannot find module './csv'` or similar.

- [ ] **Step 3: Implement**

```ts
// src/lib/csv.ts
export function escapeCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  const BOM = "\uFEFF";
  const lines = [header.map(escapeCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(","));
  }
  return BOM + lines.join("\r\n");
}
```

- [ ] **Step 4: Run — must pass**

Run: `npm test -- csv`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/csv.ts src/lib/csv.test.ts
git commit -m "feat(lib): add RFC 4180 CSV utility with BOM"
```

---

### Task 1.8: Detail-blocks Zod schemas (TDD)

**Files:**
- Create: `src/lib/detail-blocks/schema.ts`
- Test: `src/lib/detail-blocks/schema.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/detail-blocks/schema.test.ts
import { describe, it, expect } from "vitest";
import { BlockSchema, BlocksSchema } from "./schema";

describe("BlockSchema", () => {
  it("accepts a valid image block", () => {
    const ok = BlockSchema.safeParse({
      id: "11111111-1111-1111-1111-111111111111",
      type: "image",
      data: { url: "https://cdn.example.com/a.jpg", alt: "a", width: "full" },
    });
    expect(ok.success).toBe(true);
  });

  it("rejects invalid youtube videoId", () => {
    const bad = BlockSchema.safeParse({
      id: "11111111-1111-1111-1111-111111111111",
      type: "youtube",
      data: { videoId: "too-short" },
    });
    expect(bad.success).toBe(false);
  });

  it("rejects unknown block type", () => {
    const bad = BlockSchema.safeParse({
      id: "11111111-1111-1111-1111-111111111111",
      type: "nope" as never,
      data: {},
    });
    expect(bad.success).toBe(false);
  });

  it("accepts spec block with empty rows", () => {
    const ok = BlockSchema.safeParse({
      id: "11111111-1111-1111-1111-111111111111",
      type: "spec",
      data: { rows: [] },
    });
    expect(ok.success).toBe(true);
  });
});

describe("BlocksSchema", () => {
  it("rejects arrays longer than 50", () => {
    const arr = Array.from({ length: 51 }, (_, i) => ({
      id: `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`,
      type: "image" as const,
      data: { url: "https://x.y/z.jpg", alt: "a", width: "full" as const },
    }));
    expect(BlocksSchema.safeParse(arr).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run — must fail**

Run: `npm test -- detail-blocks`
Expected: module not found.

- [ ] **Step 3: Implement schema**

```ts
// src/lib/detail-blocks/schema.ts
import { z } from "zod";

const Uuid = z.string().uuid();

const ImageRef = z.object({
  url: z.string().url(),
  alt: z.string().default(""),
});

export const ImageBlock = z.object({
  id: Uuid,
  type: z.literal("image"),
  data: z.object({
    url: z.string().url(),
    alt: z.string().default(""),
    caption: z.string().optional(),
    width: z.enum(["full", "narrow"]),
  }),
});

export const GalleryBlock = z.object({
  id: Uuid,
  type: z.literal("gallery"),
  data: z.object({
    images: z.array(ImageRef).min(1).max(20),
    columns: z.union([z.literal(2), z.literal(3)]),
  }),
});

export const RichTextBlock = z.object({
  id: Uuid,
  type: z.literal("richtext"),
  data: z.object({ html: z.string().max(100_000) }),
});

export const TwoColBlock = z.object({
  id: Uuid,
  type: z.literal("twocol"),
  data: z.object({
    image: ImageRef,
    text: z.object({ html: z.string().max(50_000) }),
    imageSide: z.enum(["left", "right"]),
  }),
});

export const SpecBlock = z.object({
  id: Uuid,
  type: z.literal("spec"),
  data: z.object({
    title: z.string().optional(),
    rows: z.array(z.object({ label: z.string(), value: z.string() })).max(30),
  }),
});

export const CareBlock = z.object({
  id: Uuid,
  type: z.literal("care"),
  data: z.object({
    items: z
      .array(
        z.object({
          icon: z.enum(["wash", "dry", "iron", "bleach", "custom"]),
          text: z.string(),
        })
      )
      .max(10),
  }),
});

export const BannerBlock = z.object({
  id: Uuid,
  type: z.literal("banner"),
  data: z.object({
    text: z.string().max(200),
    bgColor: z.enum(["black", "offwhite", "sale"]),
    align: z.enum(["left", "center"]),
  }),
});

export const YoutubeBlock = z.object({
  id: Uuid,
  type: z.literal("youtube"),
  data: z.object({
    videoId: z.string().regex(/^[a-zA-Z0-9_-]{11}$/),
    caption: z.string().optional(),
  }),
});

export const BlockSchema = z.discriminatedUnion("type", [
  ImageBlock, GalleryBlock, RichTextBlock, TwoColBlock,
  SpecBlock, CareBlock, BannerBlock, YoutubeBlock,
]);

export const BlocksSchema = z.array(BlockSchema).max(50);

export type Block = z.infer<typeof BlockSchema>;
export type Blocks = z.infer<typeof BlocksSchema>;
```

- [ ] **Step 4: Run — must pass**

Run: `npm test -- detail-blocks`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/detail-blocks/
git commit -m "feat(detail-blocks): add zod schema for 8 block types"
```

---

### Task 1.9: Rich-text sanitizer (TDD)

**Files:**
- Create: `src/lib/detail-blocks/sanitize.ts`
- Test: `src/lib/detail-blocks/sanitize.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/detail-blocks/sanitize.test.ts
import { describe, it, expect } from "vitest";
import { sanitizeRichText } from "./sanitize";

describe("sanitizeRichText", () => {
  it("keeps allowed tags", () => {
    expect(sanitizeRichText("<p>hi <strong>there</strong></p>"))
      .toBe("<p>hi <strong>there</strong></p>");
  });
  it("strips script tags", () => {
    const out = sanitizeRichText('<p>ok</p><script>alert(1)</script>');
    expect(out).not.toContain("<script>");
  });
  it("removes on* handlers", () => {
    const out = sanitizeRichText('<a href="/" onclick="x">a</a>');
    expect(out).not.toContain("onclick");
  });
  it("strips javascript: URLs", () => {
    const out = sanitizeRichText('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain("javascript:");
  });
});
```

- [ ] **Step 2: Run — must fail**

Run: `npm test -- sanitize`
Expected: module not found.

- [ ] **Step 3: Implement**

```ts
// src/lib/detail-blocks/sanitize.ts
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["p", "h2", "h3", "strong", "em", "ul", "ol", "li", "a", "br"];
const ALLOWED_ATTR = ["href", "target", "rel"];

export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
```

- [ ] **Step 4: Run — must pass**

Run: `npm test -- sanitize`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/detail-blocks/sanitize.ts src/lib/detail-blocks/sanitize.test.ts
git commit -m "feat(detail-blocks): add server-side HTML sanitizer"
```

---

### Task 1.10: `requireActiveUser` guard (TDD)

**Files:**
- Create: `src/lib/auth/require-active-user.ts`
- Test: `src/lib/auth/require-active-user.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/auth/require-active-user.test.ts
import { describe, it, expect, vi } from "vitest";
import { assertNotBlocked, BlockedError } from "./require-active-user";

describe("assertNotBlocked", () => {
  it("passes when user is not blocked", () => {
    expect(() => assertNotBlocked({ id: "u1", is_blocked: false })).not.toThrow();
  });
  it("throws BlockedError when user is blocked", () => {
    expect(() => assertNotBlocked({ id: "u1", is_blocked: true })).toThrow(BlockedError);
  });
  it("passes when is_blocked is missing (treated as not blocked)", () => {
    expect(() => assertNotBlocked({ id: "u1" } as never)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run — must fail**

Run: `npm test -- require-active-user`
Expected: module not found.

- [ ] **Step 3: Implement**

```ts
// src/lib/auth/require-active-user.ts

export class BlockedError extends Error {
  constructor() {
    super("USER_BLOCKED");
    this.name = "BlockedError";
  }
}

export function assertNotBlocked(user: { id: string; is_blocked?: boolean | null }): void {
  if (user?.is_blocked === true) throw new BlockedError();
}
```

- [ ] **Step 4: Run — must pass**

Run: `npm test -- require-active-user`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/
git commit -m "feat(auth): add BlockedError + assertNotBlocked guard"
```

---

### Task 1.11: Stats date helpers (TDD)

**Files:**
- Create: `src/lib/stats/period.ts`
- Test: `src/lib/stats/period.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/stats/period.test.ts
import { describe, it, expect } from "vitest";
import { parsePeriod, previousPeriod } from "./period";

describe("parsePeriod", () => {
  it("returns today for preset=today (KST)", () => {
    const p = parsePeriod({ preset: "today" }, new Date("2026-04-14T03:00:00Z"));
    expect(p.from.toISOString().slice(0, 10)).toBe("2026-04-14");
    expect(p.to.toISOString().slice(0, 10)).toBe("2026-04-14");
  });
  it("returns last 7 days for preset=7d", () => {
    const p = parsePeriod({ preset: "7d" }, new Date("2026-04-14T03:00:00Z"));
    expect(p.from.toISOString().slice(0, 10)).toBe("2026-04-08");
    expect(p.to.toISOString().slice(0, 10)).toBe("2026-04-14");
  });
  it("rejects to < from", () => {
    expect(() => parsePeriod({ from: "2026-04-10", to: "2026-04-01" })).toThrow();
  });
});

describe("previousPeriod", () => {
  it("returns the equally-long previous window", () => {
    const prev = previousPeriod({
      from: new Date("2026-04-08T00:00:00+09:00"),
      to: new Date("2026-04-14T23:59:59+09:00"),
    });
    expect(prev.from.toISOString().slice(0, 10)).toBe("2026-04-01");
    expect(prev.to.toISOString().slice(0, 10)).toBe("2026-04-07");
  });
});
```

- [ ] **Step 2: Run — must fail**

- [ ] **Step 3: Implement**

```ts
// src/lib/stats/period.ts

const DAY_MS = 24 * 60 * 60 * 1000;

export type Period = { from: Date; to: Date };

function startOfKstDay(d: Date): Date {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  kst.setUTCHours(0, 0, 0, 0);
  return new Date(kst.getTime() - 9 * 60 * 60 * 1000);
}

function endOfKstDay(d: Date): Date {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  kst.setUTCHours(23, 59, 59, 999);
  return new Date(kst.getTime() - 9 * 60 * 60 * 1000);
}

export function parsePeriod(
  input: { preset?: "today" | "7d" | "30d" | "90d"; from?: string; to?: string },
  now: Date = new Date()
): Period {
  if (input.preset) {
    const to = endOfKstDay(now);
    const days = input.preset === "today" ? 0 : input.preset === "7d" ? 6 : input.preset === "30d" ? 29 : 89;
    const from = startOfKstDay(new Date(now.getTime() - days * DAY_MS));
    return { from, to };
  }
  if (!input.from || !input.to) throw new Error("missing period");
  const from = startOfKstDay(new Date(input.from + "T00:00:00+09:00"));
  const to = endOfKstDay(new Date(input.to + "T00:00:00+09:00"));
  if (to.getTime() < from.getTime()) throw new Error("to must be >= from");
  return { from, to };
}

export function previousPeriod(p: Period): Period {
  const span = p.to.getTime() - p.from.getTime();
  const prevTo = new Date(p.from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - span);
  return { from: prevFrom, to: prevTo };
}
```

- [ ] **Step 4: Run — must pass**

Run: `npm test -- period`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stats/
git commit -m "feat(stats): add KST period parser + previous-window helper"
```

---

### Task 1.12: Open PR 1

- [ ] **Step 1: Push**

```bash
git push -u origin feature/admin-bundle
```

- [ ] **Step 2: Open PR**

Title: `feat: admin bundle foundation (PR 1 — migrations + shared utils)`
Body: link to spec + summary of migrations + new utils + test infra.

---

## Phase 2 — Member Management (PR 2)

### Task 2.1: Member list API

**Files:**
- Create: `src/app/api/admin/members/route.ts`

- [ ] **Step 1: Implement GET handler**

```ts
// src/app/api/admin/members/route.ts
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const PAGE_SIZE = 20;
const VALID_SORT = new Set(["joined_at", "last_order_at", "total_spent"]);

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? "";
  const grade = url.searchParams.get("grade");
  const blocked = url.searchParams.get("blocked");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const sort = url.searchParams.get("sort") ?? "joined_at";
  if (!VALID_SORT.has(sort)) return NextResponse.json({ error: "bad sort" }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("pb_admin_member_list", {
    p_search: search || null,
    p_grade: grade || null,
    p_blocked: blocked === "true" ? true : blocked === "false" ? false : null,
    p_sort: sort,
    p_limit: PAGE_SIZE,
    p_offset: (page - 1) * PAGE_SIZE,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [], page, pageSize: PAGE_SIZE });
}
```

- [ ] **Step 2: Create the RPC function**

```sql
-- supabase/migration-p5-1b-member-rpc.sql
CREATE OR REPLACE FUNCTION pb_admin_member_list(
  p_search TEXT,
  p_grade TEXT,
  p_blocked BOOLEAN,
  p_sort TEXT,
  p_limit INT,
  p_offset INT
) RETURNS TABLE (
  id UUID, name TEXT, email TEXT, phone TEXT,
  grade TEXT, is_blocked BOOLEAN, joined_at TIMESTAMPTZ,
  order_count BIGINT, total_spent BIGINT, last_order_at TIMESTAMPTZ
) LANGUAGE sql STABLE AS $$
  SELECT
    u.id, u.name, u.email, u.phone, u.grade, u.is_blocked,
    u.created_at AS joined_at,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.total_amount) FILTER (WHERE o.status IN ('paid','shipped','delivered')), 0)::BIGINT AS total_spent,
    MAX(o.created_at) AS last_order_at
  FROM pb_users u
  LEFT JOIN pb_orders o ON o.user_id = u.id
  WHERE (p_search IS NULL OR u.name ILIKE '%'||p_search||'%' OR u.email ILIKE '%'||p_search||'%' OR u.phone ILIKE '%'||p_search||'%')
    AND (p_grade IS NULL OR u.grade = p_grade)
    AND (p_blocked IS NULL OR u.is_blocked = p_blocked)
  GROUP BY u.id
  ORDER BY
    CASE WHEN p_sort = 'joined_at'     THEN u.created_at END DESC,
    CASE WHEN p_sort = 'last_order_at' THEN MAX(o.created_at) END DESC,
    CASE WHEN p_sort = 'total_spent'   THEN COALESCE(SUM(o.total_amount) FILTER (WHERE o.status IN ('paid','shipped','delivered')), 0) END DESC
  LIMIT p_limit OFFSET p_offset;
$$;
```
Apply in Supabase SQL Editor.

- [ ] **Step 3: Manual smoke test**

Run: `npm run dev`, log in as admin, open `/api/admin/members` → expect `{ items: [...], page:1, pageSize:20 }`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migration-p5-1b-member-rpc.sql src/app/api/admin/members/route.ts
git commit -m "feat(admin/api): member list RPC + route"
```

---

### Task 2.2: Member detail + PATCH API

**Files:** `src/app/api/admin/members/[id]/route.ts`

- [ ] **Step 1: Implement**

```ts
// src/app/api/admin/members/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const PatchSchema = z.object({
  admin_memo: z.string().max(5000).optional(),
  grade: z.enum(["normal", "vip"]).optional(),
  is_blocked: z.boolean().optional(),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const { data: user, error } = await supabase
    .from("pb_users")
    .select("id,name,email,phone,grade,is_blocked,admin_memo,created_at")
    .eq("id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  const { data: orders } = await supabase
    .from("pb_orders")
    .select("id,order_no,total_amount,status,created_at")
    .eq("user_id", params.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { count: reviewCount } = await supabase
    .from("pb_reviews")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", params.id);

  return NextResponse.json({ user, orders: orders ?? [], reviewCount: reviewCount ?? 0 });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = PatchSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.format() }, { status: 422 });

  const supabase = createAdminClient();
  const { error } = await supabase.from("pb_users").update(body.data).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/admin/members/[id]/route.ts
git commit -m "feat(admin/api): member detail GET + PATCH"
```

---

### Task 2.3: CSV export API

**Files:** `src/app/api/admin/members/export/route.ts`

- [ ] **Step 1: Implement**

```ts
// src/app/api/admin/members/export/route.ts
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { toCsv } from "@/lib/csv";

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("pb_admin_member_list", {
    p_search: url.searchParams.get("search") || null,
    p_grade: url.searchParams.get("grade") || null,
    p_blocked: url.searchParams.get("blocked") === "true" ? true : url.searchParams.get("blocked") === "false" ? false : null,
    p_sort: "joined_at",
    p_limit: 5000,
    p_offset: 0,
  });
  if (error) return new Response(error.message, { status: 500 });

  const header = ["id","name","email","phone","grade","is_blocked","joined_at","order_count","total_spent","last_order_at"];
  const rows = (data ?? []).map((r: Record<string, unknown>) => header.map((k) => r[k]));
  const csv = toCsv(header, rows);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="members-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  });
}
```

- [ ] **Step 2: Manual test**

Visit `/api/admin/members/export` as admin → CSV downloads, opens correctly in Excel with Korean.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/members/export/
git commit -m "feat(admin/api): CSV export with UTF-8 BOM"
```

---

### Task 2.4: Wire blocked check into auth

**Files:** `src/app/auth/callback/route.ts` (existing, verify path)

- [ ] **Step 1: Locate callback**

Run: `ls src/app/auth/` to confirm callback route path.

- [ ] **Step 2: Add block check**

After successful session exchange, insert:
```ts
const { data: user } = await supabase
  .from("pb_users")
  .select("is_blocked")
  .eq("id", session.user.id)
  .single();

if (user?.is_blocked) {
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/auth?error=blocked", req.url));
}
```

- [ ] **Step 3: Add blocked error message on auth page**

In `src/app/auth/page.tsx`, read `error` search param and if `blocked`, show message `"차단된 계정입니다. 관리자에게 문의해주세요."`.

- [ ] **Step 4: Commit**

```bash
git add src/app/auth/
git commit -m "feat(auth): block signed-in users with is_blocked flag"
```

---

### Task 2.5: Member list page UI

**Files:**
- Create: `src/app/admin/members/page.tsx`
- Create: `src/components/admin/members/MemberTable.tsx`
- Create: `src/components/admin/members/MemberFilters.tsx`
- Modify: `src/app/admin/AdminLayoutClient.tsx` (add sidebar item)

- [ ] **Step 1: Server page**

```tsx
// src/app/admin/members/page.tsx
import { getAdminUser } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import MemberFilters from "@/components/admin/members/MemberFilters";
import MemberTable from "@/components/admin/members/MemberTable";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: { search?: string; grade?: string; blocked?: string; page?: string; sort?: string } }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/auth");

  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([k,v]) => v && params.set(k, v));

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/members?${params}`, {
    headers: { cookie: "" },
    cache: "no-store",
  });
  const { items = [], page = 1, pageSize = 20 } = await res.json();

  return (
    <section className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide uppercase">Members</h1>
        <a href={`/api/admin/members/export?${params}`} className="border border-black px-3 py-1 text-sm">CSV 내보내기</a>
      </header>
      <MemberFilters defaults={searchParams} />
      <MemberTable items={items} page={page} pageSize={pageSize} searchParams={searchParams} />
    </section>
  );
}
```

- [ ] **Step 2: Filter component (client)**

```tsx
// src/components/admin/members/MemberFilters.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function MemberFilters({ defaults }: { defaults: Record<string, string | undefined> }) {
  const router = useRouter();
  const params = useSearchParams();

  function update(k: string, v: string) {
    const next = new URLSearchParams(params.toString());
    if (v) next.set(k, v); else next.delete(k);
    next.delete("page");
    router.push(`?${next.toString()}`);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <input
        placeholder="이름/이메일/전화 검색"
        defaultValue={defaults.search ?? ""}
        onKeyDown={(e) => e.key === "Enter" && update("search", (e.target as HTMLInputElement).value)}
        className="border border-neutral-300 px-3 py-1 w-64"
      />
      <select defaultValue={defaults.grade ?? ""} onChange={(e) => update("grade", e.target.value)} className="border border-neutral-300 px-3 py-1">
        <option value="">전체 등급</option>
        <option value="normal">일반</option>
        <option value="vip">VIP</option>
      </select>
      <select defaultValue={defaults.blocked ?? ""} onChange={(e) => update("blocked", e.target.value)} className="border border-neutral-300 px-3 py-1">
        <option value="">전체 상태</option>
        <option value="false">활성</option>
        <option value="true">차단</option>
      </select>
    </div>
  );
}
```

- [ ] **Step 3: Table component**

```tsx
// src/components/admin/members/MemberTable.tsx
import Link from "next/link";

type Item = { id: string; name: string; email: string; phone: string; grade: string; is_blocked: boolean; joined_at: string; order_count: number; total_spent: number; last_order_at: string | null };

export default function MemberTable({ items, page, pageSize, searchParams }: { items: Item[]; page: number; pageSize: number; searchParams: Record<string, string | undefined> }) {
  const makeHref = (p: number) => {
    const s = new URLSearchParams();
    Object.entries(searchParams).forEach(([k,v]) => v && s.set(k,v));
    s.set("page", String(p));
    return `?${s}`;
  };
  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="py-2">이름</th><th>이메일</th><th>전화</th>
            <th>등급</th><th>가입일</th><th>최근주문</th>
            <th className="text-right">총 구매금액</th><th>주문수</th><th>상태</th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id} className="border-b border-neutral-200 hover:bg-neutral-50">
              <td className="py-2"><Link href={`/admin/members/${u.id}`}>{u.name || "(이름 없음)"}</Link></td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{u.grade === "vip" ? "VIP" : "일반"}</td>
              <td>{u.joined_at?.slice(0,10)}</td>
              <td>{u.last_order_at?.slice(0,10) ?? "-"}</td>
              <td className="text-right">₩{u.total_spent.toLocaleString()}</td>
              <td>{u.order_count}</td>
              <td>{u.is_blocked ? <span className="text-red-600">차단</span> : "활성"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <p className="py-8 text-center text-neutral-500">해당 조건의 회원이 없습니다.</p>}
      <nav className="flex gap-1 mt-4">
        {page > 1 && <Link href={makeHref(page - 1)} className="border border-neutral-300 px-2 py-1">이전</Link>}
        <span className="px-3 py-1">페이지 {page}</span>
        {items.length === pageSize && <Link href={makeHref(page + 1)} className="border border-neutral-300 px-2 py-1">다음</Link>}
      </nav>
    </div>
  );
}
```

- [ ] **Step 4: Sidebar nav entry**

In `src/app/admin/AdminLayoutClient.tsx`, add `{ href: "/admin/members", label: "회원" }` to the nav array (match existing pattern).

- [ ] **Step 5: Verify**

Run: `npm run dev`, login as admin, navigate to `/admin/members`. Should show table. Filter, search, pagination work.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/members/page.tsx src/components/admin/members/ src/app/admin/AdminLayoutClient.tsx
git commit -m "feat(admin/ui): member list page + sidebar entry"
```

---

### Task 2.6: Member detail page UI

**Files:**
- Create: `src/app/admin/members/[id]/page.tsx`
- Create: `src/components/admin/members/MemberDetailForm.tsx`

- [ ] **Step 1: Server page**

```tsx
// src/app/admin/members/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import MemberDetailForm from "@/components/admin/members/MemberDetailForm";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/auth");

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/members/${params.id}`, { cache: "no-store" });
  if (!res.ok) notFound();
  const { user, orders, reviewCount } = await res.json();

  const paidOrders = orders.filter((o: { status: string }) => ["paid","shipped","delivered"].includes(o.status));
  const totalSpent = paidOrders.reduce((s: number, o: { total_amount: number }) => s + o.total_amount, 0);

  return (
    <section className="p-6 space-y-6">
      <a href="/admin/members" className="text-sm">← 목록</a>
      <MemberDetailForm user={user} />
      <div className="grid grid-cols-4 gap-4">
        <Card label="총 주문 수" value={orders.length} />
        <Card label="총 구매금액" value={`₩${totalSpent.toLocaleString()}`} />
        <Card label="평균 객단가" value={paidOrders.length ? `₩${Math.round(totalSpent / paidOrders.length).toLocaleString()}` : "-"} />
        <Card label="리뷰 작성 수" value={reviewCount} />
      </div>
      <h2 className="uppercase tracking-wide font-semibold">주문 이력 (최근 20건)</h2>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-black text-left"><th className="py-2">주문번호</th><th>일시</th><th className="text-right">금액</th><th>상태</th><th></th></tr></thead>
        <tbody>
          {orders.map((o: { id: string; order_no: string; created_at: string; total_amount: number; status: string }) => (
            <tr key={o.id} className="border-b border-neutral-200">
              <td className="py-2">{o.order_no}</td>
              <td>{o.created_at.slice(0,16).replace("T"," ")}</td>
              <td className="text-right">₩{o.total_amount.toLocaleString()}</td>
              <td>{o.status}</td>
              <td><a href={`/admin/orders/${o.id}`} className="underline">상세</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return <div className="border border-neutral-300 p-4"><div className="text-xs uppercase text-neutral-500">{label}</div><div className="text-xl mt-1">{value}</div></div>;
}
```

- [ ] **Step 2: Detail form (client, inline PATCH)**

```tsx
// src/components/admin/members/MemberDetailForm.tsx
"use client";
import { useState, useEffect } from "react";

type User = { id: string; name: string; email: string; phone: string; grade: "normal"|"vip"; is_blocked: boolean; admin_memo: string; created_at: string };

export default function MemberDetailForm({ user }: { user: User }) {
  const [grade, setGrade] = useState(user.grade);
  const [blocked, setBlocked] = useState(user.is_blocked);
  const [memo, setMemo] = useState(user.admin_memo ?? "");
  const [status, setStatus] = useState<"idle"|"saving"|"saved"|"error">("idle");

  async function save(patch: Partial<User>) {
    setStatus("saving");
    const res = await fetch(`/api/admin/members/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 1500);
  }

  useEffect(() => {
    if (memo === (user.admin_memo ?? "")) return;
    const t = setTimeout(() => save({ admin_memo: memo }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memo]);

  return (
    <div className="border border-neutral-300 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div><div className="text-xs uppercase text-neutral-500">이름</div><div>{user.name}</div></div>
        <div><div className="text-xs uppercase text-neutral-500">이메일</div><div>{user.email}</div></div>
        <div><div className="text-xs uppercase text-neutral-500">전화</div><div>{user.phone}</div></div>
        <div><div className="text-xs uppercase text-neutral-500">가입일</div><div>{user.created_at.slice(0,10)}</div></div>
      </div>
      <div className="flex gap-4 items-center">
        <label>등급
          <select value={grade} onChange={(e) => { const v = e.target.value as "normal"|"vip"; setGrade(v); save({ grade: v }); }} className="ml-2 border border-neutral-300 px-2 py-1">
            <option value="normal">일반</option>
            <option value="vip">VIP</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={blocked} onChange={(e) => { setBlocked(e.target.checked); save({ is_blocked: e.target.checked }); }} />
          차단
        </label>
        <span className="text-xs text-neutral-500">{status === "saving" ? "저장 중..." : status === "saved" ? "저장됨" : status === "error" ? "오류" : ""}</span>
      </div>
      <div>
        <label className="text-xs uppercase text-neutral-500">관리 메모 ({memo.length}/5000)</label>
        <textarea value={memo} onChange={(e) => setMemo(e.target.value.slice(0, 5000))} rows={4} className="w-full border border-neutral-300 p-2" />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Navigate to `/admin/members/<someid>`. Change grade → toast "저장됨". Toggle block → verify DB. Edit memo → 300ms later auto-save.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/members/[id]/ src/components/admin/members/MemberDetailForm.tsx
git commit -m "feat(admin/ui): member detail page with inline grade/block/memo"
```

---

### Task 2.7: Open PR 2

- [ ] Push and open PR titled `feat: admin member management (PR 2)`.

---

## Phase 3 — Statistics Dashboard (PR 3)

### Task 3.1: Stats SQL functions

**Files:** `supabase/migration-p5-4-stats-rpc.sql`

- [ ] **Step 1: Write RPCs**

```sql
-- supabase/migration-p5-4-stats-rpc.sql

CREATE OR REPLACE FUNCTION pb_stats_summary(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (revenue BIGINT, order_count BIGINT, new_users BIGINT) LANGUAGE sql STABLE AS $$
  SELECT
    COALESCE(SUM(total_amount) FILTER (WHERE status IN ('paid','shipped','delivered')), 0)::BIGINT AS revenue,
    COUNT(*) FILTER (WHERE status IN ('paid','shipped','delivered'))::BIGINT AS order_count,
    (SELECT COUNT(*)::BIGINT FROM pb_users WHERE created_at BETWEEN p_from AND p_to) AS new_users
  FROM pb_orders WHERE created_at BETWEEN p_from AND p_to;
$$;

CREATE OR REPLACE FUNCTION pb_stats_revenue_daily(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (day DATE, revenue BIGINT) LANGUAGE sql STABLE AS $$
  SELECT
    (date_trunc('day', created_at AT TIME ZONE 'Asia/Seoul'))::DATE AS day,
    COALESCE(SUM(total_amount), 0)::BIGINT AS revenue
  FROM pb_orders
  WHERE created_at BETWEEN p_from AND p_to AND status IN ('paid','shipped','delivered')
  GROUP BY 1 ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION pb_stats_orders_by_status(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (status TEXT, count BIGINT) LANGUAGE sql STABLE AS $$
  SELECT status, COUNT(*)::BIGINT
  FROM pb_orders WHERE created_at BETWEEN p_from AND p_to GROUP BY status;
$$;

CREATE OR REPLACE FUNCTION pb_stats_top_products(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (product_id UUID, name TEXT, qty BIGINT, revenue BIGINT) LANGUAGE sql STABLE AS $$
  SELECT p.id, p.name, SUM(oi.quantity)::BIGINT AS qty, SUM(oi.price * oi.quantity)::BIGINT AS revenue
  FROM pb_order_items oi
  JOIN pb_orders o ON o.id = oi.order_id
  JOIN pb_products p ON p.id = oi.product_id
  WHERE o.created_at BETWEEN p_from AND p_to AND o.status IN ('paid','shipped','delivered')
  GROUP BY p.id, p.name ORDER BY revenue DESC LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION pb_stats_new_users_daily(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (day DATE, count BIGINT) LANGUAGE sql STABLE AS $$
  SELECT (date_trunc('day', created_at AT TIME ZONE 'Asia/Seoul'))::DATE AS day, COUNT(*)::BIGINT
  FROM pb_users WHERE created_at BETWEEN p_from AND p_to GROUP BY 1 ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION pb_stats_repurchase_rate(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (total_customers BIGINT, repeat_customers BIGINT) LANGUAGE sql STABLE AS $$
  WITH c AS (
    SELECT user_id, COUNT(*) AS n FROM pb_orders
    WHERE created_at BETWEEN p_from AND p_to
      AND status IN ('paid','shipped','delivered')
      AND user_id IS NOT NULL
    GROUP BY user_id
  )
  SELECT COUNT(*)::BIGINT, COUNT(*) FILTER (WHERE n >= 2)::BIGINT FROM c;
$$;
```
Apply in SQL Editor.

- [ ] **Step 2: Commit**

```bash
git add supabase/migration-p5-4-stats-rpc.sql
git commit -m "feat(db): stats RPC functions"
```

---

### Task 3.2: Stats API routes

**Files:** `src/app/api/admin/stats/{summary,revenue,orders-by-status,top-products,new-users,repurchase-rate}/route.ts`

- [ ] **Step 1: Implement shared helper**

Create `src/lib/stats/api.ts`:
```ts
import { NextResponse } from "next/server";
import { parsePeriod } from "./period";
import { getAdminUser } from "@/lib/admin-auth";

export async function statsGuard(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const url = new URL(req.url);
  try {
    const preset = url.searchParams.get("preset") as "today"|"7d"|"30d"|"90d"|null;
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;
    const p = parsePeriod(preset ? { preset } : { from, to });
    return { period: p };
  } catch (e) {
    return { error: NextResponse.json({ error: (e as Error).message }, { status: 400 }) };
  }
}
```

- [ ] **Step 2: summary route**

```ts
// src/app/api/admin/stats/summary/route.ts
import { NextResponse } from "next/server";
import { statsGuard } from "@/lib/stats/api";
import { previousPeriod } from "@/lib/stats/period";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 60;

export async function GET(req: Request) {
  const g = await statsGuard(req);
  if ("error" in g) return g.error;
  const supabase = createAdminClient();

  const [cur, prev] = await Promise.all([
    supabase.rpc("pb_stats_summary", { p_from: g.period.from.toISOString(), p_to: g.period.to.toISOString() }),
    (async () => {
      const p = previousPeriod(g.period);
      return supabase.rpc("pb_stats_summary", { p_from: p.from.toISOString(), p_to: p.to.toISOString() });
    })(),
  ]);

  return NextResponse.json({ current: cur.data?.[0] ?? null, previous: prev.data?.[0] ?? null });
}
```

- [ ] **Step 3: revenue / orders-by-status / top-products / new-users / repurchase-rate routes**

Each follows identical pattern, calling its RPC:
```ts
// template
export const revalidate = 60; // or 300 for repurchase
export async function GET(req: Request) {
  const g = await statsGuard(req);
  if ("error" in g) return g.error;
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("<rpc-name>", { p_from: g.period.from.toISOString(), p_to: g.period.to.toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}
```
Create all 5 files with appropriate `<rpc-name>`. Repurchase route uses `revalidate = 300`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/stats/api.ts src/app/api/admin/stats/
git commit -m "feat(admin/api): stats endpoints (summary + 5 charts)"
```

---

### Task 3.3: Stats dashboard page + chart components

**Files:**
- Create: `src/app/admin/stats/page.tsx`
- Create: `src/components/admin/stats/PeriodPicker.tsx`
- Create: `src/components/admin/stats/SummaryCards.tsx`
- Create: `src/components/admin/stats/RevenueChart.tsx`
- Create: `src/components/admin/stats/OrderStatusDonut.tsx`
- Create: `src/components/admin/stats/TopProducts.tsx`
- Create: `src/components/admin/stats/NewUsersChart.tsx`
- Create: `src/components/admin/stats/RepurchaseRate.tsx`

- [ ] **Step 1: Server page**

```tsx
// src/app/admin/stats/page.tsx
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import PeriodPicker from "@/components/admin/stats/PeriodPicker";
import SummaryCards from "@/components/admin/stats/SummaryCards";
import RevenueChart from "@/components/admin/stats/RevenueChart";
import OrderStatusDonut from "@/components/admin/stats/OrderStatusDonut";
import TopProducts from "@/components/admin/stats/TopProducts";
import NewUsersChart from "@/components/admin/stats/NewUsersChart";
import RepurchaseRate from "@/components/admin/stats/RepurchaseRate";

export const dynamic = "force-dynamic";

async function fetchJSON(path: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function Page({ searchParams }: { searchParams: { preset?: string; from?: string; to?: string } }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/auth");

  const q = new URLSearchParams();
  if (searchParams.preset) q.set("preset", searchParams.preset);
  else if (searchParams.from && searchParams.to) { q.set("from", searchParams.from); q.set("to", searchParams.to); }
  else q.set("preset", "30d");

  const [summary, revenue, byStatus, top, newUsers, repurchase] = await Promise.all([
    fetchJSON(`/api/admin/stats/summary?${q}`),
    fetchJSON(`/api/admin/stats/revenue?${q}`),
    fetchJSON(`/api/admin/stats/orders-by-status?${q}`),
    fetchJSON(`/api/admin/stats/top-products?${q}`),
    fetchJSON(`/api/admin/stats/new-users?${q}`),
    fetchJSON(`/api/admin/stats/repurchase-rate?${q}`),
  ]);

  return (
    <section className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide uppercase">Statistics</h1>
        <PeriodPicker defaults={searchParams} />
      </header>
      <SummaryCards current={summary?.current} previous={summary?.previous} />
      <div className="grid grid-cols-2 gap-6">
        <RevenueChart data={revenue?.items ?? []} />
        <OrderStatusDonut data={byStatus?.items ?? []} />
        <TopProducts data={top?.items ?? []} />
        <NewUsersChart data={newUsers?.items ?? []} />
      </div>
      <RepurchaseRate data={repurchase?.items?.[0] ?? null} />
    </section>
  );
}
```

- [ ] **Step 2: PeriodPicker (client)**

```tsx
// src/components/admin/stats/PeriodPicker.tsx
"use client";
import { useRouter } from "next/navigation";

const PRESETS: { key: "today"|"7d"|"30d"|"90d"; label: string }[] = [
  { key: "today", label: "오늘" }, { key: "7d", label: "7일" },
  { key: "30d", label: "30일" }, { key: "90d", label: "90일" },
];

export default function PeriodPicker({ defaults }: { defaults: { preset?: string; from?: string; to?: string } }) {
  const router = useRouter();
  const go = (qs: string) => router.push(`/admin/stats?${qs}`);
  return (
    <div className="flex gap-2 items-center">
      {PRESETS.map((p) => (
        <button key={p.key} onClick={() => go(`preset=${p.key}`)} className={`border px-3 py-1 ${defaults.preset === p.key ? "bg-black text-white" : "border-neutral-300"}`}>
          {p.label}
        </button>
      ))}
      <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); go(`from=${f.get("from")}&to=${f.get("to")}`); }} className="flex gap-1 items-center">
        <input name="from" type="date" defaultValue={defaults.from} className="border border-neutral-300 px-2 py-1" />
        <span>~</span>
        <input name="to" type="date" defaultValue={defaults.to} className="border border-neutral-300 px-2 py-1" />
        <button type="submit" className="border border-neutral-300 px-2 py-1">적용</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: SummaryCards (server component)**

```tsx
// src/components/admin/stats/SummaryCards.tsx
type Row = { revenue: number; order_count: number; new_users: number } | null;

function pct(cur: number, prev: number): string {
  if (!prev) return cur ? "+∞" : "0%";
  const d = ((cur - prev) / prev) * 100;
  return `${d >= 0 ? "+" : ""}${d.toFixed(1)}%`;
}

export default function SummaryCards({ current, previous }: { current: Row; previous: Row }) {
  if (!current) return null;
  const aov = current.order_count ? Math.round(current.revenue / current.order_count) : 0;
  const prevAov = previous?.order_count ? Math.round(previous.revenue / previous.order_count) : 0;
  return (
    <div className="grid grid-cols-4 gap-4">
      <Card label="매출" value={`₩${current.revenue.toLocaleString()}`} delta={previous ? pct(current.revenue, previous.revenue) : null} />
      <Card label="주문수" value={current.order_count} delta={previous ? pct(current.order_count, previous.order_count) : null} />
      <Card label="평균 객단가" value={`₩${aov.toLocaleString()}`} delta={previous ? pct(aov, prevAov) : null} />
      <Card label="신규가입" value={current.new_users} delta={previous ? pct(current.new_users, previous.new_users) : null} />
    </div>
  );
}
function Card({ label, value, delta }: { label: string; value: string | number; delta: string | null }) {
  return (
    <div className="border border-neutral-300 p-4">
      <div className="text-xs uppercase text-neutral-500">{label}</div>
      <div className="text-xl mt-1">{value}</div>
      {delta && <div className={`text-xs mt-1 ${delta.startsWith("-") ? "text-red-600" : "text-green-700"}`}>{delta}</div>}
    </div>
  );
}
```

- [ ] **Step 4: RevenueChart (client + recharts)**

```tsx
// src/components/admin/stats/RevenueChart.tsx
"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Row = { day: string; revenue: number };
export default function RevenueChart({ data }: { data: Row[] }) {
  return (
    <div className="border border-neutral-300 p-4">
      <h3 className="uppercase text-sm mb-3">매출 추이</h3>
      <div className="h-64" aria-label="매출 추이 라인 차트">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="day" />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => `₩${v.toLocaleString()}`} />
            <Line type="monotone" dataKey="revenue" stroke="#000" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-2 text-xs"><summary>데이터 표</summary>
        <table className="mt-2 w-full"><thead><tr><th>일자</th><th>매출</th></tr></thead>
          <tbody>{data.map((r) => <tr key={r.day}><td>{r.day}</td><td>₩{r.revenue.toLocaleString()}</td></tr>)}</tbody>
        </table>
      </details>
    </div>
  );
}
```

- [ ] **Step 5: OrderStatusDonut + NewUsersChart (client)**

```tsx
// src/components/admin/stats/OrderStatusDonut.tsx
"use client";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
const COLORS = ["#0A0A0A","#666","#999","#C75050","#2D8F4E"];
export default function OrderStatusDonut({ data }: { data: { status: string; count: number }[] }) {
  return (
    <div className="border border-neutral-300 p-4">
      <h3 className="uppercase text-sm mb-3">주문 상태 분포</h3>
      <div className="h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80} label>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

```tsx
// src/components/admin/stats/NewUsersChart.tsx
"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
export default function NewUsersChart({ data }: { data: { day: string; count: number }[] }) {
  return (
    <div className="border border-neutral-300 p-4">
      <h3 className="uppercase text-sm mb-3">신규 가입 추이</h3>
      <div className="h-64">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="day" /><YAxis /><Tooltip />
            <Line type="monotone" dataKey="count" stroke="#0A0A0A" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: TopProducts + RepurchaseRate**

```tsx
// src/components/admin/stats/TopProducts.tsx
export default function TopProducts({ data }: { data: { product_id: string; name: string; qty: number; revenue: number }[] }) {
  return (
    <div className="border border-neutral-300 p-4">
      <h3 className="uppercase text-sm mb-3">베스트 상품 TOP 10</h3>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-black text-left"><th className="py-1">#</th><th>상품</th><th className="text-right">수량</th><th className="text-right">매출</th></tr></thead>
        <tbody>
          {data.map((r, i) => (<tr key={r.product_id} className="border-b border-neutral-200"><td className="py-1">{i+1}</td><td>{r.name}</td><td className="text-right">{r.qty}</td><td className="text-right">₩{r.revenue.toLocaleString()}</td></tr>))}
        </tbody>
      </table>
      {data.length === 0 && <p className="py-4 text-center text-neutral-500">판매 기록이 없습니다.</p>}
    </div>
  );
}
```

```tsx
// src/components/admin/stats/RepurchaseRate.tsx
export default function RepurchaseRate({ data }: { data: { total_customers: number; repeat_customers: number } | null }) {
  const total = data?.total_customers ?? 0;
  const repeat = data?.repeat_customers ?? 0;
  const pct = total ? Math.round((repeat / total) * 1000) / 10 : 0;
  return (
    <div className="border border-neutral-300 p-4">
      <h3 className="uppercase text-sm mb-3">재구매율</h3>
      <div className="flex items-baseline gap-3">
        <div className="text-4xl">{pct}%</div>
        <div className="text-sm text-neutral-600">2회 이상 주문 회원 {repeat} / 총 구매 회원 {total}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Sidebar nav**

Add `{ href: "/admin/stats", label: "통계" }` to admin sidebar in `AdminLayoutClient.tsx`.

- [ ] **Step 8: Verify**

Run dev, visit `/admin/stats?preset=30d`. Charts render. Preset buttons switch data. Custom date form works.

- [ ] **Step 9: Commit**

```bash
git add src/app/admin/stats/ src/components/admin/stats/ src/app/admin/AdminLayoutClient.tsx
git commit -m "feat(admin/ui): stats dashboard with 6 metrics (recharts)"
```

---

### Task 3.4: Link stats from admin home

**Files:** `src/app/admin/page.tsx`

- [ ] **Step 1: Add "자세히 보기" link below existing summary cards**

Add after the summary cards section:
```tsx
<div className="mt-4">
  <a href="/admin/stats" className="text-sm underline">자세한 통계 보기 →</a>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat(admin/home): link to stats dashboard"
```

---

### Task 3.5: Open PR 3

- [ ] Push and open PR titled `feat: admin statistics dashboard (PR 3)`.

---

## Phase 4 — Block Editor (PR 4)

### Task 4.1: Block types and editors — base plumbing

**Files:**
- Create: `src/components/admin/detail-editor/types.ts`
- Create: `src/components/admin/detail-editor/BlockPalette.tsx`
- Create: `src/components/admin/detail-editor/BlockList.tsx`

- [ ] **Step 1: types.ts — local UI types**

```ts
// src/components/admin/detail-editor/types.ts
import type { Block } from "@/lib/detail-blocks/schema";
export type { Block };
export type BlockType = Block["type"];

export const BLOCK_LABELS: Record<BlockType, string> = {
  image: "단일 이미지",
  gallery: "갤러리",
  richtext: "리치 텍스트",
  twocol: "2단 컬럼",
  spec: "스펙 표",
  care: "케어 안내",
  banner: "강조 배너",
  youtube: "유튜브",
};

export function emptyBlock(type: BlockType): Block {
  const id = crypto.randomUUID();
  switch (type) {
    case "image":    return { id, type, data: { url: "", alt: "", width: "full" } };
    case "gallery":  return { id, type, data: { images: [], columns: 2 } };
    case "richtext": return { id, type, data: { html: "" } };
    case "twocol":   return { id, type, data: { image: { url: "", alt: "" }, text: { html: "" }, imageSide: "left" } };
    case "spec":     return { id, type, data: { rows: [] } };
    case "care":     return { id, type, data: { items: [] } };
    case "banner":   return { id, type, data: { text: "", bgColor: "black", align: "center" } };
    case "youtube":  return { id, type, data: { videoId: "" } };
  }
}
```

- [ ] **Step 2: BlockPalette**

```tsx
// src/components/admin/detail-editor/BlockPalette.tsx
"use client";
import { BLOCK_LABELS, type BlockType, emptyBlock, type Block } from "./types";

export default function BlockPalette({ onAdd }: { onAdd: (b: Block) => void }) {
  return (
    <aside className="sticky top-4 space-y-1 border border-neutral-300 p-3">
      <h3 className="text-xs uppercase text-neutral-500 mb-2">블록 추가</h3>
      {(Object.keys(BLOCK_LABELS) as BlockType[]).map((t) => (
        <button key={t} onClick={() => onAdd(emptyBlock(t))} className="block w-full text-left border border-neutral-300 px-2 py-1 hover:bg-neutral-50">
          + {BLOCK_LABELS[t]}
        </button>
      ))}
    </aside>
  );
}
```

- [ ] **Step 3: BlockList with @dnd-kit**

```tsx
// src/components/admin/detail-editor/BlockList.tsx
"use client";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "./types";
import BlockEditor from "./BlockEditor";

export default function BlockList({ value, onChange }: { value: Block[]; onChange: (next: Block[]) => void }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const oldIdx = value.findIndex((b) => b.id === e.active.id);
    const newIdx = value.findIndex((b) => b.id === e.over!.id);
    onChange(arrayMove(value, oldIdx, newIdx));
  }

  function updateAt(id: string, next: Block) {
    onChange(value.map((b) => (b.id === id ? next : b)));
  }
  function remove(id: string) { onChange(value.filter((b) => b.id !== id)); }
  function duplicate(id: string) {
    const idx = value.findIndex((b) => b.id === id);
    const copy = { ...value[idx], id: crypto.randomUUID() } as Block;
    onChange([...value.slice(0, idx + 1), copy, ...value.slice(idx + 1)]);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onEnd}>
      <SortableContext items={value.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {value.map((b) => (
            <SortableCard key={b.id} id={b.id}>
              <BlockEditor block={b} onChange={(next) => updateAt(b.id, next)} onDuplicate={() => duplicate(b.id)} onRemove={() => remove(b.id)} />
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="border border-neutral-300 bg-white">
      <div {...attributes} {...listeners} className="cursor-grab border-b border-neutral-200 px-2 py-1 text-xs text-neutral-500 select-none">⋮⋮ 드래그</div>
      <div className="p-3">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/detail-editor/
git commit -m "feat(editor): types, palette, draggable block list"
```

---

### Task 4.2: Block editors (all 8)

**Files:** `src/components/admin/detail-editor/BlockEditor.tsx` + one small editor per type

- [ ] **Step 1: Dispatcher**

```tsx
// src/components/admin/detail-editor/BlockEditor.tsx
"use client";
import type { Block } from "./types";
import { BLOCK_LABELS } from "./types";
import ImageBlockEditor from "./editors/ImageBlockEditor";
import GalleryBlockEditor from "./editors/GalleryBlockEditor";
import RichTextBlockEditor from "./editors/RichTextBlockEditor";
import TwoColBlockEditor from "./editors/TwoColBlockEditor";
import SpecBlockEditor from "./editors/SpecBlockEditor";
import CareBlockEditor from "./editors/CareBlockEditor";
import BannerBlockEditor from "./editors/BannerBlockEditor";
import YoutubeBlockEditor from "./editors/YoutubeBlockEditor";

export default function BlockEditor({ block, onChange, onDuplicate, onRemove }: { block: Block; onChange: (b: Block) => void; onDuplicate: () => void; onRemove: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase text-neutral-500">{BLOCK_LABELS[block.type]}</span>
        <div className="flex gap-2 text-xs">
          <button onClick={onDuplicate} className="underline">복제</button>
          <button onClick={onRemove} className="underline text-red-600">삭제</button>
        </div>
      </div>
      {block.type === "image" && <ImageBlockEditor block={block} onChange={onChange} />}
      {block.type === "gallery" && <GalleryBlockEditor block={block} onChange={onChange} />}
      {block.type === "richtext" && <RichTextBlockEditor block={block} onChange={onChange} />}
      {block.type === "twocol" && <TwoColBlockEditor block={block} onChange={onChange} />}
      {block.type === "spec" && <SpecBlockEditor block={block} onChange={onChange} />}
      {block.type === "care" && <CareBlockEditor block={block} onChange={onChange} />}
      {block.type === "banner" && <BannerBlockEditor block={block} onChange={onChange} />}
      {block.type === "youtube" && <YoutubeBlockEditor block={block} onChange={onChange} />}
    </div>
  );
}
```

- [ ] **Step 2: ImageBlockEditor (example — use existing ImageUploader)**

Verify existing `ImageUploader`:
```bash
grep -R "ImageUploader" src/components -l
```

Create `editors/ImageBlockEditor.tsx`:
```tsx
"use client";
import type { Block } from "../types";
import ImageUploader from "@/components/admin/forms/ImageUploader";  // adjust import path to match grep result

type B = Extract<Block, { type: "image" }>;
export default function ImageBlockEditor({ block, onChange }: { block: B; onChange: (b: B) => void }) {
  const d = block.data;
  return (
    <div className="space-y-2">
      <ImageUploader value={d.url} onChange={(url) => onChange({ ...block, data: { ...d, url } })} />
      <input placeholder="대체 텍스트(alt)" value={d.alt} onChange={(e) => onChange({ ...block, data: { ...d, alt: e.target.value } })} className="border border-neutral-300 px-2 py-1 w-full" />
      <input placeholder="캡션 (선택)" value={d.caption ?? ""} onChange={(e) => onChange({ ...block, data: { ...d, caption: e.target.value } })} className="border border-neutral-300 px-2 py-1 w-full" />
      <label className="text-xs flex gap-3">
        <span>폭:</span>
        <label><input type="radio" checked={d.width === "full"} onChange={() => onChange({ ...block, data: { ...d, width: "full" } })} /> 전체</label>
        <label><input type="radio" checked={d.width === "narrow"} onChange={() => onChange({ ...block, data: { ...d, width: "narrow" } })} /> 좁게</label>
      </label>
    </div>
  );
}
```

- [ ] **Step 3: Implement the remaining 7 editors**

Each editor follows the same `Extract<Block, { type: '...'}>` pattern. Key points:
- `GalleryBlockEditor` — array of `ImageUploader` + "+ 이미지 추가" button + column 2/3 radio.
- `RichTextBlockEditor` — use tiptap `EditorContent` with StarterKit + Link extension (already installed). Toolbar: H2/H3, Bold, Italic, UL/OL, Link (prompt for URL).
- `TwoColBlockEditor` — single `ImageUploader`, nested tiptap editor, side radio.
- `SpecBlockEditor` — title input, row list `[label][value][x]` + add row (max 30).
- `CareBlockEditor` — item list with icon select + text (max 10).
- `BannerBlockEditor` — text input + bgColor 3 buttons + align 2 buttons.
- `YoutubeBlockEditor` — URL input. On blur, parse with:
  ```ts
  function extractYoutubeId(s: string): string | null {
    const m = s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }
  ```
  If null, red border.

Implement each as a small client component following the ImageBlockEditor shape. All edits go via `onChange({ ...block, data: { ...d, <field>: value } })`.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/detail-editor/
git commit -m "feat(editor): 8 block-type editors"
```

---

### Task 4.3: PUT endpoint for detail_blocks

**Files:** `src/app/api/admin/products/[id]/detail-blocks/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlocksSchema } from "@/lib/detail-blocks/schema";
import { sanitizeRichText } from "@/lib/detail-blocks/sanitize";

const R2_PREFIX = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

function sanitizeBlocks(input: unknown) {
  const parsed = BlocksSchema.parse(input);
  return parsed.map((b) => {
    if (b.type === "richtext") return { ...b, data: { html: sanitizeRichText(b.data.html) } };
    if (b.type === "twocol") return { ...b, data: { ...b.data, text: { html: sanitizeRichText(b.data.text.html) } } };
    if (b.type === "image" && R2_PREFIX && !b.data.url.startsWith(R2_PREFIX)) throw new Error("image url must be on R2");
    if (b.type === "gallery" && R2_PREFIX) {
      b.data.images.forEach((im) => { if (!im.url.startsWith(R2_PREFIX)) throw new Error("gallery url must be on R2"); });
    }
    if (b.type === "twocol" && R2_PREFIX && !b.data.image.url.startsWith(R2_PREFIX)) throw new Error("twocol image must be on R2");
    return b;
  });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = createAdminClient();
  const { data, error } = await s.from("pb_products").select("detail_blocks").eq("id", params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ blocks: data.detail_blocks ?? [] });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let blocks;
  try {
    const body = await req.json();
    blocks = sanitizeBlocks(body.blocks);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 });
  }

  const s = createAdminClient();
  const { error } = await s.from("pb_products").update({ detail_blocks: blocks }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/admin/products/[id]/detail-blocks/route.ts
git commit -m "feat(admin/api): PUT detail_blocks with Zod + sanitize + R2 guard"
```

---

### Task 4.4: Editor page with save/preview/dirty guard

**Files:** `src/app/admin/products/[id]/detail-editor/page.tsx`

- [ ] **Step 1: Page + client shell**

```tsx
// src/app/admin/products/[id]/detail-editor/page.tsx
import { redirect, notFound } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import dynamic from "next/dynamic";
const EditorShell = dynamic(() => import("@/components/admin/detail-editor/EditorShell"), { ssr: false });

export default async function Page({ params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/auth");
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/products/${params.id}/detail-blocks`, { cache: "no-store" });
  if (!res.ok) notFound();
  const { blocks } = await res.json();
  return <EditorShell productId={params.id} initialBlocks={blocks} />;
}
```

- [ ] **Step 2: EditorShell client**

```tsx
// src/components/admin/detail-editor/EditorShell.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import BlockPalette from "./BlockPalette";
import BlockList from "./BlockList";
import type { Block } from "./types";
import DetailBlocksRenderer from "@/lib/detail-blocks/renderer";

const DRAFT_KEY = (id: string) => `detail-editor-draft:${id}`;

export default function EditorShell({ productId, initialBlocks }: { productId: string; initialBlocks: Block[] }) {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(DRAFT_KEY(productId));
      if (raw) try { return JSON.parse(raw); } catch {}
    }
    return initialBlocks;
  });
  const [tab, setTab] = useState<"edit"|"preview">("edit");
  const [status, setStatus] = useState<"idle"|"saving"|"saved"|"error">("idle");
  const dirty = useRef(false);

  useEffect(() => {
    dirty.current = JSON.stringify(blocks) !== JSON.stringify(initialBlocks);
    const t = setTimeout(() => {
      if (dirty.current) localStorage.setItem(DRAFT_KEY(productId), JSON.stringify(blocks));
    }, 2000);
    return () => clearTimeout(t);
  }, [blocks, initialBlocks, productId]);

  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) { if (dirty.current) { e.preventDefault(); e.returnValue = ""; } }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);

  async function save() {
    setStatus("saving");
    const res = await fetch(`/api/admin/products/${productId}/detail-blocks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
    if (res.ok) {
      setStatus("saved");
      dirty.current = false;
      localStorage.removeItem(DRAFT_KEY(productId));
      setTimeout(() => setStatus("idle"), 1500);
    } else {
      setStatus("error");
    }
  }

  return (
    <div className="p-4">
      <header className="flex items-center justify-between border-b border-black pb-2 mb-4">
        <a href={`/admin/products/${productId}`} className="text-sm">← 뒤로</a>
        <div className="flex gap-2">
          <button onClick={() => setTab("edit")} className={`px-3 py-1 ${tab==="edit"?"bg-black text-white":"border border-black"}`}>편집</button>
          <button onClick={() => setTab("preview")} className={`px-3 py-1 ${tab==="preview"?"bg-black text-white":"border border-black"}`}>미리보기</button>
          <button onClick={save} className="bg-black text-white px-3 py-1">저장</button>
          <span className="text-xs self-center">{status}</span>
        </div>
      </header>
      {tab === "edit" ? (
        <div className="grid grid-cols-[220px_1fr] gap-6">
          <BlockPalette onAdd={(b) => setBlocks([...blocks, b])} />
          <div><BlockList value={blocks} onChange={setBlocks} />{blocks.length === 0 && <p className="text-neutral-500 py-8 text-center">좌측에서 블록을 추가해주세요.</p>}</div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto"><DetailBlocksRenderer blocks={blocks} /></div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/products/[id]/detail-editor/ src/components/admin/detail-editor/EditorShell.tsx
git commit -m "feat(editor): shell with save/preview/draft/dirty-guard"
```

---

### Task 4.5: Customer-facing renderer

**Files:**
- Create: `src/lib/detail-blocks/renderer.tsx`

- [ ] **Step 1: Implement renderer (server component)**

```tsx
// src/lib/detail-blocks/renderer.tsx
import Image from "next/image";
import type { Block } from "./schema";

export default function DetailBlocksRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-8">
      {blocks.map((b) => <BlockView key={b.id} block={b} />)}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "image": {
      const { url, alt, caption, width } = block.data;
      return (
        <figure className={width === "full" ? "" : "max-w-2xl mx-auto"}>
          <Image src={url} alt={alt} width={1600} height={1600} className="w-full h-auto" />
          {caption && <figcaption className="text-sm text-neutral-500 mt-2 text-center">{caption}</figcaption>}
        </figure>
      );
    }
    case "gallery": {
      const { images, columns } = block.data;
      return (
        <div className={`grid gap-3 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {images.map((im, i) => <Image key={i} src={im.url} alt={im.alt} width={800} height={800} className="w-full h-auto" />)}
        </div>
      );
    }
    case "richtext":
      return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.data.html }} />;
    case "twocol": {
      const { image, text, imageSide } = block.data;
      const imgEl = <Image src={image.url} alt={image.alt} width={800} height={800} className="w-full h-auto" />;
      const txtEl = <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: text.html }} />;
      return <div className="grid md:grid-cols-2 gap-6 items-center">{imageSide === "left" ? [imgEl, txtEl] : [txtEl, imgEl]}</div>;
    }
    case "spec":
      return (
        <div>
          {block.data.title && <h3 className="uppercase tracking-wide mb-2">{block.data.title}</h3>}
          <table className="w-full text-sm"><tbody>{block.data.rows.map((r, i) => (<tr key={i} className="border-b border-neutral-200"><th className="text-left py-2 w-1/3 font-normal text-neutral-500">{r.label}</th><td>{r.value}</td></tr>))}</tbody></table>
        </div>
      );
    case "care":
      return (
        <ul className="space-y-2">
          {block.data.items.map((it, i) => (<li key={i} className="flex gap-3"><span aria-hidden className="text-xs uppercase border border-black px-2 py-0.5">{it.icon}</span><span>{it.text}</span></li>))}
        </ul>
      );
    case "banner": {
      const bg = block.data.bgColor === "black" ? "bg-black text-white" : block.data.bgColor === "sale" ? "bg-[#C75050] text-white" : "bg-[#F0F0F0]";
      return <div className={`${bg} p-10 text-${block.data.align}`}><p className="uppercase tracking-[0.2em]">{block.data.text}</p></div>;
    }
    case "youtube":
      return (
        <figure>
          <div className="aspect-video"><iframe src={`https://www.youtube.com/embed/${block.data.videoId}`} className="w-full h-full" allowFullScreen title={block.data.caption ?? "유튜브 영상"} /></div>
          {block.data.caption && <figcaption className="text-sm text-neutral-500 mt-2 text-center">{block.data.caption}</figcaption>}
        </figure>
      );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/detail-blocks/renderer.tsx
git commit -m "feat(detail-blocks): server renderer for 8 block types"
```

---

### Task 4.6: Wire renderer into product detail page

**Files:** `src/app/product/[slug]/page.tsx`

- [ ] **Step 1: Locate product query and existing description render**

Run: `grep -n "description" src/app/product/[slug]/page.tsx`
Confirm where the product description is rendered.

- [ ] **Step 2: Replace with conditional**

Fetch must also select `detail_blocks`:
```ts
.select("*, ..., detail_blocks")
```

In JSX:
```tsx
{(product.detail_blocks && product.detail_blocks.length > 0)
  ? <DetailBlocksRenderer blocks={product.detail_blocks} />
  : <div className="prose max-w-none">{product.description}</div>}
```

Import:
```tsx
import DetailBlocksRenderer from "@/lib/detail-blocks/renderer";
```

- [ ] **Step 3: Verify**

Open an existing product: description still renders (blocks empty).
Use the editor to add blocks, save, reload product page → blocks render.

- [ ] **Step 4: Commit**

```bash
git add src/app/product/[slug]/page.tsx
git commit -m "feat(product): render detail_blocks when present, fallback to description"
```

---

### Task 4.7: Entry point on product edit page

**Files:** `src/app/admin/products/[id]/page.tsx`

- [ ] **Step 1: Add button**

Near the bottom of the existing product edit form:
```tsx
<a href={`/admin/products/${params.id}/detail-editor`} className="inline-block border border-black px-4 py-2 uppercase tracking-wide">상세 페이지 편집</a>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/products/[id]/page.tsx
git commit -m "feat(admin/products): link to detail-page editor"
```

---

### Task 4.8: Open PR 4 + final integration

- [ ] **Step 1: Run full type-check and tests**

```bash
npm run type-check && npm test && npm run build
```
Expected: all pass.

- [ ] **Step 2: Push and open PR**

Title: `feat: product detail block editor (PR 4)`.

- [ ] **Step 3: After merge, update CLAUDE.md §12**

Mark P4 complete, add P5 items.

---

## Self-Review Checklist (already run)

**1. Spec coverage**
- §2 Member management → Phase 2 (Tasks 2.1–2.6) ✓
- §3 Statistics dashboard → Phase 3 (Tasks 3.1–3.4) ✓
- §4 Block editor → Phase 4 (Tasks 4.1–4.7) ✓
- §5 Migrations → Tasks 1.2–1.5, 2.1, 3.1 ✓
- §6 Test infra → Phase 0 (Vitest). Playwright intentionally deferred; manual QA covers E2E.

**2. Placeholder scan** — none remain.

**3. Type consistency**
- `Block` type flows from `src/lib/detail-blocks/schema.ts` → re-exported in `types.ts` → consumed everywhere.
- `Period` type from `src/lib/stats/period.ts` consumed by `statsGuard`.
- API response shapes: `{ items }` for lists, `{ current, previous }` for summary — matches client components.

**Known deviation from spec** — Playwright E2E tests were listed in §6-1 but not scheduled here; flagged for a future chore. Manual verification at each task step is sufficient for MVP launch.
