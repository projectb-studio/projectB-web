# 관리자 테마 변경 기능 디자인 스펙

> 날짜: 2026-04-07
> 범위: 관리자 페이지에서 사이트 전체 색감을 5개 프리셋 중 선택하여 변경

---

## 1. 프리셋 정의

5개 테마 프리셋. 코드에 상수로 정의, DB에는 선택된 테마 ID만 저장.

### Terracotta (기본값, 현재 적용 중)
```
--pb-jet-black: #3B2820    --pb-snow: #FAF7F2
--pb-rich-black: #6B4A3A   --pb-off-white: #F2ECE2
--pb-charcoal: #6B4A3A     --pb-light-gray: #D9C9AE
--pb-gray: #8B7355         --pb-silver: #B5A48C
--pb-accent-terracotta: #B5704F
```

### Monochrome
```
--pb-jet-black: #0A0A0A    --pb-snow: #FAFAFA
--pb-rich-black: #1A1A1A   --pb-off-white: #F0F0F0
--pb-charcoal: #333333     --pb-light-gray: #D4D4D4
--pb-gray: #666666         --pb-silver: #999999
--pb-accent-terracotta: #666666
```

### Forest Light (베이지 배경 + 초록 텍스트 + 앰버 강조)
```
--pb-jet-black: #2D4A2D    --pb-snow: #FAF7F2
--pb-rich-black: #3D5C3D   --pb-off-white: #F2ECE2
--pb-charcoal: #4A6B4A     --pb-light-gray: #C8D5B9
--pb-gray: #6B8B6B         --pb-silver: #9BAF8B
--pb-accent-terracotta: #C8873E
```

### Forest Deep (초록 배경 + 베이지 텍스트 + 골드 강조)
```
--pb-jet-black: #F2ECE2    --pb-snow: #1E3A1E
--pb-rich-black: #D9C9AE   --pb-off-white: #2D4A2D
--pb-charcoal: #D9C9AE     --pb-light-gray: #3D5C3D
--pb-gray: #B5A48C         --pb-silver: #8B9B7B
--pb-accent-terracotta: #C9A84C
```

### Lemon (연노랑 배경 + 베이지 텍스트 + 코랄 강조)
```
--pb-jet-black: #8B7355    --pb-snow: #FEFCE8
--pb-rich-black: #6B4A3A   --pb-off-white: #FEF9C3
--pb-charcoal: #8B7355     --pb-light-gray: #E5D9A8
--pb-gray: #A89070         --pb-silver: #C4B38A
--pb-accent-terracotta: #E07B5A
```

---

## 2. DB

### `pb_site_settings` 테이블 (신규)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 자동생성 |
| theme_id | text | 선택된 테마 ID (기본값: "terracotta") |
| updated_at | timestamptz | 자동생성 |

단일 row 구조. 사이트 설정이 추가되면 이 테이블에 컬럼 추가.

---

## 3. API

| Endpoint | Method | 인증 | 기능 |
|----------|--------|------|------|
| `/api/settings` | GET | 불필요 | 현재 테마 ID 조회 (프론트 렌더링용) |
| `/api/admin/settings` | GET | admin | 현재 설정 조회 |
| `/api/admin/settings` | PUT | admin | 테마 변경 (theme_id 업데이트) |

---

## 4. 프론트 적용 (layout.tsx)

- `layout.tsx`에서 서버사이드로 현재 테마 ID 조회
- 테마 ID → 프리셋 상수에서 CSS 변수값 매핑
- `<html>` 태그의 `style` 속성으로 CSS 변수 오버라이드 주입
- 클라이언트 JS 없이 서버 렌더링에서 바로 적용

---

## 5. 어드민 UI (`/admin/settings`)

- 5개 프리셋 카드 그리드 (2~3열)
- 각 카드: 테마 이름 + 색상 미리보기 원형 3개 (배경/전경/강조)
- 현재 적용 중인 테마에 체크 표시
- 선택 즉시 API 호출 → 저장
- 사이드바에 "사이트 설정" 메뉴 추가 (Settings 아이콘)

---

## 6. 파일 구조

### 신규 생성
```
src/constants/themes.ts                    — 5개 프리셋 상수 정의
src/app/api/settings/route.ts              — 고객용 GET (테마 조회)
src/app/api/admin/settings/route.ts        — 관리자용 GET/PUT
src/app/admin/settings/page.tsx            — 테마 선택 어드민 페이지
src/lib/data/settings.ts                   — getThemeId() 서버 헬퍼
```

### 수정
```
src/types/database.ts                      — DbSiteSettings 타입 추가
src/constants/admin.ts                     — 사이트 설정 네비 항목 추가
src/app/layout.tsx                         — 테마 CSS 변수 동적 주입
src/styles/globals.css                     — 기본값은 유지 (fallback)
```
