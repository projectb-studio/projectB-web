# AI 상품 상세페이지 초안 — 운영자 검수/발행 분리 (환각 격리)

> 상태: v2 구현 완료 (`feat/ai-draft-v2`)
> 핵심 의도: **AI 초안과 발행본을 물리적으로 분리**하여, 사실 오류·환각이 최종 사용자에게
> 도달하기 전에 운영자가 명시적으로 검토하도록 강제한다.
>
> v2 에서 추가된 것: 품질 게이트 2층(결정론 린터 + LLM 비평가), 법정 고지 블록과
> 발행 차단, 레시피 확장, API 비용 하드캡. 설계 근거는
> [v2 설계 스펙](../superpowers/specs/2026-08-13-ai-draft-v2-design.md)과
> [리서치 요약](../research/ai-draft-v2-research.md) 참조.

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

## 5-1. 품질 게이트 (v2)

생성물은 발행 전 두 층의 검증을 거친다.

**1층 — `voice-lint` (결정론, 비용 0)**
기계로 판정 가능한 위반만 본다. 가장 중요한 규칙은 `fact-leak`(blocker)로,
카피의 주장이 입력 사실값에 실재하는지 대조한다. 수치·소재·관리법·가격뿐 아니라
**제작 기법**(손바느질·물레·용접 등)도 사실로 취급한다. 태그 `handmade` 는
"수작업"까지만 보증하고 개별 기법은 보증하지 않는다.
오탐을 줄이기 위해 소재 동의어(유리↔글라스)와 태그를 근거로 인정한다.

**2층 — `llm-judge` (주관 품질, 유료)**
객관 축(사실침범·구조)은 통과/실패, 주관 축(브랜드톤·상품고유성·한국어품질)은
0~5로 매기고 평균 4.0 이상이어야 통과다. 판정 편향 방어로 (a) 생성기와 다른 모델
(`AI_JUDGE_MODEL`, 기본 Sonnet), (b) 스키마에서 근거를 점수보다 앞에 배치,
(c) 길이는 평가 대상이 아님을 명시한다.

**재생성 루프**는 최대 2회다. 점수가 나아지지 않으면 남은 시도를 쓰지 않고,
시도 중 최고점을 채택한다. 판정 결과는 `generation_meta.quality` 에 남아
검수 화면에 점수 뱃지로 표시된다.

## 5-2. 법정 고지와 발행 차단 (v2)

전자상거래법 상품정보제공고시가 요구하는 항목을 별도 블록으로 만든다.
품목(주방용품 / 침구류·커튼 / 기타재화)마다 필수 항목이 다르므로 태그·상품명으로
품목을 추론하고, 모호하면 고시가 정한 폴백인 기타재화를 쓴다.

**값의 출처는 운영자 DB 값뿐이다.** 모델은 이 경로에 접근하지 않는다 — 법정 고지에
환각이 섞이면 그대로 위법이기 때문이다. 근거가 없으면 `[운영자 입력 필요]` 로 남고,
**그 상태로는 발행되지 않는다**(approve 가 422). 고시 일반원칙 3(정보를 제공할 수
없으면 그 사유를 제시)에 따라 사유 없는 공란 게시를 막는 것이다.

## 5-3. API 비용 하드캡 (v2)

`AI_DRAFT_BUDGET_USD`(기본 $5)를 넘길 것 같으면 **호출 자체를 차단**한다.
worst-case 를 먼저 예약하고 응답의 실제 usage 로 정산하는 방식이라 "쓰고 나서 세는"
초과 과금이 구조적으로 불가능하다. 사용 원장은 `.ai-draft-usage.json`(gitignore).

## 5-4. 운영자가 지금 할 수 있는 것 (코드 수정 불필요)

법정 고지가 비면 발행이 막히는데, 대부분은 **관리자 상품 수정 화면의 `상세정보(details)`
칸에 텍스트를 붙여넣는 것만으로** 해결된다. `noticeRowsFor` 가 `라벨: 값` 형식을 읽어
고지 표를 자동으로 채우기 때문이다.

**1) 전 상품 공통 — 사업자 정보 (그대로 복사)**

```
제조자: 프로젝트비
제조국: 대한민국
A/S: 프로젝트비 010-2122-0691
품질보증기준: 소비자기본법에 따른 소비자분쟁해결기준에 따름
인증: 해당 없음
```

이것만으로 **기타재화 품목(화병·캔들홀더·인센스홀더 등)은 고지가 100% 채워진다.**
주방용품·침구류는 아래 상품별 항목이 더 필요하다.

**2) 주방용품(컵·트레이·도마·보울·카라페) 추가**

```
재질: (예) 보로실리케이트 유리
구성품: (예) 컵 1개
크기: (예) 지름 8cm × 높이 10cm
출시년월: (예) 2026-08
```

**3) 침구류·커튼 품목(패브릭 태그 전체) 추가**

```
제품 소재(혼용률): (예) 리넨 100%
색상: (예) 아이보리
치수: (예) 40cm × 180cm
제품구성: (예) 러너 1장
```
세탁방법은 `care` 칸 값이 자동으로 들어간다.

> 라벨은 별칭도 인식한다. `소재`/`재질`, `크기`/`사이즈`/`치수`, `원산지`/`제조국`,
> `A/S`/`AS`/`고객센터` 는 서로 통한다. 이 동작은 `notice-categories.test.ts` 의
> "사업자 공통정보 붙여넣기" 테스트가 지킨다.

## 6. 적용(배포) 절차

1. Supabase SQL Editor 에서 `supabase/migration-ai-draft-review.sql` 실행.
2. (선택) 실제 LLM 사용 시 `.env` 에 `ANTHROPIC_API_KEY`(필요 시 `AI_DRAFT_MODEL`) 추가.
3. 관리자 → 상품 · 콘텐츠 → **AI 초안 검수** 또는 상품 수정 화면의 **AI 초안** 버튼.

## 7. 자가평가 하네스 (v2)

픽스처 6종(사실값이 풍부한 것부터 상품명뿐인 것까지)으로 실 LLM 생성·채점을 돌린다.

```bash
RUN_AI_EVAL=1 npx vitest run src/lib/ai-draft/eval/run-eval.test.ts
```

결과는 `.ai-eval/report.json` 에 남는다. 프롬프트나 레시피를 고친 뒤 이걸 돌려
평균 점수·환각 건수의 변화를 확인한다. 예산 가드가 걸려 있어 한도를 넘으면 자동으로 멈춘다.

**평가할 때 주의** — few-shot 예시에 쓰는 상품과 평가 픽스처 상품이 겹치면 안 된다.
모델에게 답을 보여주고 시험하는 셈이라 점수가 부풀려진다. (실제로 v2 개발 중 이
오염 때문에 만점이 나왔다가, 예시를 교체하니 진짜 결함이 드러났다.)
