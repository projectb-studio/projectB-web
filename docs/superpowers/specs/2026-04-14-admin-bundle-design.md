# Admin Bundle — 설계 문서

- 작성일: 2026-04-14
- 범위: (1) 관리자 회원 관리, (2) 관리자 통계 대시보드, (3) 상품 상세페이지 블록형 CMS 편집기
- 전제: 기존 관리자 대시보드(P4), `pb_` 테이블 13종, Supabase Auth, tiptap 의존성 이미 존재
- 다음 세션 범위(별도 스펙): 소셜 로그인(Kakao/Naver/Google/Apple), 카카오 알림톡

---

## 0. 의사결정 요약 (브레인스토밍 결과)

- 런칭 전 필수: 소셜 로그인, 상세 CMS 편집기, 카카오 알림톡, 통계, 회원 관리
- 오픈 후로 미룸: SEO/GA4, 쿠폰/이벤트
- 이번 세션은 "관리자 묶음 3개"로 좁힘 (안 C)
- 다음 세션은 "외부 의존성 묶음 2개" (소셜 + 알림톡)
- 회원 관리: 조회/검색·상세/주문이력·메모·등급·차단·CSV 모두 포함
- 통계 대시보드: 매출 요약, 매출 추이, 주문 상태 분포, 베스트 TOP10, 신규가입 추이, 재구매율 (트래픽은 제외)
- 상세 편집기: 블록형 (드래그 재정렬 + 8개 블록 타입)
- 블록 8종: 단일 이미지, 이미지 갤러리, 리치 텍스트, 2단 컬럼, 스펙 표, 케어 안내, 강조 배너, 유튜브 임베드

---

## 1. 전체 아키텍처 & 공통 구조

### 기술 스택
- Next.js 14 App Router Server Components (기존 유지)
- Supabase Server/Browser 클라이언트 분리 (기존 유지)
- `/admin` 미들웨어 보호 (기존 유지)
- tiptap (리치 텍스트 블록에서 재활용)
- **신규 의존성**: `recharts` (차트, Next.js SSR 호환)

### 폴더 구조 추가분

```
src/app/admin/
├── members/                   # NEW
│   ├── page.tsx
│   └── [id]/page.tsx
├── stats/                     # NEW
│   └── page.tsx
└── products/[id]/detail-editor/   # NEW
    └── page.tsx

src/components/admin/
├── members/                   # MemberTable, MemberDetail, ExportCsvButton
├── stats/                     # RevenueChart, OrderStatusDonut, TopProducts, ...
└── detail-editor/             # BlockList, BlockRenderer, Block별 Editor

src/lib/
├── csv.ts                     # RFC 4180 이스케이프
└── detail-blocks/
    ├── schema.ts              # Zod 스키마 per 블록
    └── renderer.tsx           # 고객향 상세 페이지 렌더러
```

### API 라우트 추가분

```
/api/admin/members              GET (list)
/api/admin/members/[id]         GET / PATCH
/api/admin/members/export       GET (CSV)
/api/admin/stats/summary        GET
/api/admin/stats/revenue        GET
/api/admin/stats/orders-by-status   GET
/api/admin/stats/top-products   GET
/api/admin/stats/new-users      GET
/api/admin/stats/repurchase-rate    GET
/api/admin/products/[id]/detail-blocks  GET / PUT
```

### DB 변경 요약
- `pb_users` 확장: `admin_memo TEXT`, `grade TEXT DEFAULT 'normal'`, `is_blocked BOOLEAN DEFAULT false`
- `pb_products` 확장: `detail_blocks JSONB DEFAULT '[]'::jsonb`
- 신규 테이블 없음 (통계는 기존 테이블 집계)

### 인증·권한
- 모든 `/api/admin/*` 라우트는 기존 `getAdminUser()` 헬퍼로 보호
- 회원 차단은 플래그만 토글. 로그인 거부는 Supabase Auth 콜백/서버 액션에 `is_blocked` 체크 삽입
- 주문 데이터 보존 위해 사용자 레코드 `DELETE` 금지 (soft block only)

---

## 2. 관리자 회원 관리

