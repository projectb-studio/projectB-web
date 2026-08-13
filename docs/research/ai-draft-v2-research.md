# AI 상세페이지 v2 — 리서치 요약 (2026-08-13)

세 갈래 병렬 조사 결과 중 **설계에 실제로 반영한 것**만 추렸다. 각 항목에 1차 출처를 남긴다.

---

## A. 법정 요건 — 가장 중요

### A-1. 상품정보제공고시 (공정거래위원회고시 제2020-14호)
- 원문 PDF: https://meta-commerce.co.kr/data/forbiz_data/bbs_data/bbs_notice/00000056/4c41a077be85092f1d70d1060d6ca91d.pdf
- 국가법령정보센터: https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000065929

**일반원칙 중 설계에 직결되는 3가지 (원문 취지)**
1. 유사 품목의 항목을 따르고, 유사 품목이 없으면 **(40) 기타 재화**를 쓴다
2. 정보를 제공할 수 없는 항목은 **구체적 사유를 제시**해야 한다
   → `[운영자 입력 필요]` 상태 발행은 위반. **발행 게이트로 차단함**
3. 품질보증기준은 정해진 문형이 있다 (소비자분쟁해결기준 외 규정이면 확인 방법 병기)

**우리 상품에 걸리는 품목별 필수항목**

| 품목 | 필수항목 |
|------|----------|
| (40) 기타 재화 | 품명 및 모델명 / 인증·허가 사항 / 제조국·원산지 / 제조자·수입자 / A/S 책임자 전화번호 |
| (17) 주방용품 | 품명 및 모델명 / 재질 / 구성품 / 크기 / 출시년월 / 제조자·수입자 / 제조국 / (수입 기구·용기면) 수입신고 문구 / 품질보증기준 / A/S 책임자 전화번호 |
| (5) 침구류·커튼 | 제품 소재(혼용률 백분율) / 색상 / 치수 / 제품구성 / 제조자·수입자 / 제조국 / 세탁방법 및 취급주의 / 품질보증기준 / A/S 책임자 전화번호 |

**거래조건 정보 — 품목 무관 전 상품 공통 필수 (5개 대분류)**
1. 공급방법·공급시기 (배송방법 / 예상 배송기간 / 배송비용, 도서산간 추가비용 포함)
2. 청약철회 (단순변심 기간·반품비용 / 철회 불가 시 사유와 근거 / 하자·오배송 시 판매자 부담)
3. 교환·반품·보증·환불 (품질보증기준 / A/S 전화번호 / 환불 방법과 지연 배상금 조건·절차)
4. 소비자피해보상·불만·분쟁처리
5. 약관 내용 또는 확인 방법

**정보 제공 "방법" 규정 (IV)**: 색상 차별화·테두리·글자 크기로 알아보기 쉽게,
이해하기 쉬운 용어로. → Industrial Minimal(모노톤·영문 UPPERCASE)과 긴장 관계.
고지 블록만은 대비 확보 + 한글 라벨 필요.

### A-2. 주문제작 청약철회 제한
- 전자상거래법 제17조②5호 + 시행령 제21조:
  https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%A0%84%EC%9E%90%EC%83%81%EA%B1%B0%EB%9E%98%EB%93%B1%EC%97%90%EC%84%9C%EC%9D%98%EC%86%8C%EB%B9%84%EC%9E%90%EB%B3%B4%ED%98%B8%EC%97%90%EA%B4%80%ED%95%9C%EB%B2%95%EB%A5%A0/%EC%A0%9C17%EC%A1%B0
- **사전 고지 + 서면(전자문서) 동의**가 있어야 제한이 유효.
  상세페이지에 문구만 쓰고 동의를 안 받으면 그 문구는 무효.
- 양방향 리스크: 아무 고지도 없으면 전량 단순변심 반품 대상.

### A-3. 제재
- 거짓 정보 1천만원 이하 벌금 / 거래조건 미표시 500만원 이하 과태료 /
  부당광고 2년 이하 징역 또는 1억5천만원 이하 벌금
- https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=25&ccfNo=3&cciNo=1&cnpClsNo=2

### A-4. 미확인
- 2023년 이후 추가 개정 여부 (law.go.kr JS 렌더링으로 확인 실패).
  단 제2022-15호 개정은 우리 3개 품목군 항목을 바꾸지 않음.
- 무신사 파트너 매뉴얼 (로그인 게이트)

---

## B. 국내 실무 표준 — 섹션 구성

### B-1. 공통 순서
후킹 → **문제 공감 → 문제 제기 → 솔루션** → 상품 공개 → 특장점 → 근거(수치·리뷰)
→ 비교 → 비전 → 사용법 → 구성·혜택 → 프로모션 → 상세정보

- 상세페이지 만드는 법 총정리: https://www.youtube.com/watch?v=0ydbzv2s1-g
- converta 스마트스토어 가이드: https://converta.co.kr/community/resources/smartstore-detail-page-guide
- 작은 브랜드 상세페이지 9단계: https://brunch.co.kr/@designmydesign/4

v1 이 놓친 축: **문제→솔루션**, **사회적 증거**, **클로징**.

