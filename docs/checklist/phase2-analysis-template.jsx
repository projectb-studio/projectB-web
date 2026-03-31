import { useState } from "react";

const ANALYSIS_SECTIONS = [
  {
    id: "summary",
    icon: "📊",
    title: "프로젝트 요약",
    fields: [
      { id: "brand", label: "브랜드명", type: "auto", mapping: "brand_name" },
      { id: "industry", label: "업종/카테고리", type: "auto", mapping: "product_type" },
      { id: "target", label: "타겟 고객", type: "auto", mapping: "target_audience" },
      { id: "budget_range", label: "예산 범위", type: "auto", mapping: "budget" },
      { id: "timeline", label: "목표 일정", type: "auto", mapping: "timeline" },
      { id: "scope_summary", label: "프로젝트 범위 요약", type: "textarea", placeholder: "웹사이트 + 모바일 앱 / 웹사이트만 등" },
    ],
  },
  {
    id: "persona",
    icon: "👤",
    title: "타겟 고객 페르소나",
    description: "체크리스트 응답 기반으로 2~3개의 페르소나를 정의합니다",
    repeatable: true,
    template: [
      { id: "name", label: "페르소나 이름", type: "text", placeholder: "예: 트렌디 민지 (28세)" },
      { id: "demo", label: "인구통계", type: "text", placeholder: "28세, 여성, 직장인, 서울 거주" },
      { id: "goal", label: "목표/니즈", type: "textarea", placeholder: "출퇴근 중 빠르게 쇼핑, 트렌디한 아이템 탐색" },
      { id: "pain", label: "불편한 점(Pain Point)", type: "textarea", placeholder: "복잡한 결제 과정, 사이즈 정보 부족" },
      { id: "behavior", label: "쇼핑 행동 패턴", type: "textarea", placeholder: "인스타 → 검색 → 상세페이지 → 비교 → 구매" },
      { id: "device", label: "주 사용 기기", type: "text", placeholder: "모바일 80%, PC 20%" },
    ],
  },
  {
    id: "competitor",
    icon: "🔍",
    title: "경쟁사 분석",
    description: "사장님이 언급한 경쟁사 + 동종 업계 주요 플레이어 분석",
    repeatable: true,
    template: [
      { id: "comp_name", label: "경쟁사명", type: "text", placeholder: "예: OO쇼핑몰" },
      { id: "comp_url", label: "URL", type: "text", placeholder: "https://..." },
      { id: "comp_strength", label: "강점", type: "textarea", placeholder: "디자인이 깔끔, 빠른 배송, 풍부한 리뷰" },
      { id: "comp_weakness", label: "약점", type: "textarea", placeholder: "모바일 UX 불편, 검색 기능 부실" },
      { id: "comp_diff", label: "우리가 이길 수 있는 포인트", type: "textarea", placeholder: "사장님의 USP를 기반으로 차별화 전략" },
    ],
  },
  {
    id: "mvp",
    icon: "🎯",
    title: "MVP vs Full 스코프",
    description: "예산과 일정을 고려하여 1차 출시(MVP)와 2차 확장을 구분합니다",
    fields: [
      { id: "mvp_pages", label: "MVP 필수 페이지", type: "textarea", placeholder: "메인, 상품목록, 상품상세, 장바구니, 결제, 회원가입, 마이페이지" },
      { id: "mvp_features", label: "MVP 필수 기능", type: "textarea", placeholder: "카드결제, 카카오로그인, 상품옵션, 택배배송, 주문관리" },
      { id: "phase2_pages", label: "2차 확장 페이지", type: "textarea", placeholder: "블로그, 이벤트, 리뷰게시판" },
      { id: "phase2_features", label: "2차 확장 기능", type: "textarea", placeholder: "AI추천, 정기구독, 라이브커머스, 앱 푸시" },
      { id: "mvp_timeline", label: "MVP 예상 기간", type: "text", placeholder: "4~6주" },
      { id: "full_timeline", label: "Full 버전 예상 기간", type: "text", placeholder: "추가 4~8주" },
    ],
  },
  {
    id: "priority",
    icon: "⚖️",
    title: "기능 우선순위 매트릭스",
    description: "사업 임팩트 vs 개발 난이도로 기능 우선순위를 정합니다",
    fields: [
      { id: "p1_high_easy", label: "🟢 높은 임팩트 + 쉬움 (바로 하기)", type: "textarea", placeholder: "카카오 로그인, 상품 검색, 모바일 반응형" },
      { id: "p2_high_hard", label: "🟡 높은 임팩트 + 어려움 (계획적 개발)", type: "textarea", placeholder: "PG 결제 연동, 관리자 대시보드, 배송 추적" },
      { id: "p3_low_easy", label: "🔵 낮은 임팩트 + 쉬움 (여유 있으면)", type: "textarea", placeholder: "SNS 공유 버튼, 최근 본 상품, 위시리스트" },
      { id: "p4_low_hard", label: "⚪ 낮은 임팩트 + 어려움 (보류)", type: "textarea", placeholder: "AI 추천, 실시간 채팅, 해외 결제" },
    ],
  },
  {
    id: "tech",
    icon: "🛠️",
    title: "기술 스택 추천",
    description: "프로젝트 요구사항에 맞는 기술 스택을 결정합니다",
    fields: [
      { id: "frontend", label: "프론트엔드", type: "text", placeholder: "Next.js 14 + TypeScript + Tailwind CSS" },
      { id: "backend", label: "백엔드", type: "text", placeholder: "FastAPI (Python) 또는 Next.js API Routes" },
      { id: "database", label: "데이터베이스", type: "text", placeholder: "Supabase (PostgreSQL) + Redis 캐시" },
      { id: "payment", label: "결제 (PG사)", type: "text", placeholder: "토스페이먼츠 / 아임포트(포트원)" },
      { id: "hosting", label: "호스팅/배포", type: "text", placeholder: "Vercel (프론트) + AWS (백엔드)" },
      { id: "cdn_storage", label: "CDN/스토리지", type: "text", placeholder: "Cloudflare CDN + S3 이미지 스토리지" },
      { id: "auth", label: "인증", type: "text", placeholder: "NextAuth.js (카카오/네이버/구글)" },
      { id: "analytics", label: "분석", type: "text", placeholder: "Google Analytics 4 + Hotjar" },
      { id: "tech_reason", label: "선택 근거", type: "textarea", placeholder: "1인 개발 효율성, 사장님 예산, 확장성 고려..." },
    ],
  },
  {
    id: "estimate",
    icon: "💰",
    title: "견적 & 일정",
    fields: [
      { id: "total_cost", label: "총 예상 비용", type: "text", placeholder: "000만원" },
      { id: "monthly_cost", label: "월 운영 비용", type: "text", placeholder: "서버 0원 + 도메인 0원 + PG 수수료" },
      { id: "phase1_period", label: "1차 (MVP) 개발 기간", type: "text", placeholder: "0주" },
      { id: "phase2_period", label: "2차 확장 기간", type: "text", placeholder: "0주" },
      { id: "milestones", label: "주요 마일스톤", type: "textarea", placeholder: "1주차: 설계 확정\n2주차: 디자인 시안\n3~4주차: 프론트 개발\n5주차: 백엔드+결제\n6주차: QA+런칭" },
    ],
  },
];