### 2-1. 목록 페이지 `/admin/members`

**레이아웃**
- 상단 필터 바: 검색 인풋(이름/이메일/전화), 등급 셀렉트(전체/일반/VIP), 차단 상태 토글(전체/활성/차단), CSV 내보내기 버튼
- 테이블 컬럼: 이름 · 이메일 · 전화 · 등급 · 가입일 · 최근 주문일 · 총 구매금액 · 주문수 · 상태 · 액션
- 정렬: 가입일·최근 주문일·총 구매금액 기준 토글 (URL 쿼리 동기화)
- 페이지네이션: 20/페이지, 5페이지 그룹 단위 (카트 페이지와 동일 컨벤션)
- 행 클릭 → 상세 페이지 이동

**서버 집계 쿼리**
```sql
SELECT
  u.id, u.name, u.email, u.phone, u.grade, u.is_blocked,
  u.created_at AS joined_at,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(o.total_amount) FILTER (WHERE o.status IN ('paid','shipped','delivered')), 0) AS total_spent,
  MAX(o.created_at) AS last_order_at
FROM pb_users u
LEFT JOIN pb_orders o ON o.user_id = u.id
WHERE (:search IS NULL OR u.name ILIKE :search OR u.email ILIKE :search OR u.phone ILIKE :search)
  AND (:grade IS NULL OR u.grade = :grade)
  AND (:blocked IS NULL OR u.is_blocked = :blocked)
GROUP BY u.id
ORDER BY <dynamic>
LIMIT 20 OFFSET :offset;
```
취소/환불 주문은 `total_spent`에서 제외. `last_order_at`은 모든 주문 기준.

### 2-2. 상세 페이지 `/admin/members/[id]`

**구성**
1. 프로필 카드 — 이름·이메일·전화·가입일·등급·차단 상태, "등급 변경" 셀렉트, "차단/해제" 토글
2. 관리 메모 — `textarea` + blur 또는 300ms debounce 자동 저장 + 인디케이터
3. 주문 이력 테이블 — 주문번호 · 일시 · 금액 · 상태 · 상세보기. 최근 20건 + "더보기" 페이지네이션
4. 요약 통계 카드 — 총 주문수, 총 구매금액, 평균 객단가, 최근 주문일, 리뷰 작성 수

**인라인 편집**
- 등급 셀렉트 변경 / 차단 토글 → 즉시 `PATCH /api/admin/members/[id]` → 토스트 "저장됨"
- 메모는 debounce 저장

### 2-3. CSV 내보내기

- 엔드포인트: `GET /api/admin/members/export?search=&grade=&blocked=`
- 컬럼: `id,name,email,phone,grade,is_blocked,joined_at,order_count,total_spent,last_order_at,admin_memo`
- 문자셋: UTF-8 BOM 포함 (엑셀 한글 깨짐 방지)
- 구현: `src/lib/csv.ts`에 RFC 4180 이스케이프 헬퍼. 외부 라이브러리 없음
- 50명 규모이므로 메모리 빌드 + Blob 응답. 스트리밍은 YAGNI

### 2-4. 차단 동작

- `pb_users.is_blocked = true` 플래그 + 로그인 시 서버 가드
- `src/lib/auth/require-active-user.ts` 신규 — 로그인 콜백·체크아웃 진입·마이페이지 접근 시 호출
- 차단 사용자: "관리자에게 문의 바랍니다" 메시지 후 sign-out
- 세션 토큰 리프레시 시점 반영 → 최대 1시간 지연 가능 (수용)

### 2-5. 엣지 케이스

| 케이스 | 처리 |
|---|---|
| 비회원 주문자 (게스트) | 목록 제외. 주문 관리에서 별도 섹션 (기존 유지) |
| 소셜 로그인 사용자 (다음 세션) | 동일 `pb_users` 조회 — 스키마 변경 없음 |
| 차단 직후 이미 로그인된 세션 | 토큰 리프레시 시점 반영 (최대 1시간 지연) |
| 메모 5KB 초과 | 서버에서 거절 (422). UI에 남은 글자수·경고 |

## 3. 관리자 통계 대시보드 `/admin/stats`