단, 총정리 영상은 "순서를 반드시 지킬 필요는 없고 필요한 섹션만 골라 써도 된다"고
명시 — 고정 레시피 자체가 문제가 아니라 **섹션 풀이 좁은 것**이 문제.

### B-2. 후킹
- 첫 화면엔 컨셉이 아니라 **가장 센 무기**를 놓는다 (리뷰·수치·혜택·문제제기 중 택1)
- "3초 안에 이게 뭐고 왜 좋은지"
- 후킹 공식 3형: 시간 단축 / 기능 강화 / 확실한 변화(비포·애프터).
  짧게, 숫자 포함, **장점이 많아도 딱 1가지만**
  https://brunch.co.kr/@kfinland100/100
- 후킹 = 고객 욕구 충족. 단 명품·주얼리류는 예외적으로 **브랜드 감성**이 맞다
  https://www.youtube.com/watch?v=pW2_eHQWV_I

→ `heroCaption` 정의를 "한 줄 컨셉" → **"고객 이득 한 줄"** 로 재정의.

### B-3. 카피 공식
- **기능 → 혜택**: "예초기를 사는 게 아니라 예초된 모습을 사는 것"
  https://www.youtube.com/watch?v=REXvu24tcGc
- PAS / AIDA 뼈대, 구체적 숫자로 신뢰, 고객이 쓰는 언어로
- 한 메시지 원칙: https://www.tosspayments.com/blog/articles/semo-110

### B-4. 핸드메이드 특수성
- 기능이 아니라 **예쁨과 만든 사람**이 구매 동기. 같은 제품을 파니 차별화는 비주얼
  https://www.youtube.com/watch?v=TbgYBBP_3Co
- 공예품 필수 4요소: 영감·배경·전통기법 / 작가 경력·철학 + **제작 과정** /
  자연광 다각도 컷 + 라이프스타일 컷 / 스펙 나열 대신 가치·경험
  https://bloomingwind.com/52
- 아이디어스: 작품 설명에 **소재·크기·제작 기간·관리 방법**을 빠짐없이,
  재고형 vs 수주제작 구분 체크
  https://artist-mate.idus.com/ed490c3c-0ce5-44d2-bf76-53ba2c749a5e

### B-5. AI 티의 정체 (린터 규칙의 근거)
- 뻔한 표현 반복: **"일상", "고민 없이", "어디에나 어울리는"**
- 톤앤매너 불일치 (제품마다 다른 문장 구조)
- 이미지 디테일 미반영
  https://blog.gency.ai/chatgpt-detail-page-creation
- 근거 없는 단정, 같은 정보의 다른 말 반복
  https://www.youngju.dev/blog/productivity/2026-08-02-ai-content-quality-guardrails

---

## C. 생성 품질 기법

### C-1. 프롬프트
- **few-shot 3~5개**가 톤·형식 통제에 가장 확실. relevant/diverse/structured
  https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- **부정형 → 긍정형**. 부정 지시는 모델이 클수록 오히려 못 지킨다(역스케일링)
  https://arxiv.org/abs/2209.12711
  → 단 **환각 금지는 부정형 유지**. 안전 제약을 약화시킬 근거가 아님
- **Structured Outputs**: `output_config.format = {type:"json_schema"}`.
  Haiku 4.5 지원, 베타 헤더 불필요. `minLength`/`maxLength`/`minimum` 미지원,
  배열 `minItems` 는 0·1만 → 길이·개수는 코드 검증 유지
  https://platform.claude.com/docs/en/build-with-claude/structured-outputs

### C-2. LLM 판정 편향과 방어
| 편향 | 근거 | 방어 |
|------|------|------|
| 자기선호 (자기 출력에 후한 점수) | https://arxiv.org/abs/2404.13076 | 생성기와 다른 모델로 판정 |
| 위치 편향 | https://arxiv.org/abs/2305.17926 | 절대평가 사용, 쌍대비교는 순서 뒤집어 2회 |
| 장황함 편향 | https://arxiv.org/abs/2306.05685 | "길이는 평가 대상 아님" 명시 |
| 사후합리화 | G-Eval https://arxiv.org/abs/2303.16634 | 스키마에서 reasoning 을 점수보다 앞에 |
| 점수 편중 | 실무 문헌 | 객관축 binary, 주관축만 0~5 |

### C-3. critique 루프
- Self-Refine: 상한 4회이되 **이득이 초기 반복에 몰림**(수확체감 명시)
  https://arxiv.org/abs/2303.17651
- 반대 증거: 외부 피드백 없는 self-correction 은 추론 태스크에서 오히려 악화
  https://arxiv.org/abs/2310.01798
  → 우리는 스타일 태스크이고, **린터가 외부 검증 신호** 역할을 하므로 조건이 다름
- 결론: **상한 2회, 점수 개선 없으면 중단, 최고점 보존**

### C-4. 상용 툴 공통 패턴
- Shopify Magic / Amazon / Jasper / Copy.ai 전부 **인간 게이트 유지**.
  자동 발행하는 곳이 없다 → 우리 검수 분리 설계가 업계 표준과 일치
- Shopify 는 feature 2개 미만이면 품질 보장 안 함 → **입력 최소량**이 품질을 좌우
- Jasper/Copy.ai 는 브랜드 보이스를 **재사용 객체**로 분리 (우리는 아직 프롬프트 하드코딩)
