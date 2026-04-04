# P3-2: Magazine (블로그) 디자인 스펙

> 날짜: 2026-04-04
> 범위: 매거진 프론트엔드 (목록 DB 전환 + 상세 페이지) + 어드민 CRUD + 카테고리 관리

---

## 1. 프론트엔드 — 고객 페이지

### 목록 페이지 (`/magazine`)
- 기존 UI 유지 (featured hero + 3컬럼 그리드)
- 더미 데이터 → DB 조회로 전환 (`getMagazinePosts()` 수정)
- 카테고리 필터 탭 추가 (전체 / 각 카테고리)
- `is_published`가 true인 글만 노출

### 상세 페이지 (`/magazine/[slug]`)
- 대표 이미지 (풀 너비)
- 카테고리 배지 + 작성일
- 제목 (h1, uppercase, letter-spacing)
- 본문 (Tiptap HTML → `@tailwindcss/typography` prose 스타일)
- 하단: 목록으로 돌아가기 링크
- 관련 글 추천 없음 (본문만)

---

## 2. 어드민 — 매거진 관리

### 목록 페이지 (`/admin/magazine`)
- 공지사항 패턴과 동일
- 테이블 컬럼: 대표이미지 썸네일, 제목, 카테고리, 게시 상태, 작성일
- 필터: 전체 / 공개 / 비공개
- "새 글 작성" 버튼

### 작성 페이지 (`/admin/magazine/new`)
- 제목 입력
- 카테고리 드롭다운 (DB에서 조회)
- 대표 이미지 URL 입력
- 요약(excerpt) 텍스트 입력 — 목록 페이지 미리보기용
- Tiptap 에디터로 본문 작성
- 토글: 게시(`is_published`)
- 저장 버튼

### 수정 페이지 (`/admin/magazine/[id]`)
- 작성 페이지와 동일 구조
- 추가: 삭제 버튼

### 카테고리 관리 (`/admin/magazine/categories`)
- 심플한 리스트: 카테고리명 + 삭제 버튼
- 하단에 새 카테고리 추가 입력 + 추가 버튼
- 사이드바 네비게이션에서 "매거진 관리" 하위로 접근

### API
| Endpoint | Method | 기능 |
|----------|--------|------|
| `/api/admin/magazine` | GET | 목록 |
| `/api/admin/magazine` | POST | 새 글 생성 |
| `/api/admin/magazine/[id]` | GET | 상세 |
| `/api/admin/magazine/[id]` | PUT | 수정 |
| `/api/admin/magazine/[id]` | DELETE | 삭제 |
| `/api/admin/magazine/categories` | GET | 카테고리 목록 |
| `/api/admin/magazine/categories` | POST | 카테고리 추가 |
| `/api/admin/magazine/categories/[id]` | DELETE | 카테고리 삭제 |

---

## 3. DB 스키마

### `pb_magazine_categories`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 자동생성 |
| name | text (unique) | 카테고리명 |
| sort_order | int | 정렬 순서 (default 0) |
| created_at | timestamptz | 자동생성 |

### `pb_magazine`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 자동생성 |
| title | text | 제목 |
| slug | text (unique) | URL용 슬러그 |
| excerpt | text | 요약 (목록 미리보기) |
| content | text | 본문 HTML (Tiptap) |
| image_url | text | 대표 이미지 URL |
| category_id | uuid (FK) | pb_magazine_categories.id |
| is_published | boolean | 게시 여부 (default false) |
| created_at | timestamptz | 자동생성 |
| updated_at | timestamptz | 자동생성 |

### TypeScript 타입 (`database.ts` 추가)
- `DbMagazinePost` — pb_magazine 행 타입
- `DbMagazineCategory` — pb_magazine_categories 행 타입
- Database type에 `pb_magazine`, `pb_magazine_categories` 테이블 추가

### 사이드바 네비게이션 (`constants/admin.ts`)
- "매거진 관리" 항목 추가 (Newspaper 아이콘, href: `/admin/magazine`)

---

## 4. 파일 구조 (신규/수정)

### 신규 생성
```
src/app/magazine/[slug]/page.tsx              — 매거진 상세 페이지
src/app/admin/magazine/page.tsx               — 어드민 매거진 목록
src/app/admin/magazine/new/page.tsx           — 어드민 매거진 작성
src/app/admin/magazine/[id]/page.tsx          — 어드민 매거진 수정
src/app/admin/magazine/categories/page.tsx    — 어드민 카테고리 관리
src/app/api/admin/magazine/route.ts           — 매거진 목록 GET, 생성 POST
src/app/api/admin/magazine/[id]/route.ts      — 매거진 상세 GET, 수정 PUT, 삭제 DELETE
src/app/api/admin/magazine/categories/route.ts       — 카테고리 목록 GET, 추가 POST
src/app/api/admin/magazine/categories/[id]/route.ts  — 카테고리 삭제 DELETE
```

### 수정
```
src/types/database.ts                         — DbMagazinePost, DbMagazineCategory 추가
src/constants/admin.ts                        — 매거진 관리 네비 항목 추가
src/lib/data/magazine.ts                      — getMagazinePosts() DB 조회로 전환
src/app/magazine/page.tsx                     — 카테고리 필터 추가, DB 데이터 사용
```