### 3-1. 레이아웃

```
[기간 선택: 오늘 | 7일 | 30일 | 90일 | 커스텀]
────────────────────────────────────────────
요약 카드 4개: 매출 · 주문수 · 평균객단가 · 신규가입 (전기 대비 증감)
────────────────────────────────────────────
매출 추이 (라인)          |  주문 상태 분포 (도넛)
베스트 상품 TOP 10 (표)   |  신규 가입 추이 (라인)
재구매율 (도넛 + 설명)
```

### 3-2. 지표 정의 & 집계

| 지표 | 정의 | 집계 핵심 |
|---|---|---|
| 매출 | 기간 내 `status IN ('paid','shipped','delivered')` 의 `total_amount` 합 | `SUM(total_amount)` + 상태 필터 |
| 주문 수 | 위와 동일 필터의 `COUNT(*)` | 동일 |
| 평균 객단가 | 매출 / 주문 수 (0-나눗셈 가드) | 클라이언트 계산 |
| 신규 가입 | 기간 내 `pb_users.created_at` 카운트 | `COUNT(*)` |
| 전기 대비 증감 | 직전 동일 기간 대비 % | 동일 쿼리 재실행 |
| 매출 추이 | 일별 매출 배열 | `date_trunc('day', created_at)` GROUP BY |
| 주문 상태 분포 | status별 count | `GROUP BY status` |
| TOP 10 상품 | 상품별 판매수량·매출 | `pb_order_items JOIN pb_products GROUP BY product_id LIMIT 10` |
| 신규 가입 추이 | 일별 신규 가입 | `date_trunc('day', created_at)` |
| 재구매율 | 2회 이상 주문 회원 / 전체 주문 경험 회원 | 서브쿼리 + `HAVING COUNT >= 2` |

취소/환불(`cancelled`, `refunded`)은 **매출·매출추이·객단가·TOP10·재구매율**에서 제외. 주문 상태 분포에는 포함(도넛 슬라이스로 표시).

### 3-3. 기간 선택 UX

- 프리셋 4개(오늘/7일/30일/90일) + 커스텀 date range (네이티브 `<input type="date">` 2개)
- URL 쿼리 동기화: `?from=YYYY-MM-DD&to=YYYY-MM-DD`
- 전기 대비: 같은 길이의 직전 구간 자동 계산

### 3-4. 차트 구현

- 신규 의존성: `recharts` (SSR 호환, ~80KB gzipped)
- 차트 컴포넌트는 `"use client"`. 데이터는 Server Component에서 fetch 후 props 전달
- 접근성: `aria-label` + `<details>` 폴백 요약 테이블
- 빈 상태: 0건 시 "해당 기간에 주문이 없습니다" 일러스트

### 3-5. 캐싱·성능

- `/api/admin/stats/*` 는 `revalidate = 60` + `Cache-Control: private, max-age=60`
- 재구매율은 5분 캐시
- 필요 인덱스: `pb_orders.created_at`, `pb_order_items.product_id`. 없으면 마이그레이션에 추가
- 타임존: 모든 `date_trunc`는 `AT TIME ZONE 'Asia/Seoul'`

### 3-6. 관리자 홈과의 관계

- 기존 `/admin` 홈 통계 카드는 오늘 매출·주문수·신규가입 최소 요약 유지
- "자세히 보기" 링크 → `/admin/stats`
- 두 곳이 `/api/admin/stats/summary`를 공유해 중복 쿼리 제거

### 3-7. 엣지 케이스

| 케이스 | 처리 |
|---|---|
| 주문 0건 (초기) | 0% 표시 + "곧 첫 주문을 기다려요" |
| `to < from` | 서버 검증 + 토스트 경고 |
| 집계 느려지는 시점 | TOP10·재구매율만 materialized view 고려 (지금은 YAGNI) |

## 4. 상품 상세페이지 블록형 CMS 편집기

### 4-1. 진입 동선

- `/admin/products/[id]` 수정 폼 하단에 "상세 페이지 편집" 버튼
- 클릭 → `/admin/products/[id]/detail-editor` (전체 화면 편집기)
- 상단 탭: **편집 / 미리보기** (미리보기는 고객향 렌더러 재사용)