const COLORS = { bg: "#0f0f23", card: "rgba(255,255,255,0.03)", border: "#2a2a4a", primary: "#1B3A5C", accent: "#e94560", text: "#e0e0f0", muted: "#8888aa", success: "#2ecc71" };

export default function AnalysisTemplate() {
  const [data, setData] = useState({});
  const [personas, setPersonas] = useState([{}]);
  const [competitors, setCompetitors] = useState([{}]);
  const [jsonInput, setJsonInput] = useState("");
  const [imported, setImported] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showExport, setShowExport] = useState(false);

  const update = (id, val) => setData(p => ({ ...p, [id]: val }));

  const importJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const newData = { ...data };
      ANALYSIS_SECTIONS.forEach(sec => {
        if (sec.fields) {
          sec.fields.forEach(f => {
            if (f.mapping && parsed[f.mapping]) newData[f.id] = parsed[f.mapping];
          });
        }
      });
      setData(newData);
      setImported(true);
      setTimeout(() => setImported(false), 3000);
    } catch { alert("JSON 형식이 올바르지 않습니다"); }
  };

  const addRepeatable = (type) => {
    if (type === "persona") setPersonas(p => [...p, {}]);
    if (type === "competitor") setCompetitors(p => [...p, {}]);
  };

  const updateRepeatable = (type, idx, fieldId, val) => {
    if (type === "persona") { const n = [...personas]; n[idx] = { ...n[idx], [fieldId]: val }; setPersonas(n); }
    if (type === "competitor") { const n = [...competitors]; n[idx] = { ...n[idx], [fieldId]: val }; setCompetitors(n); }
  };

  const generateReport = () => {
    let r = "═══════════════════════════════════════\n";
    r += "  📊 Phase 2 Analysis Report\n";
    r += `  생성일: ${new Date().toLocaleDateString("ko-KR")}\n`;
    r += "═══════════════════════════════════════\n\n";
    ANALYSIS_SECTIONS.forEach(sec => {
      r += `\n${sec.icon} [${sec.title}]\n───────────────────────────────────────\n`;
      if (sec.fields) {
        sec.fields.forEach(f => {
          const val = data[f.id] || "(미작성)";
          r += `${f.label}: ${val}\n`;
        });
      }
      if (sec.id === "persona") {
        personas.forEach((p, i) => {
          r += `\n  --- 페르소나 ${i + 1} ---\n`;
          sec.template.forEach(f => { r += `  ${f.label}: ${p[f.id] || "(미작성)"}\n`; });
        });
      }
      if (sec.id === "competitor") {
        competitors.forEach((c, i) => {
          r += `\n  --- 경쟁사 ${i + 1} ---\n`;
          sec.template.forEach(f => { r += `  ${f.label}: ${c[f.id] || "(미작성)"}\n`; });
        });
      }
      r += "\n";
    });
    return r;
  };

  const sec = ANALYSIS_SECTIONS[activeTab];

  const renderField = (f, value, onChange) => (
    <div key={f.id} style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: COLORS.text }}>
        {f.label}
        {f.mapping && <span style={{ fontSize: 11, color: COLORS.accent, marginLeft: 8 }}>← 자동 입력</span>}
      </label>
      {f.type === "text" || f.type === "auto" ? (
        <input type="text" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={f.placeholder}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`, background: f.type === "auto" && value ? "rgba(233,69,96,0.08)" : "#1a1a2e", color: COLORS.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
      ) : (
        <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={f.placeholder} rows={3}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`, background: "#1a1a2e", color: COLORS.text, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }} />
      )}
    </div>
  );

  if (showExport) {
    const report = generateReport();
    return (
      <div style={{ fontFamily: "'Pretendard', sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.text, padding: "32px 20px" }}>
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet" />
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <button onClick={() => setShowExport(false)} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 16, marginBottom: 20, fontFamily: "inherit" }}>← 돌아가기</button>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>📊 Analysis Report 내보내기</h1>
          <button onClick={() => { navigator.clipboard.writeText(report); }}
            style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: COLORS.accent, color: "white", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit", marginBottom: 16 }}>📋 리포트 복사하기</button>
          <pre style={{ background: "#1a1a2e", padding: 20, borderRadius: 12, fontSize: 13, lineHeight: 1.7, overflow: "auto", maxHeight: 600, border: `1px solid ${COLORS.border}`, whiteSpace: "pre-wrap" }}>{report}</pre>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Pretendard', sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.text }}>
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet" />

      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderBottom: `1px solid ${COLORS.border}`, padding: "24px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>📊 Phase 2: Analysis Template</h1>
          <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>체크리스트 JSON을 붙여넣으면 자동으로 기본 정보가 채워집니다</p>

          <div style={{ marginTop: 16, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, border: `1px solid ${COLORS.border}` }}>
            <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)} placeholder='체크리스트에서 내보낸 JSON을 여기에 붙여넣으세요 {"brand_name": "...", ...}' rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`, background: "#1a1a2e", color: "#7ec8e3", fontSize: 13, fontFamily: "'Pretendard', monospace", outline: "none", resize: "none", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={importJSON}
                style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: imported ? COLORS.success : "#3498db", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
                {imported ? "✓ 가져오기 완료!" : "📥 JSON 가져오기"}
              </button>
              <button onClick={() => setShowExport(true)}
                style={{ padding: "8px 20px", borderRadius: 8, border: `1.5px solid ${COLORS.accent}`, background: "transparent", color: COLORS.accent, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
                📤 리포트 내보내기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "16px 0" }}>
          {ANALYSIS_SECTIONS.map((s, i) => (
            <button key={s.id} onClick={() => setActiveTab(i)}
              style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: i === activeTab ? "rgba(233,69,96,0.15)" : "rgba(255,255,255,0.03)", color: i === activeTab ? "#ff6b6b" : COLORS.muted, cursor: "pointer", fontSize: 13, fontWeight: i === activeTab ? 700 : 500, whiteSpace: "nowrap", fontFamily: "inherit", outline: i === activeTab ? `2px solid ${COLORS.accent}` : "none" }}>
              {s.icon} {s.title}
            </button>
          ))}
        </div>

        <div style={{ paddingBottom: 80 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>{sec.icon} {sec.title}</h2>
          {sec.description && <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 20px" }}>{sec.description}</p>}

          {sec.fields && sec.fields.map(f => renderField(f, data[f.id], v => update(f.id, v)))}

          {sec.id === "persona" && (
            <>
              {personas.map((p, i) => (
                <div key={i} style={{ background: COLORS.card, borderRadius: 16, padding: "20px 24px", marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: COLORS.accent }}>페르소나 {i + 1}</h3>
                  {sec.template.map(f => renderField(f, p[f.id], v => updateRepeatable("persona", i, f.id, v)))}
                </div>
              ))}
              <button onClick={() => addRepeatable("persona")}
                style={{ padding: "10px 20px", borderRadius: 10, border: `2px dashed ${COLORS.border}`, background: "transparent", color: COLORS.muted, cursor: "pointer", fontSize: 14, fontFamily: "inherit", width: "100%" }}>
                + 페르소나 추가
              </button>
            </>
          )}

          {sec.id === "competitor" && (
            <>
              {competitors.map((c, i) => (
                <div key={i} style={{ background: COLORS.card, borderRadius: 16, padding: "20px 24px", marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#3498db" }}>경쟁사 {i + 1}</h3>
                  {sec.template.map(f => renderField(f, c[f.id], v => updateRepeatable("competitor", i, f.id, v)))}
                </div>
              ))}
              <button onClick={() => addRepeatable("competitor")}
                style={{ padding: "10px 20px", borderRadius: 10, border: `2px dashed ${COLORS.border}`, background: "transparent", color: COLORS.muted, cursor: "pointer", fontSize: 14, fontFamily: "inherit", width: "100%" }}>
                + 경쟁사 추가
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
