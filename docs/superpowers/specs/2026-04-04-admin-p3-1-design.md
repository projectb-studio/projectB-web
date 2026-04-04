# P3-1: Admin Dashboard — 리뷰/문의/공지 관리

> 날짜: 2026-04-04
> 범위: 미구현 Admin 페이지 3개 (리뷰, 문의, 공지사항)
> 접근방식: 페이지별 독립 구현 (기존 주문 관리 패턴 재사용)

---

## 1. 리뷰 관리 (`/admin/reviews`)

### 목록 페이지 (`/admin/reviews/page.tsx`)
- 테이블 컬럼: 상품명, 작성자, 별점(★), 내용 미리보기, 이미지 유무, 답변 상태, 작성일
- 필터: 전체 / 미답변 / 답변완료
- 행 클릭 → 상세 페이지 이동

### 상세 페이지 (`/admin/reviews/[id]/page.tsx`)
- 리뷰 정보 표시: 상품명(링크), 작성자, 별점, 내용, 첨부 이미지
- 관리자 답변 작성/수정 텍스트영역
- 액션 버튼: 답변 저장, 리뷰 숨김 토글, 리뷰 삭제
- 숨김 처리된 리뷰는 프론트에서 비노출

### API
| Endpoint | Method | 기능 |
|----------|--------|------|
| `/api/admin/reviews` | GET | 목록 (필터 쿼리 파라미터) |
| `/api/admin/reviews/[id]` | GET | 상세 |
| `/api/admin/reviews/[id]` | PUT | 답변 작성/수정, 숨김 토글 |
| `/api/admin/reviews/[id]` | DELETE | 삭제 |

### DB 변경
- `pb_reviews` 테이블에 `is_hidden` (boolean, default false) 컬럼 추가

---

## 2. 문의 관리 (`/admin/inquiries`)

### 상태 흐름
```
접수(received) → 처리중(in_progress) → 답변완료(answered) → 종료(closed)
```

### 목록 페이지 (`/admin/inquiries/page.tsx`)
- 테이블 컬럼: 문의 유형(상품문의/배송/교환반품/기타), 제목, 작성자, 상태 배지, 작성일
- 필터: 전체 / 접수 / 처리중 / 답변완료 / 종료
- 행 클릭 → 상세 페이지 이동

### 상세 페이지 (`/admin/inquiries/[id]/page.tsx`)
- 문의 정보: 유형, 제목, 내용, 작성자 정보, 첨부파일
- 상태 변경 드롭다운 (received → in_progress → answered → closed)
- 관리자 답변 작성/수정 텍스트영역
- 답변 저장 시 상태 자동으로 `answered`로 전환

### API
| Endpoint | Method | 기능 |
|----------|--------|------|
| `/api/admin/inquiries` | GET | 목록 (상태/유형 필터) |
| `/api/admin/inquiries/[id]` | GET | 상세 |
| `/api/admin/inquiries/[id]` | PUT | 답변 작성, 상태 변경 |

### DB 변경
- `pb_cs_inquiries.status` 값 확장: `received`, `in_progress`, `answered`, `closed` (기존 2단계 → 4단계)

---

## 3. 공지사항 관리 (`/admin/notices`)

### 목록 페이지 (`/admin/notices/page.tsx`)
- 테이블 컬럼: 제목, 상단고정 아이콘, 게시 상태(공개/비공개), 작성일
- 필터: 전체 / 공개 / 비공개
- "새 공지 작성" 버튼 → 작성 페이지 이동

### 작성 페이지 (`/admin/notices/new/page.tsx`)
- 제목 입력
- Tiptap 리치 텍스트 에디터 (볼드, 이탤릭, 링크, 이미지 삽입, 리스트)
- 토글: 상단고정(`is_pinned`), 게시(`is_published`)
- 저장 버튼

### 수정 페이지 (`/admin/notices/[id]/page.tsx`)
- 작성 페이지와 동일 구조
- 추가: 삭제 버튼

### API
| Endpoint | Method | 기능 |
|----------|--------|------|
| `/api/admin/notices` | GET | 목록 (게시 상태 필터) |
| `/api/admin/notices` | POST | 새 공지 작성 |
| `/api/admin/notices/[id]` | GET | 상세 |
| `/api/admin/notices/[id]` | PUT | 수정 |
| `/api/admin/notices/[id]` | DELETE | 삭제 |

---

## 4. 공통 사항

### 디자인
- 기존 Industrial Minimal 디자인 시스템 준수 (border-radius: 0, 모노크롬)
- 기존 Admin 레이아웃(사이드바/헤더) 재사용
- 기존 주문 관리 페이지의 테이블/상세 패턴 따름

### 신규 패키지
- `@tiptap/react` — React 바인딩
- `@tiptap/starter-kit` — 기본 에디터 기능
- `@tiptap/extension-image` — 이미지 삽입
- `@tiptap/extension-link` — 링크 삽입

### 파일 구조 (신규)
```
src/app/admin/
├── reviews/
│   ├── page.tsx              # 리뷰 목록
│   └── [id]/page.tsx         # 리뷰 상세/답변
├── inquiries/
│   ├── page.tsx              # 문의 목록
│   └── [id]/page.tsx         # 문의 상세/답변
└── notices/
    ├── page.tsx              # 공지 목록
    ├── new/page.tsx          # 새 공지 작성
    └── [id]/page.tsx         # 공지 수정

src/app/api/admin/
├── reviews/
│   ├── route.ts              # GET (목록)
│   └── [id]/route.ts         # GET, PUT, DELETE
├── inquiries/
│   ├── route.ts              # GET (목록)
│   └── [id]/route.ts         # GET, PUT
└── notices/
    ├── route.ts              # GET, POST
    └── [id]/route.ts         # GET, PUT, DELETE

src/components/admin/
└── ui/
    └── TiptapEditor.tsx      # Tiptap 에디터 컴포넌트
```

### DB 타입 업데이트
- `src/types/database.ts`에 `is_hidden` (리뷰), 상태 enum 확장 (문의) 반영