### 4-2. 편집기 레이아웃

```
[← 뒤로]  <상품명>    [저장] [미리보기]
좌측 팔레트(블록 추가, sticky) | 중앙 캔버스(블록 리스트)
각 블록 카드: [⋮ 위/아래/복제/삭제] + 인라인 편집 폼
드래그 재정렬: @dnd-kit/sortable
```

### 4-3. 블록 데이터 모델 (8종)

저장 형태: `detail_blocks: JSONB` 배열. 각 원소 `{ id: uuid, type, data }`.

```ts
type Block =
  | { id; type: 'image';     data: { url; alt; caption?; width: 'full'|'narrow' } }
  | { id; type: 'gallery';   data: { images: {url,alt}[]; columns: 2|3 } }
  | { id; type: 'richtext';  data: { html } }
  | { id; type: 'twocol';    data: { image:{url,alt}; text:{html}; imageSide:'left'|'right' } }
  | { id; type: 'spec';      data: { title?; rows: {label, value}[] } }
  | { id; type: 'care';      data: { items: {icon:'wash'|'dry'|'iron'|'bleach'|'custom'; text}[] } }
  | { id; type: 'banner';    data: { text; bgColor:'black'|'offwhite'|'sale'; align:'left'|'center' } }
  | { id; type: 'youtube';   data: { videoId; caption? } };
```

- Zod 스키마로 타입별 검증 (`src/lib/detail-blocks/schema.ts`)
- 알 수 없는 `type`은 렌더러에서 무시 (전방호환)

### 4-4. 블록별 에디터 UI

| 블록 | 에디터 UI |
|---|---|
| 단일 이미지 | `ImageUploader`(R2) + alt + 캡션 + 폭 토글 |
| 갤러리 | 멀티 업로드 + 내부 정렬 + 2/3 컬럼 셀렉트 |
| 리치텍스트 | tiptap 툴바(H2/H3, Bold, Italic, List, Link) — 매거진 에디터 재활용 |
| 2단 컬럼 | 이미지 + 리치텍스트 + 이미지 좌/우 토글 |
| 스펙 표 | 제목 옵션 + `[label][value][삭제]` 반복 + 행 추가 |
| 케어 안내 | 아이콘 셀렉트 + 설명 반복 |
| 강조 배너 | 텍스트 + 배경색 3개 토글 + 정렬 토글 |
| 유튜브 | URL 인풋 → `videoId` 추출 + 캡션 |

### 4-5. 저장·미리보기·취소

- 저장: `PUT /api/admin/products/[id]/detail-blocks` (전체 배열 교체)
- 자동 저장: 변경 후 2초 debounce로 localStorage 초안 저장 (복구용). DB 자동저장은 안 함
- dirty 가드: 변경 중 이탈 시 `beforeunload` 경고
- 미리보기 탭: 현재 편집 중 배열을 고객향 `<DetailBlocksRenderer>`에 그대로 전달

### 4-6. 고객향 렌더러 `src/lib/detail-blocks/renderer.tsx`

- `/product/[slug]`에서 `detail_blocks`가 비어있으면 기존 `description` 폴백
- 비어있지 않으면 블록 순회 렌더
- Server Component. Next `<Image>` 사용 (R2 도메인은 `next.config.mjs`에 등록됨 전제)
- 리치텍스트는 서버에서 DOMPurify sanitize

### 4-7. 보안·검증

| 항목 | 처리 |
|---|---|
| 리치텍스트 XSS | 저장 시 서버 DOMPurify. allowlist: `h2,h3,p,strong,em,ul,ol,li,a[href],br` |
| 이미지 URL | `NEXT_PUBLIC_R2_PUBLIC_URL` prefix 검증. 외부 URL 거부 |
| 유튜브 videoId | `^[a-zA-Z0-9_-]{11}$` |
| payload 크기 | 서버 1MB 상한. 초과 시 413 |
| 동시 편집 | Last Write Wins (1인 관리자 전제) |

### 4-8. 마이그레이션·하위호환

