# AI 상품 상세페이지 초안 — 운영자 검수/발행 분리 (환각 격리)

> 상태: 구현 완료 (`feat/ai-draft-review`)
> 핵심 의도: **AI 초안과 발행본을 물리적으로 분리**하여, 사실 오류·환각이 최종 사용자에게
> 도달하기 전에 운영자가 명시적으로 검토하도록 강제한다.

## 1. 왜 이렇게 설계했나

"LLM 에게 상세페이지를 통째로 생성시키기"는 품질이 불안정하고(레이아웃·톤 제멋대로),
브랜드 룰을 어기며, 비용이 크고, 사실(소재·치수·세탁법)까지 지어낸다.

그래서 두 가지 원칙으로 통제한다.

1. **템플릿 제약 생성 (Structured Generation)**
   한국 옷/소품 상세페이지 표준 흐름을 고정 레시피로 코드화하고
   (`src/lib/ai-draft/recipe.ts`, `RECIPE_VERSION = "soft-goods-editorial-v1"`),
   모델은 정해진 슬롯의 "보이스 카피"만 채운다. 레이아웃·섹션 순서는 모델이 못 바꾼다.

2. **사실 / 보이스 / 이미지 분리**
   | 종류 | 출처 | 모델 권한 |
   |------|------|-----------|
   | 사실(소재·치수·원산지·세탁) | 운영자 입력 DB 값 (`pb_products.details/care/shipping`) | 생성 금지 — 없으면 `[운영자 입력 필요]` 플레이스홀더 |
   | 보이스(컨셉·핵심포인트 카피) | 모델 생성 | 자유 생성 (주관적 → 환각 위험 낮음) |
   | 이미지 | 업로드된 `pb_product_images` | **배치만** — 사진을 만들지 않음 |

## 2. 격리 아키텍처 (3중 방어)

```
┌─ AI 생성 경로 (신뢰 안 함) ─────────────┐   ┌─ 발행 경로 (고객 노출) ─┐
│ provider(stub|LLM) → recipe.assemble    │   │  pb_products            │
│   → pb_product_detail_drafts            │   │    .detail_blocks       │
│      status = pending                   │   │                         │
└──────────────────────────────────────────┘  └─────────────────────────┘
        │                                              ▲
        │  운영자 검수 화면 (편집/Diff/반려/승인)       │
        └──── [승인 후 발행] ─ sanitizeBlocks 재검증 ───┘
                  오직 운영자 액션으로만 이 화살표가 작동
```

1. **물리적 분리** — AI 산출물은 `pb_product_detail_drafts` 테이블에만 적재된다.
   `pb_products.detail_blocks`(라이브)는 AI 가 직접 건드릴 수 없다.
   드래프트 테이블은 RLS 로 클라이언트 직접 접근이 전면 차단(검수 전 미노출).
2. **명시적 게이트** — `pending → published` 전이는 운영자의 `approve` API 호출로만 발생.
3. **발행 경계 재검증** — 승인 시점에 `sanitizeBlocks`(Zod 스키마 + DOMPurify +
   이미지 출처 allowlist)를 재통과. AI 가 만든 HTML/URL 도 라이브 진입 전 한 번 더 필터링.
   (추가로 생성 시점에도 richtext 를 sanitize 하여 초안 미리보기까지 안전.)

## 3. 검수 흐름 + 피드백 루프

```
[generate v1] → pending
   ├─ approve ───→ published   (+ detail_blocks 복사, published_at)
   ├─ edit ──────→ pending      (운영자가 발행 전 블록 직접 수정)
   └─ reject(의견)→ rejected
          └─ regenerate: 의견 반영 → pending v2 (parent=v1, feedback=의견)
                                       └→ 다시 검토 …
```

반려는 종료가 아니라 **피드백 루프**다. 운영자 의견(`feedback`)이 다음 초안 생성의
입력으로 들어가고, 초안들은 `parent_draft_id` / `revision` 으로 리비전 체인을 이룬다.

## 4. 코드 맵

| 레이어 | 파일 |
|--------|------|
| DB | `supabase/migration-ai-draft-review.sql` (`pb_product_detail_drafts`) |
| 레시피 | `src/lib/ai-draft/recipe.ts` |
| Provider | `src/lib/ai-draft/{provider,stub-provider,anthropic-provider,index}.ts` |
| 생성 오케스트레이션 | `src/lib/ai-draft/generate-service.ts` |
| 발행 신뢰 경계 | `src/lib/detail-blocks/sanitize-blocks.ts` |
| Repository | `src/lib/data/drafts.ts` |
| API | `src/app/api/admin/products/[id]/drafts/` · `src/app/api/admin/drafts/[draftId]/{,approve,reject}` |
| UI | `src/app/admin/drafts/` · `src/components/admin/ai-draft/` |
| 테스트 | `src/lib/ai-draft/*.test.ts` (레시피/스텁/발행 경계) |

## 5. Provider 전환 (stub ↔ LLM)

`getDraftProvider()` 가 환경변수로 분기한다.

- `ANTHROPIC_API_KEY` 미설정 → **결정적 스텁**(`StubDraftProvider`). 키 없이 전체 흐름 동작.
- `ANTHROPIC_API_KEY` 설정 → **실제 LLM**(`AnthropicDraftProvider`, fetch 기반·새 의존성 없음).
  모델은 `AI_DRAFT_MODEL`(기본 `claude-haiku-4-5-20251001`)로 오버라이드. 카피 생성은
  경량 작업이라 Haiku 가 비용·품질 균형상 기본값. 출력은 엄격한 JSON 스키마로 강제하고
  파싱 실패 시 throw → 발행 경로로 새지 않는다.

키 유무와 무관하게 생성→검수→발행 UI/흐름은 동일하다.

## 6. 적용(배포) 절차

1. Supabase SQL Editor 에서 `supabase/migration-ai-draft-review.sql` 실행.
2. (선택) 실제 LLM 사용 시 `.env` 에 `ANTHROPIC_API_KEY`(필요 시 `AI_DRAFT_MODEL`) 추가.
3. 관리자 → 상품 · 콘텐츠 → **AI 초안 검수** 또는 상품 수정 화면의 **AI 초안** 버튼.