- 기존 상품은 `detail_blocks = []`로 초기화 → 렌더러가 기존 `description` 폴백
- 관리자가 저장하면 블록으로 전환
- `description`은 SEO/요약용으로 유지 (제거 금지)

### 4-9. 엣지 케이스

| 케이스 | 처리 |
|---|---|
| 블록 50개 초과 | 서버 거절 + UI 경고 |
| 업로드 중 이탈 | `beforeunload` 경고 |
| 유튜브 URL 파싱 실패 | 인풋 빨간 테두리 |
| alt 미입력 | 접근성 경고 (차단 X) |

### 4-10. 신규 의존성

- `@dnd-kit/core`, `@dnd-kit/sortable`
- `isomorphic-dompurify`
- `recharts` (섹션 3)

## 5. 데이터 모델 & 마이그레이션

### 5-1. `pb_users` 확장

```sql
-- supabase/migration-p5-1-users.sql
ALTER TABLE pb_users
  ADD COLUMN IF NOT EXISTS admin_memo TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS grade TEXT NOT NULL DEFAULT 'normal'
    CHECK (grade IN ('normal', 'vip')),
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE pb_users
  ADD CONSTRAINT pb_users_admin_memo_len_chk
  CHECK (char_length(admin_memo) <= 5000);

CREATE INDEX IF NOT EXISTS pb_users_blocked_idx
  ON pb_users (is_blocked) WHERE is_blocked = TRUE;

CREATE INDEX IF NOT EXISTS pb_users_created_at_idx ON pb_users (created_at DESC);
```

### 5-2. `pb_products` 확장

```sql
-- supabase/migration-p5-2-products.sql
ALTER TABLE pb_products
  ADD COLUMN IF NOT EXISTS detail_blocks JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE pb_products
  ADD CONSTRAINT pb_products_detail_blocks_size_chk
  CHECK (pg_column_size(detail_blocks) <= 1048576);

ALTER TABLE pb_products
  ADD CONSTRAINT pb_products_detail_blocks_array_chk
  CHECK (jsonb_typeof(detail_blocks) = 'array');
```

### 5-3. 통계용 인덱스

```sql
-- supabase/migration-p5-3-stats-indexes.sql
CREATE INDEX IF NOT EXISTS pb_orders_created_status_idx
  ON pb_orders (created_at DESC, status);

CREATE INDEX IF NOT EXISTS pb_order_items_product_id_idx
  ON pb_order_items (product_id);
```

### 5-4. RLS 정책

- 기존 P4 RLS 분기 그대로 유지
- 관리용 컬럼(`admin_memo`, `grade`, `is_blocked`) 고객 노출 방지는 **클라이언트 쿼리 SELECT 명시** 방식
  (뷰 전환 시 프론트 쿼리 변경폭이 커서 YAGNI)
- 관리자 API는 Server Supabase 클라이언트 + `getAdminUser()` 가드로 별도 보호

### 5-5. 타입 갱신

- `supabase gen types` 재실행 → `src/types/database.ts` 갱신
- 블록 유니온은 `src/lib/detail-blocks/schema.ts`의 Zod에서 `z.infer` 로 파생

### 5-6. 시드·샘플

- `supabase/seed-detail-blocks.sql` — 샘플 상품 1개에 블록 8종 예시 채움 (개발 편의)
- 기존 회원: `grade = 'normal'`, `is_blocked = FALSE` 로 DEFAULT 자동 적용

### 5-7. 실행 순서

1. `migration-p5-1-users.sql`
2. `migration-p5-2-products.sql`
3. `migration-p5-3-stats-indexes.sql`
4. `supabase gen types`
5. 코드 배포
6. (선택) `seed-detail-blocks.sql`

### 5-8. 롤백

- 모든 마이그레이션 idempotent (`IF NOT EXISTS`)
- 롤백 스크립트 `migration-p5-down.sql` 동시 작성
- 스테이징 dry-run 후 프로덕션 적용

## 6. 테스트 & 롤아웃

### 6-1. 테스트 전략

**단위 테스트 (Vitest)**
- `src/lib/csv.ts` — 따옴표/쉼표/줄바꿈 이스케이프, UTF-8 BOM
- `src/lib/detail-blocks/schema.ts` — 블록 8종 Zod 검증 (valid/invalid)
- `src/lib/auth/require-active-user.ts` — 차단/비차단 분기
- 통계 집계 함수 — 0건/기간 경계/취소 주문 제외

**통합 테스트 (Playwright, 핵심 플로우)**
- 회원 관리: 검색 → 상세 → 메모 저장 → 차단 토글
- 차단된 계정 로그인 거부
- CSV 다운로드 헤더·BOM·컬럼 검증
- 통계 프리셋 → URL 쿼리 반영 → 차트 렌더
- 블록 8종 추가 → 저장 → `/product/[slug]` 렌더 확인

**수동 QA (대표님 인수 직전)**
- 모바일 320/768/1024 해상도
- 차트 접근성 (탭 포커스·요약)
- 편집기 드래그·복제·삭제
- Excel에서 CSV 한글 정상 표시

### 6-2. 성능·접근성 기준

- Lighthouse 관리자 Perf ≥ 80 (내부용 완화)
- 편집기 번들은 `next/dynamic`으로 lazy 로드 → 공개 페이지 번들 영향 0 확인
- 상세 렌더러는 Server Component 유지 → LCP 영향 없음
- 기존 테마 토큰 재사용 (대비 OK)

### 6-3. 롤아웃 단계

1. 단일 피처 브랜치 `feature/admin-bundle`
2. 순차 PR
   - PR 1: 마이그레이션 + 타입 + 공통 유틸
   - PR 2: 회원 관리
   - PR 3: 통계 대시보드
   - PR 4: 블록 편집기
3. Vercel Preview로 스테이징 검증
4. 프로덕션 배포 + 대표님 인수 세션 30분

### 6-4. 문서·가이드

- `docs/guides/admin-member-guide.md` — 회원 관리 사용법 (스크린샷)
- `docs/guides/admin-detail-editor-guide.md` — 블록 편집기 사용법
- `CLAUDE.md` §12 업데이트 (P4 완료 → P5 체크리스트)

### 6-5. 실패 복구

| 상황 | 대응 |
|---|---|
| 마이그레이션 오류 | `migration-p5-down.sql` 롤백 |
| 편집기 저장 실패 | localStorage 초안 복구 + 토스트 안내 |
| 정상 회원 오차단 | `UPDATE pb_users SET is_blocked=false` SQL 가이드 문서화 |
| 통계 쿼리 성능 저하 | 인덱스 확인 → materialized view (P6 범위) |

### 6-6. 성공 기준

- [ ] 대표님이 매뉴얼 없이 회원 목록 → 상세 → 등급 변경
- [ ] 상세 페이지 3개 이상 블록 편집으로 완성
- [ ] 통계 대시보드에서 "이번 달 매출"을 30초 내 확인
- [ ] Excel에서 CSV 한글·컬럼 정렬 정상
- [ ] 차단 계정 로그인 시 차단 메시지 후 sign-out

---

## 부록 A. 다음 세션 범위 (외부 의존성 묶음)

이번 스펙에서 제외된 5개 필수 기능 중 남은 2개:
1. 소셜 로그인 (Kakao / Naver / Google / Apple)
   - Supabase Auth provider 설정 + 각 플랫폼 앱 등록
   - 기존 `pb_users` 그대로 사용 (스키마 변경 없음)
   - 차단 로직(`is_blocked`)은 본 스펙에서 이미 준비됨
2. 카카오 알림톡
   - 솔라피/비즈톡/카카오 공식 중 선택 (대표님 결정 필요)
   - 트리거: 신규 주문, 결제완료, 배송 시작, 배송 완료
   - 템플릿 심사 리드타임 주의

## 부록 B. 오픈 후로 미뤄진 항목 (P6)

- SEO 메타 + `sitemap.ts` 보강 + `robots.ts` 실환경 검증
- GA4 / GTM 연동
- 쿠폰·이벤트 발급, 포인트/적립금
- 상품 옵션 (색상·사이즈), 위시하트, 재입고 알림
